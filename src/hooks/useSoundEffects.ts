import { useCallback, useRef } from 'react';

// Sound effect frequencies and patterns inspired by classic RPG UI sounds
const SOUND_CONFIGS = {
  click: { frequency: 800, duration: 0.05, type: 'sine' as OscillatorType },
  hover: { frequency: 600, duration: 0.03, type: 'sine' as OscillatorType },
  success: { frequencies: [523.25, 659.25, 783.99], duration: 0.15, type: 'sine' as OscillatorType },
  generate: { frequency: 440, duration: 0.1, type: 'triangle' as OscillatorType, sweep: true },
  complete: { frequencies: [392, 523.25, 659.25, 783.99], duration: 0.2, type: 'sine' as OscillatorType },
  toggle: { frequency: 700, duration: 0.04, type: 'square' as OscillatorType },
  error: { frequency: 200, duration: 0.15, type: 'sawtooth' as OscillatorType },
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.1
  ) => {
    if (!enabledRef.current) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Envelope for smoother sound
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    const config = SOUND_CONFIGS.click;
    playTone(config.frequency, config.duration, config.type, 0.08);
  }, [playTone]);

  const playHover = useCallback(() => {
    const config = SOUND_CONFIGS.hover;
    playTone(config.frequency, config.duration, config.type, 0.04);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (!enabledRef.current) return;

    const config = SOUND_CONFIGS.success;
    config.frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, config.duration, config.type, 0.1);
      }, i * 100);
    });
  }, [playTone]);

  const playGenerate = useCallback(() => {
    if (!enabledRef.current) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Generate sound failed:', e);
    }
  }, [getAudioContext]);

  const playComplete = useCallback(() => {
    if (!enabledRef.current) return;

    const config = SOUND_CONFIGS.complete;
    config.frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, config.duration, config.type, 0.12);
      }, i * 120);
    });
  }, [playTone]);

  const playToggle = useCallback(() => {
    const config = SOUND_CONFIGS.toggle;
    playTone(config.frequency, config.duration, config.type, 0.06);
  }, [playTone]);

  const playError = useCallback(() => {
    const config = SOUND_CONFIGS.error;
    playTone(config.frequency, config.duration, config.type, 0.1);
  }, [playTone]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    playClick,
    playHover,
    playSuccess,
    playGenerate,
    playComplete,
    playToggle,
    playError,
    setEnabled,
    isEnabled
  };
};

export default useSoundEffects;
