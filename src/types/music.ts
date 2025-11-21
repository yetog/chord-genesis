export interface Chord {
  root: string;
  quality: string;
  extensions?: string[];
  inversion?: number;
  midiNotes: number[];
}

export interface MelodyNote {
  midiNote: number;
  duration: number; // In beats
  startTime: number; // In beats from start
  velocity: number;
}

export interface Melody {
  notes: MelodyNote[];
  key: string;
  scale: string;
  length: number; // In beats
}

export interface ChordProgression {
  chords: Chord[];
  key: string;
  scale: string;
  tempo: number;
  melody?: Melody;
}

export interface SavedIdea {
  id: string;
  name: string;
  folder?: string;
  tags: string[];
  progression: ChordProgression;
  settings: {
    selectedKey: string;
    selectedScale: string;
    selectedTemplate: string;
    selectedRhythmPattern: string;
    addExtensions: boolean;
    melodyEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
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
  { name: 'I-IV-V-I', degrees: [0, 3, 4, 0] },
  { name: 'I-vi-ii-V', degrees: [0, 5, 1, 4] },
  { name: 'iii-vi-ii-V', degrees: [2, 5, 1, 4] },
  { name: 'I-IV-vi-V', degrees: [0, 3, 5, 4] },
  { name: 'vi-ii-V-I', degrees: [5, 1, 4, 0] },
  { name: 'I-iii-IV-V', degrees: [0, 2, 3, 4] },
  { name: 'i-VI-VII-i (Minor)', degrees: [0, 5, 6, 0] },
  { name: 'I-bVII-IV-I', degrees: [0, 6, 3, 0] },
  { name: 'vi-V-IV-V', degrees: [5, 4, 3, 4] },
  { name: 'I-V-vi-iii-IV-I-IV-V', degrees: [0, 4, 5, 2, 3, 0, 3, 4] },
  { name: 'ii-V-I-vi', degrees: [1, 4, 0, 5] },
  { name: 'I-iii-vi-IV', degrees: [0, 2, 5, 3] },
  { name: 'Random', degrees: [] }
];

// Music Genre Templates with BPM ranges
export interface MusicGenre {
  name: string;
  degrees: number[];
  bpmRange: [number, number];
  preferredScale?: string;
  color: string;
}

export const MUSIC_GENRES: MusicGenre[] = [
  { name: 'Hip Hop', degrees: [0, 5, 3, 4], bpmRange: [70, 90], preferredScale: 'minor', color: 'from-purple-500 to-pink-600' },
  { name: 'Trap Soul', degrees: [5, 3, 0, 4], bpmRange: [75, 85], preferredScale: 'minor', color: 'from-indigo-500 to-purple-600' },
  { name: 'R&B', degrees: [0, 2, 3, 4], bpmRange: [70, 100], preferredScale: 'major', color: 'from-rose-500 to-pink-600' },
  { name: 'Vaporwave', degrees: [0, 4, 5, 3], bpmRange: [60, 85], preferredScale: 'major', color: 'from-cyan-400 to-purple-500' },
  { name: 'West Coast', degrees: [0, 6, 3, 0], bpmRange: [85, 95], preferredScale: 'minor', color: 'from-orange-500 to-red-600' },
  { name: 'G-Funk', degrees: [5, 1, 4, 0], bpmRange: [90, 110], preferredScale: 'minor', color: 'from-green-500 to-blue-600' },
  { name: 'Rap', degrees: [0, 5, 3, 4], bpmRange: [80, 100], preferredScale: 'minor', color: 'from-gray-600 to-gray-800' },
  { name: 'Late Night', degrees: [5, 3, 0, 2], bpmRange: [60, 75], preferredScale: 'minor', color: 'from-blue-800 to-purple-900' },
  { name: 'UK R&B Jazz', degrees: [1, 4, 0, 5], bpmRange: [85, 105], preferredScale: 'dorian', color: 'from-emerald-500 to-teal-600' },
  { name: 'Lo-Fi', degrees: [0, 4, 5, 2], bpmRange: [70, 90], preferredScale: 'major', color: 'from-amber-400 to-orange-500' },
  { name: 'Brazilian Jazz', degrees: [2, 5, 1, 4], bpmRange: [120, 140], preferredScale: 'major', color: 'from-yellow-400 to-green-500' }
];

// BPM Options
export const BPM_PRESETS = [60, 70, 80, 85, 90, 95, 100, 110, 120, 130, 140];

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
  { name: 'Sine Wave', type: 'sine' }
]