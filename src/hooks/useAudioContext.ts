import { useState, useRef, useCallback } from 'react';
import { Chord } from '../types/music';

export function useAudioContext() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  const playChord = useCallback(async (chord: Chord, duration: number = 2000, preview: boolean = false) => {
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

    // Create oscillators for each note in the chord
    chord.midiNotes.forEach((midiNote, index) => {
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Enhanced legato envelope for smoother playback
      const volume = (preview ? 0.03 : 0.08) / chord.midiNotes.length;
      const attackTime = preview ? 0.01 : 0.02;
      const sustainTime = duration / 1000 - (preview ? 0.1 : 0.3);
      const releaseTime = preview ? 0.08 : 0.25;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      // Smooth attack
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attackTime);
      // Sustain at slightly reduced volume for legato effect
      gainNode.gain.linearRampToValueAtTime(volume * 0.85, audioContext.currentTime + sustainTime);
      // Gentle release for smooth transitions
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + sustainTime + releaseTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sustainTime + releaseTime);
      
      oscillatorsRef.current.push(oscillator);
    });
  }, [initAudioContext]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const playProgression = useCallback(async (chords: Chord[]) => {
    const chordDuration = (60 / tempo) * 1000 * 2; // 2 beats per chord
    
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
      playChord(chords[index], chordDuration * 0.9); // Slightly overlap for legato

      timeoutRef.current = setTimeout(() => {
        playNextChord(index + 1);
      }, chordDuration);
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
    setTempo,
    toggleLoop,
    playChord,
    playChordPreview,
    playProgression,
    stopPlayback
  };
}