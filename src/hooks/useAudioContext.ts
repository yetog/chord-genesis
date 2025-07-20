import { useState, useRef, useCallback } from 'react';
import { Chord } from '../types/music';
import { RHYTHM_PATTERNS } from '../utils/rhythmPatterns';

export function useAudioContext() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.8); // 80% default volume
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
    rhythmPattern: string = 'Block Chord',
    instrumentType: string = 'sine'
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
      
      // Create different instrument sounds
      const createInstrumentSound = (freq: number, startTime: number, noteDuration: number) => {
        const oscillators: OscillatorNode[] = [];
        const gainNodes: GainNode[] = [];
        
        switch (instrumentType) {
          case 'warm-pad': {
            // Create 3 slightly detuned oscillators for chorus effect
            const detuneValues = [0, -8, 8]; // cents
            const waveTypes: OscillatorType[] = ['triangle', 'sawtooth', 'triangle'];
            
            detuneValues.forEach((detune, i) => {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              
              osc.type = waveTypes[i];
              osc.frequency.setValueAtTime(freq, startTime);
              osc.detune.setValueAtTime(detune, startTime);
              
              osc.connect(gain);
              gain.connect(compressorRef.current!);
              
              oscillators.push(osc);
              gainNodes.push(gain);
            });
            break;
          }
          
          case 'organ': {
            // Create harmonic series like organ drawbars
            const harmonics = [1, 2, 1.5, 4, 2.67, 8]; // Fundamental, octave, fifth, 2nd octave, etc.
            const volumes = [0.8, 0.6, 0.4, 0.3, 0.2, 0.15]; // Relative volumes
            
            harmonics.forEach((harmonic, i) => {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq * harmonic, startTime);
              
              osc.connect(gain);
              gain.connect(compressorRef.current!);
              
              // Set relative volume for this harmonic
              const harmonicVolume = volumes[i] || 0.1;
              gain.gain.setValueAtTime(0, startTime);
              
              oscillators.push(osc);
              gainNodes.push(gain);
            });
            break;
          }
          
          default: // 'sine' or fallback
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            osc.connect(gain);
            gain.connect(compressorRef.current!);
            
            oscillators.push(osc);
            gainNodes.push(gain);
            break;
        }
        
        return { oscillators, gainNodes };
      };
      
      // Calculate timing based on rhythm pattern
      const timingIndex = Math.min(index, pattern.noteTimings.length - 1);
      const durationIndex = Math.min(index, pattern.noteDurations.length - 1);
      
      const startDelay = pattern.noteTimings[timingIndex] * (duration / 1000) * 0.8; // 80% of chord duration for timing
      const noteDuration = pattern.noteDurations[durationIndex] * (duration / 1000);
      
      // Much lower volume levels to prevent clipping
      const baseVolume = preview ? 0.025 : 0.05; // Further increased
      const volume = baseVolume / Math.max(notesToPlay.length, 1);
      const attackTime = preview ? 0.01 : 0.02;
      const sustainTime = noteDuration - (preview ? 0.1 : 0.3);
      const releaseTime = preview ? 0.2 : 1.5; // Even longer release for ultra-smooth transitions
      
      const startTime = audioContext.currentTime + startDelay;
      
      // Create instrument sound
      const { oscillators, gainNodes } = createInstrumentSound(frequency, startTime, noteDuration);
      
      // Apply envelope to all gain nodes
      gainNodes.forEach((gainNode, gainIndex) => {
        let nodeVolume = volume;
        
        // Adjust volume for different instrument types
        if (instrumentType === 'warm-pad') {
          nodeVolume = volume * 0.4; // Lower volume per oscillator since we have 3
        } else if (instrumentType === 'organ') {
          const harmonicVolumes = [0.8, 0.6, 0.4, 0.3, 0.2, 0.15];
          nodeVolume = volume * (harmonicVolumes[gainIndex] || 0.1);
        }
        
        gainNode.gain.setValueAtTime(0, startTime);
        // Smooth attack
        gainNode.gain.linearRampToValueAtTime(nodeVolume, startTime + attackTime);
        // Sustain at reduced volume for legato effect
        gainNode.gain.linearRampToValueAtTime(nodeVolume * 0.6, startTime + sustainTime);
        // Very gentle exponential release
        gainNode.gain.setTargetAtTime(0, startTime + sustainTime, releaseTime / 3);
      });
      
      // Start and stop all oscillators
      oscillators.forEach(osc => {
        osc.start(startTime);
        osc.stop(startTime + sustainTime + releaseTime + 1.0); // Extended overlap
        oscillatorsRef.current.push(osc);
      });
    });
  }, [initAudioContext]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const playProgression = useCallback(async (chords: Chord[], rhythmPattern: string = 'Block Chord', instrumentType: string = 'sine') => {
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
      playChord(chords[index], chordDuration * 1.1, false, rhythmPattern, instrumentType); // Extended duration for smooth overlap
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