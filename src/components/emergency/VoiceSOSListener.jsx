import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, CheckCircle2, Radio, Info } from 'lucide-react';

export const EMERGENCY_KEYWORDS = [
  // English Keywords
  'help',
  'emergency',
  'doctor',
  'save me',
  'chest pain',
  'heart attack',
  'cannot breathe',
  'difficulty breathing',
  'ambulance',
  'accident',
  'bleeding',
  'unconscious',
  
  // Hindi (Devanagari)
  'बचाओ',
  'मदद',
  'मदद करो',
  'सीने में दर्द',
  'सांस नहीं आ रही',
  'एंबुलेंस',
  'डॉक्टर',
  'सहायता',
  'चोट',
  'बेहोश',
  'दुर्घटना',
  'दिल का दौरा',

  // Romanized Hindi / Hinglish Phonetics
  'bachao',
  'madad',
  'madad karo',
  'seene me dard',
  'chhati me dard',
  'saans phool rahi',
  'sahayata',
  'chot',
  'behosh',
  'hart attack'
];

export const VoiceSOSListener = () => {
  const { startSosCountdown, countdown, isSosActive } = useEmergency();
  const { lang, t } = useLanguage();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedKeyword, setMatchedKeyword] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState([30, 60, 45, 80, 50, 65]);

  const recognitionRef = useRef(null);

  // Verbal speech synthesis feedback on keyword detection
  const speakFeedback = useCallback((keyword) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = lang === 'hi'
          ? `आपातकालीन शब्द ${keyword} पहचाना गया। एसओएस सहायता भेजी जा रही है।`
          : `Emergency keyword ${keyword} detected. Dispathing SOS assistance.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis feedback notice:', err);
      }
    }
  }, [lang]);

  // Periodic waveform animation when listening
  useEffect(() => {
    let interval = null;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(20 + Math.random() * 70),
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(25 + Math.random() * 75),
          Math.floor(35 + Math.random() * 60),
          Math.floor(20 + Math.random() * 80)
        ]);
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      const lower = currentText.toLowerCase().trim();
      setTranscript(lower);

      // Check for emergency keywords
      const matched = EMERGENCY_KEYWORDS.find(kw => lower.includes(kw.toLowerCase()));
      if (matched) {
        setMatchedKeyword(matched);
        speakFeedback(matched);
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
        setIsListening(false);
        startSosCountdown(`Voice SOS Keyword ("${matched}")`, {
          voiceTranscript: lower,
          chiefComplaint: `Voice SOS Triggered: "${matched}" - "${lower}"`
        });
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition warning:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setErrorMessage(
          lang === 'hi'
            ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
            : 'Microphone permission denied. Please allow microphone access in browser settings.'
        );
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto restart continuous listening if still active
      if (isListening && countdown === null && !isSosActive) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [lang, countdown, isSosActive, startSosCountdown, speakFeedback]);

  const toggleListening = () => {
    if (!isSupported) {
      setErrorMessage(
        lang === 'hi'
          ? 'आपका ब्राउज़र वेब स्पीच एपीआई का समर्थन नहीं करता है (Chrome / Edge अनुशंसित)।'
          : 'Web Speech API is not supported in this browser (Chrome / Edge recommended).'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      setErrorMessage('');
      setMatchedKeyword(null);
      setTranscript('');
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Recognition start notice:', err);
        }
      }
    }
  };

  // Simulation for instant testing without voice
  const simulateVoiceTrigger = (keyword = 'Bachao') => {
    setTranscript(`"${keyword}! Seene me bahut dard ho raha hai..."`);
    setMatchedKeyword(keyword);
    setIsListening(true);
    speakFeedback(keyword);
    setTimeout(() => {
      startSosCountdown(`Voice SOS Keyword ("${keyword}")`, {
        voiceTranscript: `${keyword}! Seene me bahut dard ho raha hai...`,
        chiefComplaint: `Voice SOS Triggered: "${keyword}"`
      });
    }, 500);
  };

  return (
    <div
      className="card"
      style={{
        border: isListening ? '2px solid var(--emergency-500)' : '1.5px solid var(--slate-200)',
        background: isListening ? 'rgba(254, 242, 242, 0.85)' : 'var(--surface-card)',
        transition: 'all 0.3s ease',
        boxShadow: isListening ? '0 4px 20px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: isListening ? 'var(--emergency-600)' : 'var(--primary-100)',
              color: isListening ? 'white' : 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            {isListening ? <Mic size={24} className="pulse-alert" /> : <Volume2 size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                {t('voiceSosTitle')}
              </h4>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Web Speech API
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              {lang === 'hi'
                ? 'बोले गए शब्द पहचानकर तुरंत एसओएस अलार्म सक्रिय करता है (जैसे: "बचाओ", "मदद", "Help")'
                : 'Hands-free voice recognition triggers SOS on distress keywords ("Help", "Emergency", "Bachao")'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={toggleListening}
            className={`btn ${isListening ? 'btn-emergency' : 'btn-outline'} btn-sm`}
            style={{ fontWeight: 700, gap: '0.4rem' }}
          >
            {isListening ? (
              <>
                <MicOff size={16} />
                {lang === 'hi' ? 'सुनना बंद करें' : 'Stop Listening'}
              </>
            ) : (
              <>
                <Mic size={16} />
                {lang === 'hi' ? 'आवाज़ पहचान चालू करें' : 'Activate Voice SOS'}
              </>
            )}
          </button>

          {/* Quick simulation button for demo */}
          <button
            onClick={() => simulateVoiceTrigger(lang === 'hi' ? 'बचाओ' : 'Help')}
            className="btn btn-secondary btn-sm"
            title="Simulate speaking emergency keyword"
            style={{ fontSize: '0.78rem', gap: '0.35rem' }}
          >
            <Sparkles size={14} color="var(--emergency-600)" />
            {lang === 'hi' ? 'डेमो बोलें ("बचाओ")' : 'Test Voice ("Help")'}
          </button>
        </div>
      </div>

      {/* Active Listening HUD Waveform */}
      {isListening && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'white',
            border: '1px solid var(--emergency-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Dynamic Amplitude Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '26px' }}>
              {audioLevel.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: `${Math.max(6, (h / 100) * 26)}px`,
                    background: 'var(--emergency-500)',
                    borderRadius: '2px',
                    transition: 'height 0.15s ease'
                  }}
                />
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={14} color="var(--emergency-600)" className="pulse-alert" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--emergency-700)' }}>
                  {lang === 'hi' ? 'माइक्रोफ़ोन सक्रिय - आपातकालीन शब्दों की प्रतीक्षा है...' : 'Listening for Emergency Distress Phrases...'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                {transcript ? (
                  <span style={{ fontStyle: 'italic', fontWeight: 600 }}>"{transcript}"</span>
                ) : (
                  <span>
                    {lang === 'hi'
                      ? 'स्वीकृत शब्द: "बचाओ", "मदद", "सीने में दर्द", "एंबुलेंस", "Help", "Emergency"...'
                      : 'Recognized: "Help", "Emergency", "Chest pain", "Cannot breathe", "Bachao", "Madad"...'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {matchedKeyword && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--emergency-700)',
                background: 'var(--emergency-100)',
                border: '1px solid var(--emergency-300)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{lang === 'hi' ? `पहचाना गया: "${matchedKeyword}"` : `Keyword: "${matchedKeyword}"`}</span>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--emergency-50)',
            border: '1px solid var(--emergency-200)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--emergency-700)',
            fontSize: '0.8rem'
          }}
        >
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

