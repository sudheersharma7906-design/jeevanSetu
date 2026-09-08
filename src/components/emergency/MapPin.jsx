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
  height = '340px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { lang } = useLanguage();
  const [mapLayer, setMapLayer] = useState('osm'); // 'osm' | 'satellite'

  // Auto calculate dynamic distance & ETA if not manually provided
  const computedDistance = GeolocationService.calculateDistanceKm(
    rmpCoords.lat,
    rmpCoords.lng,
    patientCoords.lat,
    patientCoords.lng
  );
  const distance = customDistance || `${computedDistance} km`;
  const eta = customEta || GeolocationService.estimateEtaMinutes(computedDistance);

  // Google Maps Turn-by-Turn URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${rmpCoords.lat},${rmpCoords.lng}&destination=${patientCoords.lat},${patientCoords.lng}&travelmode=driving`;

  useEffect(() => {
    let isMounted = true;

    const initLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;

        if (!mapContainerRef.current || !isMounted) return;

        // Cleanup existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const centerLat = (patientCoords.lat + rmpCoords.lat) / 2;
        const centerLng = (patientCoords.lng + rmpCoords.lng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true
        });

        // Add Tile Layer based on layer selection
        const tileUrl = mapLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const attribution = mapLayer === 'satellite'
          ? '&copy; Esri World Imagery'
          : '&copy; OpenStreetMap contributors';

        L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

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
        mapInstanceRef.current.remove();
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
            gap: '0.4rem',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(6px)'
          }}
        >
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
            OSM Map
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            style={{
              background: mapLayer === 'satellite' ? 'var(--primary-600)' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Satellite
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

        {/* Direct Google Maps Turn-by-Turn Button */}
        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 1000,
            background: 'var(--primary-600)',
            color: 'white',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <ExternalLink size={14} />
          <span>{lang === 'hi' ? 'Google मैप्स में खोलें' : 'Google Maps Route'}</span>
        </a>
      </div>

      {/* Emergency GPS Metadata Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PinIcon size={16} color="var(--emergency-600)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            {lang === 'hi'
              ? `मरीज़: ${patientName} (${patientCoords.lat.toFixed(4)}, ${patientCoords.lng.toFixed(4)})`
              : `Patient: ${patientName} (${patientCoords.lat.toFixed(4)}, ${patientCoords.lng.toFixed(4)})`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="var(--primary-600)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
            {lang === 'hi' ? `आरएमपी: ${rmpName}` : `Responder: ${rmpName}`}
          </span>
        </div>
      </div>
    </div>
  );
};

