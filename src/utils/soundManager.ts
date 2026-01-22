// Sound effects URLs (you can replace these with actual sound files or use Web Audio API)
export const SOUNDS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  achievement: '/sounds/achievement.mp3',
  notification: '/sounds/notification.mp3',
  explosion: '/sounds/explosion.mp3',
  collect: '/sounds/collect.mp3',
} as const;

class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize on first user interaction to comply with browser autoplay policies
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Generate simple sound effects using Web Audio API (no files needed!)
  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play different sound effects
  playClick() {
    this.createBeep(800, 0.05, 'square');
  }

  playSuccess() {
    if (!this.audioContext || !this.enabled) return;

    // Success: rising chord
    this.createBeep(523, 0.1, 'sine'); // C
    setTimeout(() => this.createBeep(659, 0.1, 'sine'), 80); // E
    setTimeout(() => this.createBeep(784, 0.15, 'sine'), 160); // G
  }

  playError() {
    if (!this.audioContext || !this.enabled) return;

    // Error: falling tone
    this.createBeep(400, 0.15, 'sawtooth');
    setTimeout(() => this.createBeep(300, 0.2, 'sawtooth'), 100);
  }

  playAchievement() {
    if (!this.audioContext || !this.enabled) return;

    // Achievement: happy melody
    this.createBeep(523, 0.1, 'triangle'); // C
    setTimeout(() => this.createBeep(659, 0.1, 'triangle'), 100); // E
    setTimeout(() => this.createBeep(784, 0.1, 'triangle'), 200); // G
    setTimeout(() => this.createBeep(1047, 0.3, 'triangle'), 300); // C high
  }

  playNotification() {
    if (!this.audioContext || !this.enabled) return;

    // Notification: two-tone beep
    this.createBeep(800, 0.1, 'sine');
    setTimeout(() => this.createBeep(1000, 0.1, 'sine'), 120);
  }

  playExplosion() {
    if (!this.audioContext || !this.enabled) return;

    // Explosion: noise burst
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 800;

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    source.start();
  }

  playCollect() {
    if (!this.audioContext || !this.enabled) return;

    // Collect: rising arpeggio
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => this.createBeep(freq, 0.08, 'triangle'), i * 40);
    });
  }

  // Deadpool-specific sounds
  playDeadpoolLaugh() {
    if (!this.audioContext || !this.enabled) return;

    // Chaotic laugh pattern
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = 300 + Math.random() * 400;
        this.createBeep(freq, 0.05, 'square');
      }, i * 100);
    }
  }

  playChimichangaSound() {
    if (!this.audioContext || !this.enabled) return;

    // Silly food sound
    this.createBeep(600, 0.05, 'sine');
    setTimeout(() => this.createBeep(700, 0.05, 'sine'), 50);
    setTimeout(() => this.createBeep(800, 0.1, 'sine'), 100);
  }

  playRandomEventSound() {
    if (!this.audioContext || !this.enabled) return;

    // Alert sound
    this.createBeep(1200, 0.08, 'square');
    setTimeout(() => this.createBeep(1200, 0.08, 'square'), 150);
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// React hook for sound management
import { useState, useEffect } from 'react';

export function useSoundManager() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('sound-enabled') !== 'false';
    }
    return true;
  });

  const [volume, setVolume] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return parseFloat(localStorage.getItem('sound-volume') || '0.5');
    }
    return 0.5;
  });

  useEffect(() => {
    soundManager.setEnabled(enabled);
    localStorage.setItem('sound-enabled', String(enabled));
  }, [enabled]);

  useEffect(() => {
    soundManager.setVolume(volume);
    localStorage.setItem('sound-volume', String(volume));
  }, [volume]);

  return {
    enabled,
    volume,
    toggleSound: () => setEnabled(!enabled),
    setVolume,
    soundManager,
  };
}
