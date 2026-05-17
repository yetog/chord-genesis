/**
 * SFX Layer Hook for Chord Genesis
 * Handles ambient textures, risers, impacts, and transition sounds
 * Uses Web Audio API for real-time synthesis
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// SFX Categories and Types
export type SFXCategory = 'ambient' | 'riser' | 'impact' | 'transition';

export interface SFXPreset {
  id: string;
  name: string;
  category: SFXCategory;
  description: string;
  duration?: number; // ms, undefined for looping
  color: string;
}

// Preset definitions
export const SFX_PRESETS: SFXPreset[] = [
  // Ambient Textures (looping)
  { id: 'ambient-pad', name: 'Warm Pad', category: 'ambient', description: 'Soft, warm background texture', color: '#8B5CF6' },
  { id: 'ambient-vinyl', name: 'Vinyl Crackle', category: 'ambient', description: 'Lo-fi vinyl noise', color: '#6366F1' },
  { id: 'ambient-rain', name: 'Soft Rain', category: 'ambient', description: 'Gentle rain ambience', color: '#3B82F6' },
  { id: 'ambient-space', name: 'Space Drift', category: 'ambient', description: 'Ethereal cosmic texture', color: '#EC4899' },
  { id: 'ambient-tape', name: 'Tape Hiss', category: 'ambient', description: 'Analog tape saturation', color: '#F59E0B' },

  // Risers (one-shot with duration)
  { id: 'riser-sweep', name: 'Filter Sweep', category: 'riser', description: 'Classic filter riser', duration: 4000, color: '#10B981' },
  { id: 'riser-noise', name: 'Noise Rise', category: 'riser', description: 'White noise build', duration: 4000, color: '#14B8A6' },
  { id: 'riser-pitch', name: 'Pitch Rise', category: 'riser', description: 'Ascending pitch sweep', duration: 3000, color: '#06B6D4' },
  { id: 'riser-tension', name: 'Tension Build', category: 'riser', description: 'Dramatic tension builder', duration: 6000, color: '#EF4444' },

  // Impacts (one-shot, short)
  { id: 'impact-boom', name: 'Deep Boom', category: 'impact', description: 'Sub-heavy impact', duration: 1500, color: '#DC2626' },
  { id: 'impact-hit', name: 'Cinematic Hit', category: 'impact', description: 'Orchestral hit', duration: 1200, color: '#F97316' },
  { id: 'impact-reverse', name: 'Reverse Cymbal', category: 'impact', description: 'Reversed crash', duration: 2000, color: '#FBBF24' },
  { id: 'impact-sub', name: 'Sub Drop', category: 'impact', description: '808-style sub drop', duration: 1000, color: '#A855F7' },

  // Transitions (one-shot)
  { id: 'trans-whoosh', name: 'Whoosh', category: 'transition', description: 'Smooth transition sweep', duration: 800, color: '#22D3EE' },
  { id: 'trans-glitch', name: 'Glitch Stutter', category: 'transition', description: 'Digital glitch effect', duration: 500, color: '#F472B6' },
  { id: 'trans-tape-stop', name: 'Tape Stop', category: 'transition', description: 'Vinyl slow-down', duration: 1500, color: '#FB923C' },
];

interface ActiveSFX {
  id: string;
  presetId: string;
  nodes: AudioNode[];
  isLooping: boolean;
}

export function useSFXLayer() {
  const [activeSFX, setActiveSFX] = useState<Map<string, ActiveSFX>>(new Map());
  const [sfxVolume, setSfxVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();

      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(sfxVolume, audioContextRef.current.currentTime);
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, [sfxVolume]);

  // Update master volume
  const updateVolume = useCallback((volume: number) => {
    setSfxVolume(volume);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, masterGainRef.current.context.currentTime);
    }
  }, []);

  // Generate ambient pad sound
  const createAmbientPad = useCallback((ctx: AudioContext, gain: GainNode) => {
    const nodes: AudioNode[] = [];

    // Create multiple detuned oscillators for warmth
    const frequencies = [130.81, 196.00, 261.63]; // C3, G3, C4

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.15 / frequencies.length, ctx.currentTime + 2);

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();

      nodes.push(osc, oscGain);
    });

    return nodes;
  }, []);

  // Generate vinyl crackle
  const createVinylCrackle = useCallback((ctx: AudioContext, gain: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Create crackle noise pattern
    for (let i = 0; i < bufferSize; i++) {
      // Mostly silence with occasional pops
      if (Math.random() > 0.997) {
        data[i] = (Math.random() - 0.5) * 0.8;
      } else if (Math.random() > 0.99) {
        data[i] = (Math.random() - 0.5) * 0.3;
      } else {
        data[i] = (Math.random() - 0.5) * 0.02;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0, ctx.currentTime);
    sourceGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.5);

    source.connect(filter);
    filter.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();

    return [source, filter, sourceGain];
  }, []);

  // Generate soft rain
  const createSoftRain = useCallback((ctx: AudioContext, gain: GainNode) => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() - 0.5) * 0.15;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass filter for rain character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0, ctx.currentTime);
    sourceGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1);

    source.connect(filter);
    filter.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();

    return [source, filter, sourceGain];
  }, []);

  // Generate space drift
  const createSpaceDrift = useCallback((ctx: AudioContext, gain: GainNode) => {
    const nodes: AudioNode[] = [];

    // Low drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(55, ctx.currentTime);

    // LFO for subtle movement
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(5, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(drone.frequency);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3);

    // Reverb simulation with delay
    const delay = ctx.createDelay(2);
    delay.delayTime.setValueAtTime(0.7, ctx.currentTime);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.4, ctx.currentTime);

    drone.connect(droneGain);
    droneGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    droneGain.connect(gain);
    delay.connect(gain);

    drone.start();
    lfo.start();

    nodes.push(drone, lfo, lfoGain, droneGain, delay, feedback);
    return nodes;
  }, []);

  // Generate tape hiss
  const createTapeHiss = useCallback((ctx: AudioContext, gain: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() - 0.5) * 0.08;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Warm filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, ctx.currentTime);

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0, ctx.currentTime);
    sourceGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();

    return [source, filter, sourceGain];
  }, []);

  // Generate filter sweep riser
  const createFilterSweep = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() - 0.5) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + duration / 1000);
    filter.Q.setValueAtTime(8, ctx.currentTime);

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0, ctx.currentTime);
    sourceGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
    sourceGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + duration / 1000 * 0.8);
    sourceGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

    source.connect(filter);
    filter.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();
    source.stop(ctx.currentTime + duration / 1000);

    return [source, filter, sourceGain];
  }, []);

  // Generate noise rise
  const createNoiseRise = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const bufferSize = ctx.sampleRate * (duration / 1000 + 1);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() - 0.5) * 0.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0, ctx.currentTime);
    sourceGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + duration / 1000);

    source.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();
    source.stop(ctx.currentTime + duration / 1000);

    return [source, sourceGain];
  }, []);

  // Generate pitch rise
  const createPitchRise = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + duration / 1000);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    oscGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + duration / 1000 * 0.9);
    oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);

    return [osc, oscGain];
  }, []);

  // Generate tension build
  const createTensionBuild = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const nodes: AudioNode[] = [];
    const durationSec = duration / 1000;

    // Multiple oscillators rising in pitch
    [1, 1.5, 2, 3].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(50 * mult, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400 * mult, ctx.currentTime + durationSec);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + durationSec * 0.5);
      oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + durationSec * 0.9);
      oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + durationSec);

      nodes.push(osc, oscGain);
    });

    return nodes;
  }, []);

  // Generate deep boom impact
  const createDeepBoom = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration / 1000);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);

    return [osc, oscGain];
  }, []);

  // Generate cinematic hit
  const createCinematicHit = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const nodes: AudioNode[] = [];

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() - 0.5) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, ctx.currentTime);

    // Sub layer
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration / 1000);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.7, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    noise.connect(noiseGain);
    noiseGain.connect(gain);
    sub.connect(subGain);
    subGain.connect(gain);

    noise.start();
    sub.start();
    sub.stop(ctx.currentTime + duration / 1000);

    nodes.push(noise, noiseGain, sub, subGain);
    return nodes;
  }, []);

  // Generate reverse cymbal
  const createReverseCymbal = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const bufferSize = ctx.sampleRate * (duration / 1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Reverse envelope noise
    for (let i = 0; i < bufferSize; i++) {
      const envelope = i / bufferSize;
      data[i] = (Math.random() - 0.5) * envelope * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(8000, ctx.currentTime + duration / 1000);

    const sourceGain = ctx.createGain();
    sourceGain.gain.setValueAtTime(0.5, ctx.currentTime);

    source.connect(filter);
    filter.connect(sourceGain);
    sourceGain.connect(gain);
    source.start();
    source.stop(ctx.currentTime + duration / 1000);

    return [source, filter, sourceGain];
  }, []);

  // Generate sub drop
  const createSubDrop = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration / 1000 * 0.3);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.9, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);

    return [osc, oscGain];
  }, []);

  // Generate whoosh
  const createWhoosh = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const bufferSize = ctx.sampleRate * (duration / 1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI);
      data[i] = (Math.random() - 0.5) * envelope * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + duration / 2000);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration / 1000);

    source.connect(filter);
    filter.connect(gain);
    source.start();
    source.stop(ctx.currentTime + duration / 1000);

    return [source, filter];
  }, []);

  // Generate glitch stutter
  const createGlitchStutter = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const nodes: AudioNode[] = [];
    const stutterCount = 8;
    const stutterDuration = duration / stutterCount / 1000;

    for (let i = 0; i < stutterCount; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200 + Math.random() * 800, ctx.currentTime + i * stutterDuration);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime + i * stutterDuration);
      oscGain.gain.setValueAtTime(0, ctx.currentTime + i * stutterDuration + stutterDuration * 0.8);

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime + i * stutterDuration);
      osc.stop(ctx.currentTime + (i + 1) * stutterDuration);

      nodes.push(osc, oscGain);
    }

    return nodes;
  }, []);

  // Generate tape stop
  const createTapeStop = useCallback((ctx: AudioContext, gain: GainNode, duration: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + duration / 1000);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);

    return [osc, oscGain];
  }, []);

  // Main play function
  const playSFX = useCallback(async (presetId: string): Promise<string> => {
    const ctx = await initAudioContext();
    const preset = SFX_PRESETS.find(p => p.id === presetId);
    if (!preset) throw new Error(`Unknown preset: ${presetId}`);

    // Create unique ID for this instance
    const instanceId = `${presetId}-${Date.now()}`;

    // Create gain node for this SFX
    const sfxGain = ctx.createGain();
    sfxGain.connect(masterGainRef.current!);

    let nodes: AudioNode[] = [sfxGain];
    let isLooping = false;

    // Create appropriate SFX
    switch (presetId) {
      case 'ambient-pad':
        nodes = [...nodes, ...createAmbientPad(ctx, sfxGain)];
        isLooping = true;
        break;
      case 'ambient-vinyl':
        nodes = [...nodes, ...createVinylCrackle(ctx, sfxGain)];
        isLooping = true;
        break;
      case 'ambient-rain':
        nodes = [...nodes, ...createSoftRain(ctx, sfxGain)];
        isLooping = true;
        break;
      case 'ambient-space':
        nodes = [...nodes, ...createSpaceDrift(ctx, sfxGain)];
        isLooping = true;
        break;
      case 'ambient-tape':
        nodes = [...nodes, ...createTapeHiss(ctx, sfxGain)];
        isLooping = true;
        break;
      case 'riser-sweep':
        nodes = [...nodes, ...createFilterSweep(ctx, sfxGain, preset.duration!)];
        break;
      case 'riser-noise':
        nodes = [...nodes, ...createNoiseRise(ctx, sfxGain, preset.duration!)];
        break;
      case 'riser-pitch':
        nodes = [...nodes, ...createPitchRise(ctx, sfxGain, preset.duration!)];
        break;
      case 'riser-tension':
        nodes = [...nodes, ...createTensionBuild(ctx, sfxGain, preset.duration!)];
        break;
      case 'impact-boom':
        nodes = [...nodes, ...createDeepBoom(ctx, sfxGain, preset.duration!)];
        break;
      case 'impact-hit':
        nodes = [...nodes, ...createCinematicHit(ctx, sfxGain, preset.duration!)];
        break;
      case 'impact-reverse':
        nodes = [...nodes, ...createReverseCymbal(ctx, sfxGain, preset.duration!)];
        break;
      case 'impact-sub':
        nodes = [...nodes, ...createSubDrop(ctx, sfxGain, preset.duration!)];
        break;
      case 'trans-whoosh':
        nodes = [...nodes, ...createWhoosh(ctx, sfxGain, preset.duration!)];
        break;
      case 'trans-glitch':
        nodes = [...nodes, ...createGlitchStutter(ctx, sfxGain, preset.duration!)];
        break;
      case 'trans-tape-stop':
        nodes = [...nodes, ...createTapeStop(ctx, sfxGain, preset.duration!)];
        break;
    }

    // Track active SFX
    const sfxData: ActiveSFX = { id: instanceId, presetId, nodes, isLooping };
    setActiveSFX(prev => new Map(prev).set(instanceId, sfxData));

    // Auto-cleanup for one-shots
    if (!isLooping && preset.duration) {
      setTimeout(() => {
        stopSFX(instanceId);
      }, preset.duration + 100);
    }

    return instanceId;
  }, [initAudioContext, createAmbientPad, createVinylCrackle, createSoftRain, createSpaceDrift, createTapeHiss, createFilterSweep, createNoiseRise, createPitchRise, createTensionBuild, createDeepBoom, createCinematicHit, createReverseCymbal, createSubDrop, createWhoosh, createGlitchStutter, createTapeStop]);

  // Stop specific SFX
  const stopSFX = useCallback((instanceId: string) => {
    setActiveSFX(prev => {
      const newMap = new Map(prev);
      const sfx = newMap.get(instanceId);
      if (sfx) {
        sfx.nodes.forEach(node => {
          try {
            if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
              node.stop();
            }
            node.disconnect();
          } catch (e) {
            // Already stopped
          }
        });
        newMap.delete(instanceId);
      }
      return newMap;
    });
  }, []);

  // Stop all SFX
  const stopAllSFX = useCallback(() => {
    activeSFX.forEach((sfx, id) => {
      sfx.nodes.forEach(node => {
        try {
          if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
            node.stop();
          }
          node.disconnect();
        } catch (e) {
          // Already stopped
        }
      });
    });
    setActiveSFX(new Map());
  }, [activeSFX]);

  // Toggle ambient SFX (for ambient category)
  const toggleAmbient = useCallback(async (presetId: string) => {
    // Check if this ambient is already playing
    const existing = Array.from(activeSFX.values()).find(
      sfx => sfx.presetId === presetId && sfx.isLooping
    );

    if (existing) {
      stopSFX(existing.id);
    } else {
      await playSFX(presetId);
    }
  }, [activeSFX, playSFX, stopSFX]);

  // Check if a preset is currently active
  const isPresetActive = useCallback((presetId: string): boolean => {
    return Array.from(activeSFX.values()).some(sfx => sfx.presetId === presetId);
  }, [activeSFX]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSFX();
    };
  }, []);

  return {
    playSFX,
    stopSFX,
    stopAllSFX,
    toggleAmbient,
    isPresetActive,
    activeSFX: Array.from(activeSFX.values()),
    sfxVolume,
    setSfxVolume: updateVolume,
    presets: SFX_PRESETS,
  };
}
