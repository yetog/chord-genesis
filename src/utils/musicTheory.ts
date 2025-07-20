import { SCALES, KEYS, Chord, ChordProgression } from '../types/music';

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

export function generateProgression(
  key: string,
  scale: string,
  template: number[],
  length: number = 4,
  addExtensions: boolean = false
): ChordProgression {
  const keyValue = KEYS.find(k => k.name === key)?.value || 0;
  const scaleData = SCALES[scale];
  
  if (!scaleData) {
    throw new Error(`Scale "${scale}" not found`);
  }
  
  let degrees: number[];
  
  if (template.length > 0) {
    degrees = template;
  } else {
    // Generate random progression
    degrees = [];
    for (let i = 0; i < length; i++) {
      degrees.push(Math.floor(Math.random() * scaleData.intervals.length));
    }
  }

  const chords: Chord[] = degrees.map(degree => {
    const adjustedDegree = degree % scaleData.intervals.length;
    const rootNote = (keyValue + scaleData.intervals[adjustedDegree]) % 12;
    let quality = scaleData.chordQualities[adjustedDegree];
    
    // Add variety with extended chords
    if (addExtensions && Math.random() > 0.3) {
      const extendedQualities = {
        'maj': ['maj7', 'maj9', 'add9'],
        'min': ['min7', 'min9'],
        'dim': ['m7b5', 'dim7']
      };
      
      const possibleExtensions = extendedQualities[quality as keyof typeof extendedQualities];
      if (possibleExtensions) {
        quality = possibleExtensions[Math.floor(Math.random() * possibleExtensions.length)];
      }
    }
    
    const extensions = addExtensions && Math.random() > 0.6 ? 
      [Math.random() > 0.5 ? '9' : '11'] : [];
    
    return {
      root: NOTE_NAMES[rootNote],
      quality,
      extensions,
      midiNotes: generateChordMidiNotes(rootNote, quality, 4, extensions)
    };
  });

  return {
    chords,
    key,
    scale,
    tempo: 120
  };
}

export function progressionToMidiData(progression: ChordProgression): Uint8Array {
  // Simplified MIDI file generation
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x00, // Format type 0
    0x00, 0x01, // Number of tracks
    0x00, 0x60  // Ticks per quarter note (96)
  ]);

  const trackHeader = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    0x00, 0x00, 0x00, 0x00  // Track length (will be calculated)
  ]);

  const events: number[] = [];

  progression.chords.forEach((chord, index) => {
    // Note on events
    chord.midiNotes.forEach(note => {
      events.push(0x00); // Delta time
      events.push(0x90); // Note on, channel 0
      events.push(note);
      events.push(0x64); // Velocity
    });

    // Note off events (after 1 beat = 96 ticks)
    chord.midiNotes.forEach((note, noteIndex) => {
      events.push(noteIndex === 0 ? 0x60 : 0x00); // Delta time
      events.push(0x80); // Note off, channel 0
      events.push(note);
      events.push(0x40); // Velocity
    });
  });

  // End of track
  events.push(0x00, 0xFF, 0x2F, 0x00);

  const trackData = new Uint8Array(events);
  const trackLength = trackData.length;
  
  // Update track length in header
  trackHeader[7] = trackLength & 0xFF;
  trackHeader[6] = (trackLength >> 8) & 0xFF;
  trackHeader[5] = (trackLength >> 16) & 0xFF;
  trackHeader[4] = (trackLength >> 24) & 0xFF;

  // Combine all parts
  const midiFile = new Uint8Array(header.length + trackHeader.length + trackData.length);
  midiFile.set(header, 0);
  midiFile.set(trackHeader, header.length);
  midiFile.set(trackData, header.length + trackHeader.length);

  return midiFile;
}