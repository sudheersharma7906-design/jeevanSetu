import React, { useEffect, useRef, useState } from 'react';
import { MapPin as PinIcon, Navigation, ExternalLink, Clock, ShieldCheck, Layers, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { GeolocationService } from '../../services/geolocationService';

export const MapPin = ({
  patientCoords = { lat: 27.5644, lng: 80.6829 },
  rmpCoords = { lat: 27.5750, lng: 80.6950 },
  patientName = 'Rameshwar Sharma',
  rmpName = 'Dr. Anand Verma (RMP)',
  distance: customDistance = null,
  eta: customEta = null,
  height = '340px',
  onLocationUpdate = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { lang } = useLanguage();

  // Layer options: 'google' (Google Roadmap) | 'google_hybrid' (Google Satellite) | 'osm' (OpenStreetMap)
  const [mapLayer, setMapLayer] = useState('google');
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const activePatientCoords = liveLocation?.coords || patientCoords;

  // Auto calculate dynamic distance & ETA if not manually provided
  const computedDistance = GeolocationService.calculateDistanceKm(
    rmpCoords.lat,
    rmpCoords.lng,
    activePatientCoords.lat,
    activePatientCoords.lng
  );
  const distance = customDistance || `${computedDistance} km`;
  const eta = customEta || GeolocationService.estimateEtaMinutes(computedDistance);

  // Google Maps URLs
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${rmpCoords.lat},${rmpCoords.lng}&destination=${activePatientCoords.lat},${activePatientCoords.lng}&travelmode=driving`;
  const googleMapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${activePatientCoords.lat},${activePatientCoords.lng}`;

  const handleShareRealLocation = async () => {
    setIsLocating(true);
    setLocationStatus(lang === 'hi' ? 'जीपीएस लोकेशन प्राप्त की जा रही है...' : 'Acquiring real GPS location...');
    try {
      const geo = await GeolocationService.getCurrentPosition({ timeout: 10000 });
      if (geo && geo.latitude) {
        const coords = { lat: geo.latitude, lng: geo.longitude };
        setLiveLocation({
          coords,
          address: geo.address,
          accuracy: geo.accuracy,
          isFallback: geo.isFallback
        });
        setLocationStatus(
          geo.isFallback
            ? (lang === 'hi' ? 'डिफ़ॉल्ट ग्रामीण जीपीएस' : 'Default Rural GPS')
            : (lang === 'hi' ? `सटीक जीपीएस प्राप्त! (±${geo.accuracy}m)` : `Live GPS Acquired (±${geo.accuracy}m)`)
        );

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([geo.latitude, geo.longitude], 15);
        }
        if (onLocationUpdate) {
          onLocationUpdate({
            coordinates: coords,
            address: geo.address,
            accuracy: geo.accuracy
          });
        }
      }
    } catch (err) {
      setLocationStatus(lang === 'hi' ? 'जीपीएस त्रुटि।' : 'GPS acquisition failed.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;

        if (!mapContainerRef.current || !isMounted) return;

        // Safe cleanup existing map if any
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }

        const centerLat = (activePatientCoords.lat + rmpCoords.lat) / 2;
        const centerLng = (activePatientCoords.lng + rmpCoords.lng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false
        });

        // Add Tile Layer (Google Maps Standard, Google Maps Hybrid, or OpenStreetMap)
        let tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        let attribution = '&copy; Google Maps';

        if (mapLayer === 'google_hybrid') {
          tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
          attribution = '&copy; Google Maps Satellite & Hybrid';
        } else if (mapLayer === 'osm') {
          tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          attribution = '&copy; OpenStreetMap contributors';
        }

        L.tileLayer(tileUrl, { attribution, maxZoom: 20 }).addTo(map);

        // Custom Patient Icon (Red Emergency Pulsing Pin)
        const patientIcon = L.divIcon({
          className: 'custom-patient-marker',
          html: `
            <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
              <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position:relative; width:34px; height:34px; background:#ef4444; border:2.5px solid white; border-radius:50%; box-shadow:0 0 16px rgba(239,68,68,0.8); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
                🚨
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        // Custom RMP Responder Icon (Teal Healthcare Pin)
        const rmpIcon = L.divIcon({
          className: 'custom-rmp-marker',
          html: `
            <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
              <div style="position:relative; width:34px; height:34px; background:#0d9488; border:2.5px solid white; border-radius:50%; box-shadow:0 0 16px rgba(13,148,136,0.8); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
                🏥
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        // Add 3km Emergency Coverage Radius circle around patient
        L.circle([patientCoords.lat, patientCoords.lng], {
          radius: 2400,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 1,
          dashArray: '4, 4'
        }).addTo(map);

        // Markers
        L.marker([patientCoords.lat, patientCoords.lng], { icon: patientIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; padding:4px;">
              <b style="color:#dc2626;">🚨 Emergency Patient</b><br/>
              <b>${patientName}</b><br/>
              <span style="font-size:11px; color:#64748b;">GPS: ${patientCoords.lat.toFixed(4)}, ${patientCoords.lng.toFixed(4)}</span>
            </div>
          `)
          .openPopup();

        L.marker([rmpCoords.lat, rmpCoords.lng], { icon: rmpIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; padding:4px;">
              <b style="color:#0f766e;">🏥 First Responder (RMP)</b><br/>
              <b>${rmpName}</b><br/>
              <span style="font-size:11px; color:#64748b;">Distance: ${distance} (${eta})</span>
            </div>
          `);

        // Polyline connecting Responder to Patient
        const midLat = centerLat + 0.003;
        const midLng = centerLng - 0.002;
        L.polyline(
          [
            [rmpCoords.lat, rmpCoords.lng],
            [midLat, midLng],
            [patientCoords.lat, patientCoords.lng]
          ],
          {
            color: '#0d9488',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8'
          }
        ).addTo(map);

        // Auto fit bounds to enclose both markers comfortably
        map.fitBounds(
          [
            [patientCoords.lat, patientCoords.lng],
            [rmpCoords.lat, rmpCoords.lng]
          ],
          { padding: [45, 45], maxZoom: 15 }
        );

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Leaflet map rendering warning:', err);
      }
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [patientCoords, rmpCoords, patientName, rmpName, mapLayer, distance, eta]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Map Viewport Container */}
      <div
        style={{
          position: 'relative',
          height,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1.5px solid var(--slate-200)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Top Control Bar: Layer Switcher */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            gap: '0.35rem',
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
          }}
        >
          <button
            onClick={() => setMapLayer('google')}
            style={{
              background: mapLayer === 'google' ? 'var(--primary-600)' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🗺️ Google Maps
          </button>
          <button
            onClick={() => setMapLayer('google_hybrid')}
            style={{
              background: mapLayer === 'google_hybrid' ? 'var(--primary-600)' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapLayer('osm')}
            style={{
              background: mapLayer === 'osm' ? 'var(--primary-600)' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            OSM
          </button>
        </div>

        {/* Floating Distance & ETA Overlay Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.9)',
            color: 'white',
            backdropFilter: 'blur(8px)',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={14} color="#2dd4bf" />
            <span style={{ fontWeight: 700 }}>{distance}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="#fbbf24" />
            <span>{eta}</span>
          </div>
        </div>

        {/* Direct Google Maps Navigation Button */}
        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #4285F4, #1a73e8)',
            color: 'white',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(26, 115, 232, 0.4)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <ExternalLink size={14} />
          <span>{lang === 'hi' ? 'गूगल मैप्स में खोलें' : 'Google Maps Route'}</span>
        </a>
      </div>

      {/* Emergency GPS Metadata & Share Real Location Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          background: 'var(--slate-50)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <PinIcon size={16} color="var(--emergency-600)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            {lang === 'hi'
              ? `मरीज़ जीपीएस: ${patientName} (${activePatientCoords.lat.toFixed(4)}, ${activePatientCoords.lng.toFixed(4)})`
              : `Patient GPS: ${patientName} (${activePatientCoords.lat.toFixed(4)}, ${activePatientCoords.lng.toFixed(4)})`}
          </span>
          {locationStatus && (
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              {locationStatus}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleShareRealLocation}
            disabled={isLocating}
            className="btn btn-secondary btn-sm"
            style={{
              fontWeight: 700,
              fontSize: '0.78rem',
              gap: '0.35rem',
              color: 'var(--primary-800)',
              background: 'var(--primary-100)',
              border: '1px solid var(--primary-300)'
            }}
          >
            <Navigation size={14} className={isLocating ? 'spin' : ''} />
            <span>{isLocating ? (lang === 'hi' ? 'खोजा जा रहा है...' : 'Locating...') : (lang === 'hi' ? '📍 मेरी लाइव लोकेशन अपडेट करें' : '📍 Share Real Live GPS')}</span>
          </button>

          <a
            href={googleMapsPinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 700, fontSize: '0.78rem', gap: '0.35rem' }}
          >
            <ExternalLink size={14} />
            <span>{lang === 'hi' ? 'गूगल मैप्स पिन' : 'Google Maps Pin'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

