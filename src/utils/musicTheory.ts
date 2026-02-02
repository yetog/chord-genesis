import { SCALES, KEYS, Chord, ChordProgression, EnergyLevel, GrooveType, DrumStyle, BeatDropType } from '../types/music';
import { Melody, MelodyNote } from '../types/music';

// Generation options interface
export interface GenerationOptions {
  energy?: EnergyLevel;
  groove?: GrooveType;
  drumStyle?: DrumStyle;
  beatDrop?: BeatDropType;
  instrument?: string;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteName(midiNote: number): string {
  return NOTE_NAMES[midiNote % 12];
}

export function getNoteFromDegree(key: number, degree: number): string {
  return NOTE_NAMES[(key + SCALES.major.intervals[degree]) % 12];
}

export function generateChordMidiNotes(
  root: number, 
  quality: string, 
  octave: number = 4,
  extensions: string[] = [],
  inversion: number = 0
): number[] {
  const baseNote = root + (octave * 12);
  let intervals: number[] = [];

  // Basic chord intervals - expanded with more qualities
  switch (quality) {
    case 'maj':
      intervals = [0, 4, 7];
      break;
    case 'min':
      intervals = [0, 3, 7];
      break;
    case 'dim':
      intervals = [0, 3, 6];
      break;
    case 'aug':
      intervals = [0, 4, 8];
      break;
    case 'sus2':
      intervals = [0, 2, 7];
      break;
    case 'sus4':
      intervals = [0, 5, 7];
      break;
    case 'maj7':
      intervals = [0, 4, 7, 11];
      break;
    case 'min7':
      intervals = [0, 3, 7, 10];
      break;
    case 'dom7':
      intervals = [0, 4, 7, 10];
      break;
    case 'm7b5': // Half-diminished
      intervals = [0, 3, 6, 10];
      break;
    case 'dim7':
      intervals = [0, 3, 6, 9];
      break;
    case 'aug7':
      intervals = [0, 4, 8, 10];
      break;
    case 'maj9':
      intervals = [0, 4, 7, 11, 14];
      break;
    case 'min9':
      intervals = [0, 3, 7, 10, 14];
      break;
    case 'dom9':
      intervals = [0, 4, 7, 10, 14];
      break;
    case 'add9':
      intervals = [0, 4, 7, 14];
      break;
    case 'maj11':
      intervals = [0, 4, 7, 11, 14, 17];
      break;
    case 'min11':
      intervals = [0, 3, 7, 10, 14, 17];
      break;
    case 'maj13':
      intervals = [0, 4, 7, 11, 14, 17, 21];
      break;
    case 'min13':
      intervals = [0, 3, 7, 10, 14, 17, 21];
      break;
    case 'dom13':
      intervals = [0, 4, 7, 10, 14, 17, 21];
      break;
    default:
      intervals = [0, 4, 7]; // Default to major
  }

  // Add extensions with altered tensions
  extensions.forEach(ext => {
    switch (ext) {
      case '7':
        if (!intervals.includes(10) && !intervals.includes(11)) {
          intervals.push(quality === 'maj' ? 11 : 10);
        }
        break;
      case 'maj7':
        if (!intervals.includes(11)) {
          intervals.push(11);
        }
        break;
      case '9':
        if (!intervals.includes(14)) {
          intervals.push(14);
        }
        break;
      case 'add9':
        if (!intervals.includes(14)) {
          intervals.push(14);
        }
        break;
      case 'b9':
        intervals.push(13); // Flat 9
        break;
      case '#9':
        intervals.push(15); // Sharp 9
        break;
      case '11':
        if (!intervals.includes(17)) {
          intervals.push(17);
        }
        break;
      case '#11':
        intervals.push(18); // Sharp 11
        break;
      case 'b13':
        intervals.push(20); // Flat 13
        break;
      case '13':
        if (!intervals.includes(21)) {
          intervals.push(21);
        }
        break;
    }
  });

  // Generate MIDI notes
  let midiNotes = intervals.map(interval => baseNote + interval);

  // Apply inversion
  for (let i = 0; i < inversion && i < midiNotes.length; i++) {
    midiNotes[i] += 12;
  }

  return midiNotes.sort((a, b) => a - b);
}

export function generateMelody(
  key: string,
  scale: string,
  chords: Chord[],
  length: number = 16, // beats
  options: { energy?: EnergyLevel; groove?: GrooveType } = {}
): Melody {
  const { energy = 'medium', groove = 'smooth' } = options;

  const keyValue = KEYS.find(k => k.name === key)?.value || 0;
  const scaleData = SCALES[scale];

  if (!scaleData) {
    throw new Error(`Scale "${scale}" not found`);
  }

  // Energy affects melody octave and velocity
  const melodyOctave = {
    chill: 60, medium: 60, high: 72, intense: 72
  }[energy];

  const velocityRange = {
    chill: [50, 70], medium: [65, 85], high: [80, 100], intense: [90, 120]
  }[energy];

  // Groove affects note density
  const noteDensityMod = {
    smooth: 0, bouncy: 1, driving: 2, danceable: 1, syncopated: 1
  }[groove];

  const scaleNotes = scaleData.intervals.map(interval =>
    (keyValue + interval) % 12 + melodyOctave
  );

  const notes: MelodyNote[] = [];
  const beatsPerChord = length / chords.length;

  let currentTime = 0;
  let lastNote = scaleNotes[0]; // Start on tonic

  chords.forEach((chord, chordIndex) => {
    const chordTones = chord.midiNotes.map(note => note % 12);
    const chordEndTime = currentTime + beatsPerChord;

    // Energy and groove affect notes per chord
    const baseNotes = energy === 'chill' ? 2 : energy === 'intense' ? 4 : 3;
    const notesInChord = Math.max(2, Math.floor(Math.random() * 2) + baseNotes + noteDensityMod);
    const noteSpacing = beatsPerChord / notesInChord;

    for (let i = 0; i < notesInChord; i++) {
      let nextNote: number;

      // Higher energy = more chord tones, more intervallic leaps
      const chordToneChance = energy === 'chill' ? 0.8 : energy === 'intense' ? 0.5 : 0.7;

      if (Math.random() < chordToneChance) {
        const chordTone = chordTones[Math.floor(Math.random() * chordTones.length)];
        nextNote = chordTone + melodyOctave;
      } else {
        nextNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      }

      // Keep melody in reasonable range
      while (Math.abs(nextNote - lastNote) > 12) {
        if (nextNote > lastNote) {
          nextNote -= 12;
        } else {
          nextNote += 12;
        }
      }

      // Groove affects stepwise preference
      const stepwiseChance = groove === 'smooth' ? 0.8 : groove === 'syncopated' ? 0.4 : 0.6;
      if (Math.abs(nextNote - lastNote) > 7 && Math.random() < stepwiseChance) {
        const direction = nextNote > lastNote ? -1 : 1;
        const stepwiseNote = lastNote + (direction * (Math.floor(Math.random() * 3) + 1));
        if (scaleNotes.includes(stepwiseNote % 12 + melodyOctave) || chordTones.includes(stepwiseNote % 12)) {
          nextNote = stepwiseNote;
        }
      }

      const duration = noteSpacing * (0.7 + Math.random() * 0.6);
      const velocity = velocityRange[0] + Math.floor(Math.random() * (velocityRange[1] - velocityRange[0]));

      notes.push({
        midiNote: nextNote,
        duration,
        startTime: currentTime + (i * noteSpacing),
        velocity
      });

      lastNote = nextNote;
    }

    currentTime = chordEndTime;
  });

  return {
    notes,
    key,
    scale,
    length
  };
}

export function generateProgression(
  key: string,
  scale: string,
  template: number[],
  length: number = 4,
  addExtensions: boolean = false,
  generateMelodyFlag: boolean = false,
  options: GenerationOptions = {}
): ChordProgression {
  const {
    energy = 'medium',
    groove = 'smooth',
    drumStyle = 'acoustic',
    beatDrop = 'none',
    instrument = 'piano'
  } = options;

  const keyValue = KEYS.find(k => k.name === key)?.value || 0;
  const scaleData = SCALES[scale];

  if (!scaleData) {
    throw new Error(`Scale "${scale}" not found`);
  }

  // Energy affects chord complexity and voicing
  const energySettings = {
    chill: { extensionChance: 0.2, inversionChance: 0.1, octave: 3, velocityRange: [50, 70] },
    medium: { extensionChance: 0.4, inversionChance: 0.2, octave: 4, velocityRange: [65, 85] },
    high: { extensionChance: 0.6, inversionChance: 0.3, octave: 4, velocityRange: [80, 100] },
    intense: { extensionChance: 0.8, inversionChance: 0.4, octave: 5, velocityRange: [90, 127] }
  };

  // Groove affects timing variations and note density
  const grooveSettings = {
    smooth: { swingAmount: 0, noteDensity: 1.0, timingVariation: 0.05 },
    bouncy: { swingAmount: 0.15, noteDensity: 1.2, timingVariation: 0.1 },
    driving: { swingAmount: 0, noteDensity: 1.5, timingVariation: 0.02 },
    danceable: { swingAmount: 0.1, noteDensity: 1.3, timingVariation: 0.08 },
    syncopated: { swingAmount: 0.2, noteDensity: 1.4, timingVariation: 0.15 }
  };

  const currentEnergy = energySettings[energy];
  const currentGroove = grooveSettings[groove];

  let degrees: number[];

  if (template.length > 0) {
    degrees = template;
  } else {
    // Generate random progression influenced by energy
    degrees = [];
    const numChords = energy === 'chill' ? Math.max(3, length - 1) :
                      energy === 'intense' ? length + 1 : length;
    for (let i = 0; i < numChords; i++) {
      degrees.push(Math.floor(Math.random() * scaleData.intervals.length));
    }
  }

  const chords: Chord[] = degrees.map((degree, index) => {
    const adjustedDegree = degree % scaleData.intervals.length;
    const rootNote = (keyValue + scaleData.intervals[adjustedDegree]) % 12;
    let quality = scaleData.chordQualities[adjustedDegree];

    // Energy-influenced extension probability
    const shouldExtend = addExtensions || Math.random() < currentEnergy.extensionChance;

    if (shouldExtend && Math.random() > 0.3) {
      const extendedQualities = {
        'maj': energy === 'intense' ? ['maj9', 'maj11', 'maj13'] : ['maj7', 'maj9', 'add9'],
        'min': energy === 'intense' ? ['min9', 'min11'] : ['min7', 'min9'],
        'dim': ['m7b5', 'dim7']
      };

      const possibleExtensions = extendedQualities[quality as keyof typeof extendedQualities];
      if (possibleExtensions) {
        quality = possibleExtensions[Math.floor(Math.random() * possibleExtensions.length)];
      }
    }

    // Beat drop affects specific chord positions
    let chordOctave = currentEnergy.octave;
    if (beatDrop === 'dramatic' && index === degrees.length - 1) {
      chordOctave = currentEnergy.octave + 1; // Build tension for drop
    } else if (beatDrop === 'subtle' && index === Math.floor(degrees.length / 2)) {
      chordOctave = currentEnergy.octave - 1; // Subtle dip
    }

    // Groove-influenced inversions
    const useInversion = Math.random() < currentEnergy.inversionChance;
    const inversion = useInversion ? Math.floor(Math.random() * 3) : 0;

    const extensions = shouldExtend && Math.random() > 0.5 ?
      [Math.random() > 0.5 ? '9' : '11'] : [];

    return {
      root: NOTE_NAMES[rootNote],
      quality,
      extensions,
      inversion,
      midiNotes: generateChordMidiNotes(rootNote, quality, chordOctave, extensions, inversion)
    };
  });

  // Tempo influenced by energy and groove
  const baseTempo = {
    chill: 70, medium: 100, high: 120, intense: 140
  };
  const grooveTempoMod = {
    smooth: 0, bouncy: 5, driving: 10, danceable: 8, syncopated: -5
  };
  const tempo = baseTempo[energy] + grooveTempoMod[groove];

  const progression: ChordProgression = {
    chords,
    key,
    scale,
    tempo
  };

  if (generateMelodyFlag) {
    progression.melody = generateMelody(key, scale, chords, 16, { energy, groove });
  }

  return progression;
}

export function progressionToMidiData(progression: ChordProgression): Uint8Array {
  // Simplified MIDI file generation
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x00, // Format type 0
    0x00, progression.melody ? 0x02 : 0x01, // Number of tracks
    0x00, 0x60  // Ticks per quarter note (96)
  ]);

  const chordTrackHeader = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    0x00, 0x00, 0x00, 0x00  // Track length (will be calculated)
  ]);

  const chordEvents: number[] = [];

  progression.chords.forEach((chord, index) => {
    // Note on events
    chord.midiNotes.forEach(note => {
      chordEvents.push(0x00); // Delta time
      chordEvents.push(0x90); // Note on, channel 0
      chordEvents.push(note);
      chordEvents.push(0x64); // Velocity
    });

    // Note off events (after 1 beat = 96 ticks)
    chord.midiNotes.forEach((note, noteIndex) => {
      chordEvents.push(noteIndex === 0 ? 0x60 : 0x00); // Delta time
      chordEvents.push(0x80); // Note off, channel 0
      chordEvents.push(note);
      chordEvents.push(0x40); // Velocity
    });
  });

  // End of track
  chordEvents.push(0x00, 0xFF, 0x2F, 0x00);

  const chordTrackData = new Uint8Array(chordEvents);
  const chordTrackLength = chordTrackData.length;
  
  // Update track length in header
  chordTrackHeader[7] = chordTrackLength & 0xFF;
  chordTrackHeader[6] = (chordTrackLength >> 8) & 0xFF;
  chordTrackHeader[5] = (chordTrackLength >> 16) & 0xFF;
  chordTrackHeader[4] = (chordTrackLength >> 24) & 0xFF;

  let totalLength = header.length + chordTrackHeader.length + chordTrackData.length;
  let melodyTrackHeader: Uint8Array | null = null;
  let melodyTrackData: Uint8Array | null = null;

  // Add melody track if present
  if (progression.melody) {
    melodyTrackHeader = new Uint8Array([
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      0x00, 0x00, 0x00, 0x00  // Track length (will be calculated)
    ]);

    const melodyEvents: number[] = [];
    let lastTime = 0;

    progression.melody.notes.forEach(note => {
      const startTicks = Math.floor(note.startTime * 96); // Convert beats to ticks
      const durationTicks = Math.floor(note.duration * 96);
      const deltaTime = startTicks - lastTime;

      // Note on
      melodyEvents.push(deltaTime & 0x7F); // Delta time (simplified)
      melodyEvents.push(0x91); // Note on, channel 1
      melodyEvents.push(note.midiNote);
      melodyEvents.push(note.velocity);

      // Note off
      melodyEvents.push(durationTicks & 0x7F); // Delta time
      melodyEvents.push(0x81); // Note off, channel 1
      melodyEvents.push(note.midiNote);
      melodyEvents.push(0x40); // Velocity

      lastTime = startTicks + durationTicks;
    });

    // End of track
    melodyEvents.push(0x00, 0xFF, 0x2F, 0x00);

    melodyTrackData = new Uint8Array(melodyEvents);
    const melodyTrackLength = melodyTrackData.length;

    // Update melody track length in header
    melodyTrackHeader[7] = melodyTrackLength & 0xFF;
    melodyTrackHeader[6] = (melodyTrackLength >> 8) & 0xFF;
    melodyTrackHeader[5] = (melodyTrackLength >> 16) & 0xFF;
    melodyTrackHeader[4] = (melodyTrackLength >> 24) & 0xFF;

    totalLength += melodyTrackHeader.length + melodyTrackData.length;
  }

  // Combine all parts
  const midiFile = new Uint8Array(totalLength);
  midiFile.set(header, 0);
  midiFile.set(chordTrackHeader, header.length);
  midiFile.set(chordTrackData, header.length + chordTrackHeader.length);

  if (melodyTrackHeader && melodyTrackData) {
    const melodyOffset = header.length + chordTrackHeader.length + chordTrackData.length;
    midiFile.set(melodyTrackHeader, melodyOffset);
    midiFile.set(melodyTrackData, melodyOffset + melodyTrackHeader.length);
  }

  return midiFile;
}