// Web Audio API Sound Generator for JivanSetu
// Zero external audio files required, guarantees instant, latency-free playback

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.sirenInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Beep sound for countdown tick (1-5s)
  playCountdownBeep(frequency = 880, duration = 0.12) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Emergency Siren trigger
  playEmergencySiren() {
    try {
      this.init();
      if (!this.ctx) return;

      this.stopSiren();

      let toggle = false;
      const playPulse = () => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(toggle ? 960 : 640, this.ctx.currentTime);
        toggle = !toggle;

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.38);
      };

      playPulse();
      this.sirenInterval = setInterval(playPulse, 400);

      // Auto stop after 5 seconds to not disturb
      setTimeout(() => {
        this.stopSiren();
      }, 5000);
    } catch (e) {
      console.warn('Siren playback error:', e);
    }
  }

  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }

  // Success Chime
  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.32);
      });
    } catch (e) {
      console.warn('Success chime error:', e);
    }
  }
}

export const soundManager = new SoundEffects();
