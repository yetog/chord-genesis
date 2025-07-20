export interface Chord {
  root: string;
  quality: string;
  extensions?: string[];
  inversion?: number;
  midiNotes: number[];
}

export interface ChordProgression {
  chords: Chord[];
  key: string;
  scale: string;
  tempo: number;
}

export interface Scale {
  name: string;
  intervals: number[];
  chordQualities: string[];
}

export interface Key {
  name: string;
  value: number;
}

export const SCALES: { [key: string]: Scale } = {
  'major': {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    chordQualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']
  },
  'minor': {
    name: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    chordQualities: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj']
  },
  'harmonic-minor': {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    chordQualities: ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim']
  },
  'melodic-minor': {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    chordQualities: ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim']
  },
  'dorian': {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    chordQualities: ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj']
  },
  'phrygian': {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    chordQualities: ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min']
  },
  'lydian': {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    chordQualities: ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min']
  },
  'mixolydian': {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    chordQualities: ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj']
  },
  'locrian': {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    chordQualities: ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min']
  },
  'pentatonic-major': {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9],
    chordQualities: ['maj', 'min', 'min', 'maj', 'min']
  },
  'pentatonic-minor': {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10],
    chordQualities: ['min', 'maj', 'maj', 'min', 'maj']
  },
  'blues': {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    chordQualities: ['min', 'maj', 'maj', 'dim', 'maj', 'maj']
  }
};

export const KEYS: Key[] = [
  { name: 'C', value: 0 },
  { name: 'C#/Db', value: 1 },
  { name: 'D', value: 2 },
  { name: 'D#/Eb', value: 3 },
  { name: 'E', value: 4 },
  { name: 'F', value: 5 },
  { name: 'F#/Gb', value: 6 },
  { name: 'G', value: 7 },
  { name: 'G#/Ab', value: 8 },
  { name: 'A', value: 9 },
  { name: 'A#/Bb', value: 10 },
  { name: 'B', value: 11 }
];

export const CHORD_TEMPLATES = [
  { name: 'I-V-vi-IV', degrees: [0, 4, 5, 3] },
  { name: 'vi-IV-I-V', degrees: [5, 3, 0, 4] },
  { name: 'ii-V-I', degrees: [1, 4, 0] },
  { name: 'I-vi-IV-V', degrees: [0, 5, 3, 4] },
  { name: 'iii-vi-ii-V', degrees: [2, 5, 1, 4] },
  { name: 'I-IV-vi-V', degrees: [0, 3, 5, 4] },
  { name: 'vi-ii-V-I', degrees: [5, 1, 4, 0] },
  { name: 'I-iii-IV-V', degrees: [0, 2, 3, 4] },
  { name: 'Random', degrees: [] }
];

// Extended chord qualities for advanced harmony
export const EXTENDED_CHORD_QUALITIES = [
  'maj', 'min', 'dim', 'aug', 'sus2', 'sus4',
  'maj7', 'min7', 'dom7', 'm7b5', 'dim7', 'aug7',
  'maj9', 'min9', 'dom9', 'add9', 'maj11', 'min11',
  'maj13', 'min13', 'dom13'
];

// Available extensions for chords
export const CHORD_EXTENSIONS = [
  '7', 'maj7', '9', 'add9', 'b9', '#9', '11', '#11', 'b13', '13'
];

export interface Instrument {
  name: string;
  type: string;
}

export const INSTRUMENTS: Instrument[] = [
  { name: 'Sine Wave', type: 'sine' },
  { name: 'Warm Pad', type: 'warm-pad' },
  { name: 'Organ', type: 'organ' }