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
  { name: 'City Pop Bounce', degrees: [0, 3, 5, 4], bpmRange: [100, 120], preferredScale: 'major', color: 'from-pink-400 to-purple-500' },
  { name: 'Vaporwave', degrees: [0, 4, 5, 3], bpmRange: [60, 85], preferredScale: 'major', color: 'from-cyan-400 to-purple-500' },
  { name: 'West Coast', degrees: [0, 6, 3, 0], bpmRange: [85, 95], preferredScale: 'minor', color: 'from-orange-500 to-red-600' },
  { name: 'G-Funk', degrees: [5, 1, 4, 0], bpmRange: [90, 110], preferredScale: 'minor', color: 'from-green-500 to-blue-600' },
  { name: 'Rap', degrees: [0, 5, 3, 4], bpmRange: [80, 100], preferredScale: 'minor', color: 'from-gray-600 to-gray-800' },
  { name: 'Late Night', degrees: [5, 3, 0, 2], bpmRange: [60, 75], preferredScale: 'minor', color: 'from-blue-800 to-purple-900' },
  { name: 'UK R&B Jazz', degrees: [1, 4, 0, 5], bpmRange: [85, 105], preferredScale: 'dorian', color: 'from-emerald-500 to-teal-600' },
  { name: 'Lo-Fi', degrees: [0, 4, 5, 2], bpmRange: [70, 90], preferredScale: 'major', color: 'from-amber-400 to-orange-500' },
  { name: 'Brazilian Jazz', degrees: [2, 5, 1, 4], bpmRange: [120, 140], preferredScale: 'major', color: 'from-yellow-400 to-green-500' },
  { name: 'House', degrees: [0, 4, 5, 3], bpmRange: [120, 130], preferredScale: 'minor', color: 'from-blue-500 to-indigo-600' },
  { name: 'Funk', degrees: [0, 3, 4, 5], bpmRange: [100, 120], preferredScale: 'mixolydian', color: 'from-orange-400 to-pink-500' },
  { name: 'Neo Soul', degrees: [1, 4, 0, 2], bpmRange: [75, 95], preferredScale: 'dorian', color: 'from-teal-400 to-emerald-600' }
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
  id: string;
  name: string;
  type: string;
  category: 'keys' | 'strings' | 'synths' | 'pads' | 'brass' | 'other';
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'sine', name: 'Sine Wave', type: 'sine', category: 'synths' },
  { id: 'piano', name: 'Piano', type: 'piano', category: 'keys' },
  { id: 'electric-piano', name: 'Electric Piano', type: 'electric-piano', category: 'keys' },
  { id: 'organ', name: 'Organ', type: 'organ', category: 'keys' },
  { id: 'strings', name: 'Strings', type: 'strings', category: 'strings' },
  { id: 'synth-pad', name: 'Synth Pad', type: 'synth-pad', category: 'pads' },
  { id: 'analog-synth', name: 'Analog Synth', type: 'analog-synth', category: 'synths' },
  { id: 'brass', name: 'Brass Section', type: 'brass', category: 'brass' },
  { id: 'guitar', name: 'Clean Guitar', type: 'guitar', category: 'other' }
];

// Energy levels for music generation
export type EnergyLevel = 'chill' | 'medium' | 'high' | 'intense';

export interface EnergyOption {
  id: EnergyLevel;
  name: string;
  description: string;
}

export const ENERGY_OPTIONS: EnergyOption[] = [
  { id: 'chill', name: 'Chill', description: 'Relaxed, ambient feel' },
  { id: 'medium', name: 'Medium', description: 'Balanced energy' },
  { id: 'high', name: 'High', description: 'Upbeat and driving' },
  { id: 'intense', name: 'Intense', description: 'Maximum energy, powerful drops' }
];

// Groove types
export type GrooveType = 'smooth' | 'bouncy' | 'driving' | 'danceable' | 'syncopated';

export interface GrooveOption {
  id: GrooveType;
  name: string;
  description: string;
}

export const GROOVE_OPTIONS: GrooveOption[] = [
  { id: 'smooth', name: 'Smooth', description: 'Flowing, effortless feel' },
  { id: 'bouncy', name: 'Bouncy', description: 'Playful, rhythmic bounce' },
  { id: 'driving', name: 'Driving', description: 'Forward momentum, urgent' },
  { id: 'danceable', name: 'Danceable', description: 'Made for movement' },
  { id: 'syncopated', name: 'Syncopated', description: 'Off-beat, complex rhythms' }
];

// Drum styles
export type DrumStyle = 'acoustic' | 'electronic' | '808' | 'live' | 'hybrid' | 'minimal';

export interface DrumOption {
  id: DrumStyle;
  name: string;
  description: string;
}

export const DRUM_OPTIONS: DrumOption[] = [
  { id: 'acoustic', name: 'Acoustic Drums', description: 'Natural drum kit sound' },
  { id: 'electronic', name: 'Electronic', description: 'Synthesized drum machine' },
  { id: '808', name: '808s', description: 'Classic hip-hop bass drums' },
  { id: 'live', name: 'Live Drums', description: 'Human-played feel with fills' },
  { id: 'hybrid', name: 'Hybrid', description: 'Mix of acoustic and electronic' },
  { id: 'minimal', name: 'Minimal', description: 'Sparse, subtle percussion' }
];

// Beat drop options
export type BeatDropType = 'none' | 'subtle' | 'dramatic';

export interface BeatDropOption {
  id: BeatDropType;
  name: string;
  description: string;
}

export const BEAT_DROP_OPTIONS: BeatDropOption[] = [
  { id: 'none', name: 'None', description: 'Consistent energy throughout' },
  { id: 'subtle', name: 'Subtle', description: 'Gentle build and release' },
  { id: 'dramatic', name: 'Dramatic', description: 'Big build-up with powerful drop' }
];

// Artist/Producer Style Presets
export type ArtistStyleId = 'none' | 'jdilla' | 'pharrell' | 'metroboomin' | 'daftpunk' | 'timbaland' | 'ryuichi' | 'quincy' | 'kaytranada';

export interface ArtistStyle {
  id: ArtistStyleId;
  name: string;
  description: string;
  // Style characteristics
  preferredGenre?: string;
  bpmRange: [number, number];
  energy: EnergyLevel;
  groove: GrooveType;
  drumStyle: DrumStyle;
  chordComplexity: 'simple' | 'moderate' | 'complex';
  swingAmount: number; // 0-1
  color: string;
}

export const ARTIST_STYLES: ArtistStyle[] = [
  {
    id: 'none',
    name: 'No Style',
    description: 'Use custom settings',
    bpmRange: [80, 120],
    energy: 'medium',
    groove: 'smooth',
    drumStyle: 'acoustic',
    chordComplexity: 'moderate',
    swingAmount: 0,
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'jdilla',
    name: 'J Dilla',
    description: 'Soulful swing, off-grid drums, warm chords',
    preferredGenre: 'Neo Soul',
    bpmRange: [75, 95],
    energy: 'chill',
    groove: 'syncopated',
    drumStyle: 'hybrid',
    chordComplexity: 'complex',
    swingAmount: 0.35,
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'pharrell',
    name: 'Pharrell / Neptunes',
    description: 'Minimal, punchy, space between notes',
    preferredGenre: 'Hip Hop',
    bpmRange: [90, 110],
    energy: 'high',
    groove: 'bouncy',
    drumStyle: 'electronic',
    chordComplexity: 'simple',
    swingAmount: 0.1,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'metroboomin',
    name: 'Metro Boomin',
    description: 'Heavy 808s, dark melodies, trap energy',
    preferredGenre: 'Trap Soul',
    bpmRange: [130, 150],
    energy: 'intense',
    groove: 'driving',
    drumStyle: '808',
    chordComplexity: 'simple',
    swingAmount: 0,
    color: 'from-red-600 to-rose-800'
  },
  {
    id: 'daftpunk',
    name: 'Daft Punk',
    description: 'French house, disco samples, filtered chords',
    preferredGenre: 'House',
    bpmRange: [115, 130],
    energy: 'high',
    groove: 'danceable',
    drumStyle: 'electronic',
    chordComplexity: 'moderate',
    swingAmount: 0.05,
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'timbaland',
    name: 'Timbaland',
    description: 'Stuttering drums, Eastern influences, unique sounds',
    preferredGenre: 'R&B',
    bpmRange: [85, 105],
    energy: 'medium',
    groove: 'syncopated',
    drumStyle: 'electronic',
    chordComplexity: 'moderate',
    swingAmount: 0.15,
    color: 'from-purple-600 to-indigo-700'
  },
  {
    id: 'ryuichi',
    name: 'Ryuichi Sakamoto',
    description: 'Ambient, cinematic, lush harmonies',
    preferredGenre: 'Late Night',
    bpmRange: [60, 80],
    energy: 'chill',
    groove: 'smooth',
    drumStyle: 'minimal',
    chordComplexity: 'complex',
    swingAmount: 0,
    color: 'from-slate-500 to-slate-700'
  },
  {
    id: 'quincy',
    name: 'Quincy Jones',
    description: 'Jazz-funk, orchestral, sophisticated',
    preferredGenre: 'Funk',
    bpmRange: [95, 115],
    energy: 'medium',
    groove: 'bouncy',
    drumStyle: 'live',
    chordComplexity: 'complex',
    swingAmount: 0.2,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'kaytranada',
    name: 'Kaytranada',
    description: 'House meets R&B, groovy bass, crisp drums',
    preferredGenre: 'City Pop Bounce',
    bpmRange: [100, 120],
    energy: 'medium',
    groove: 'danceable',
    drumStyle: 'electronic',
    chordComplexity: 'moderate',
    swingAmount: 0.1,
    color: 'from-pink-500 to-purple-600'
  }
]