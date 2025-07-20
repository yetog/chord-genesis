export interface RhythmPattern {
  name: string;
  type: 'block' | 'arpeggio' | 'syncopated' | 'waltz';
  description: string;
  noteTimings: number[]; // Relative timing for each note (0-1)
  noteDurations: number[]; // Duration multiplier for each note
}

export const RHYTHM_PATTERNS: RhythmPattern[] = [
  {
    name: 'Block Chord',
    type: 'block',
    description: 'All notes played simultaneously',
    noteTimings: [0], // All notes start at the same time
    noteDurations: [1] // Full duration
  },
  {
    name: 'Up Arpeggio',
    type: 'arpeggio',
    description: 'Notes played from low to high',
    noteTimings: [0, 0.15, 0.3, 0.45], // Staggered start times
    noteDurations: [0.85, 0.85, 0.85, 0.85] // Overlapping notes
  },
  {
    name: 'Down Arpeggio',
    type: 'arpeggio',
    description: 'Notes played from high to low',
    noteTimings: [0, 0.15, 0.3, 0.45], // Will be reversed in implementation
    noteDurations: [0.85, 0.85, 0.85, 0.85]
  },
  {
    name: 'Broken Chord',
    type: 'arpeggio',
    description: 'Root, fifth, third pattern',
    noteTimings: [0, 0.25, 0.5, 0.75],
    noteDurations: [0.3, 0.3, 0.3, 0.3] // Shorter, more detached
  },
  {
    name: 'Syncopated',
    type: 'syncopated',
    description: 'Off-beat rhythm pattern',
    noteTimings: [0, 0.125, 0.375, 0.625],
    noteDurations: [0.4, 0.25, 0.4, 0.5]
  },
  {
    name: 'Waltz',
    type: 'waltz',
    description: 'Root on 1, chord on 2 & 3',
    noteTimings: [0, 0.33, 0.66],
    noteDurations: [0.33, 0.33, 0.33]
  },
  {
    name: 'Strum',
    type: 'arpeggio',
    description: 'Quick guitar-like strum',
    noteTimings: [0, 0.05, 0.1, 0.15],
    noteDurations: [0.9, 0.9, 0.9, 0.9] // Long sustain after strum
  }
];