import { useState, useRef, useCallback } from 'react';
import { Chord } from '../types/music';
import { RHYTHM_PATTERNS } from '../utils/rhythmPatterns';

export function useAudioContext() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.6); // 60% default volume
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain control
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(masterVolume, audioContextRef.current.currentTime);
      
      // Create compressor to prevent clipping
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
      compressorRef.current.knee.setValueAtTime(30, audioContextRef.current.currentTime);
      compressorRef.current.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressorRef.current.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
      compressorRef.current.release.setValueAtTime(0.25, audioContextRef.current.currentTime);
      
      // Connect: compressor -> master gain -> destination
      compressorRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  const updateMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, masterGainRef.current.context.currentTime);
    }
  }, []);

  const playChord = useCallback(async (
    chord: Chord, 
    duration: number = 2000, 
    preview: boolean = false,
    rhythmPattern: string = 'Block Chord'
  ) => {
    const audioContext = await initAudioContext();
    
    // Stop any currently playing oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    oscillatorsRef.current = [];

    // Get rhythm pattern data
    const pattern = RHYTHM_PATTERNS.find(p => p.name === rhythmPattern) || RHYTHM_PATTERNS[0];
    
    // Prepare notes based on rhythm pattern
    let notesToPlay = [...chord.midiNotes];
    
    // Handle special rhythm patterns
    if (pattern.name === 'Down Arpeggio') {
      notesToPlay = [...chord.midiNotes].reverse();
    } else if (pattern.name === 'Broken Chord' && chord.midiNotes.length >= 3) {
      // Root, fifth, third pattern (reorder notes)
      const root = chord.midiNotes[0];
      const third = chord.midiNotes[1];
      const fifth = chord.midiNotes[2];
      const seventh = chord.midiNotes[3];
      notesToPlay = [root, fifth, third, seventh].filter(Boolean);
    } else if (pattern.name === 'Waltz' && chord.midiNotes.length >= 3) {
      // Root alone, then chord
      const root = chord.midiNotes[0];
      const upperNotes = chord.midiNotes.slice(1);
      notesToPlay = [root, ...upperNotes, ...upperNotes];
    }

    // Create oscillators for each note with rhythm timing
    notesToPlay.forEach((midiNote, index) => {
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(compressorRef.current!);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Calculate timing based on rhythm pattern
      const timingIndex = Math.min(index, pattern.noteTimings.length - 1);
      const durationIndex = Math.min(index, pattern.noteDurations.length - 1);
      
      const startDelay = pattern.noteTimings[timingIndex] * (duration / 1000) * 0.8; // 80% of chord duration for timing
      const noteDuration = pattern.noteDurations[durationIndex] * (duration / 1000);
      
      // Much lower volume levels to prevent clipping
      const baseVolume = preview ? 0.015 : 0.03; // Increased base volume since we have user control
      const volume = baseVolume / Math.max(notesToPlay.length, 1);
      const attackTime = preview ? 0.01 : 0.02;
      const sustainTime = noteDuration - (preview ? 0.1 : 0.3);
      const releaseTime = preview ? 0.15 : 0.8;
      
      const startTime = audioContext.currentTime + startDelay;
      
      gainNode.gain.setValueAtTime(0, startTime);
      // Smooth attack
      gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
      // Sustain at reduced volume for legato effect
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + sustainTime);
      // Very gentle exponential release
      gainNode.gain.setTargetAtTime(0, startTime + sustainTime, releaseTime / 3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + sustainTime + releaseTime + 0.5); // Extended overlap
      
      oscillatorsRef.current.push(oscillator);
    });
  }, [initAudioContext]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const playProgression = useCallback(async (chords: Chord[], rhythmPattern: string = 'Block Chord') => {
    const chordDuration = (60 / tempo) * 1000 * 1.8; // Slightly faster for smoother flow
    
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    setIsPlaying(true);
    setCurrentChordIndex(0);

    const playNextChord = (index: number) => {
      if (index >= chords.length) {
        if (isLooping) {
          // Reset to beginning for loop
          setCurrentChordIndex(0);
          playNextChord(0);
          return;
        } else {
          // Stop playback
          setIsPlaying(false);
          setCurrentChordIndex(-1);
          return;
        }
      }

      setCurrentChordIndex(index);
      playChord(chords[index], chordDuration * 1.1, false, rhythmPattern); // Extended duration for smooth overlap

      timeoutRef.current = setTimeout(() => {
        playNextChord(index + 1);
      }, chordDuration * 0.85); // Shorter gap between chord changes
    };

    playNextChord(0);
  }, [isPlaying, playChord, tempo, isLooping]);

  const playChordPreview = useCallback(async (chord: Chord) => {
    await playChord(chord, 1000, true);
  }, [playChord]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentChordIndex(-1);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    oscillatorsRef.current = [];
  }, []);

  return {
    isPlaying,
    isLooping,
    currentChordIndex,
    tempo,
    masterVolume,
    setTempo,
    setMasterVolume: updateMasterVolume,
    toggleLoop,
    playChord,
    playChordPreview,
    playProgression,
    stopPlayback
  };
}