"""
Audio Analysis Module for Chord Genesis
Extracts musical features from audio files for style replication
"""

import librosa
import numpy as np
from dataclasses import dataclass, asdict
from typing import Optional, List, Tuple
import warnings

warnings.filterwarnings('ignore')


@dataclass
class AudioFeatures:
    """Extracted audio features for style replication"""
    # Tempo & Rhythm
    bpm: float
    beat_strength: float  # 0-1, how prominent the beat is
    rhythm_complexity: float  # 0-1, variation in rhythm patterns
    groove_type: str  # smooth, bouncy, driving, syncopated

    # Key & Harmony
    key: str  # C, C#, D, etc.
    mode: str  # major, minor
    key_confidence: float  # 0-1
    chord_complexity: float  # 0-1, harmonic richness

    # Energy & Dynamics
    energy: float  # 0-1, overall energy level
    energy_label: str  # chill, medium, high, intense
    dynamics_range: float  # dB range
    loudness: float  # LUFS-like measure

    # Timbre & Texture
    brightness: float  # 0-1, spectral centroid normalized
    warmth: float  # 0-1, low-frequency presence
    texture: str  # sparse, moderate, dense, lush

    # Mood
    mood: str  # dreamy, uplifting, melancholic, aggressive, etc.
    mood_confidence: float

    # Genre hints
    genre_hints: List[str]

    # Duration
    duration_seconds: float

    def to_dict(self):
        return asdict(self)


class AudioAnalyzer:
    """Analyzes audio files and extracts musical features"""

    # Key mappings
    KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    # Genre feature profiles (simplified)
    GENRE_PROFILES = {
        'lofi': {'bpm': (70, 95), 'brightness': (0.2, 0.5), 'energy': (0.2, 0.5)},
        'trap': {'bpm': (130, 170), 'brightness': (0.4, 0.8), 'energy': (0.5, 0.9)},
        'rnb': {'bpm': (65, 100), 'brightness': (0.3, 0.6), 'energy': (0.3, 0.6)},
        'house': {'bpm': (118, 132), 'brightness': (0.5, 0.8), 'energy': (0.6, 0.9)},
        'ambient': {'bpm': (60, 90), 'brightness': (0.2, 0.5), 'energy': (0.1, 0.4)},
        'jazz': {'bpm': (80, 140), 'brightness': (0.3, 0.6), 'energy': (0.3, 0.7)},
        'hiphop': {'bpm': (85, 115), 'brightness': (0.3, 0.6), 'energy': (0.4, 0.7)},
        'electronic': {'bpm': (120, 150), 'brightness': (0.5, 0.9), 'energy': (0.6, 1.0)},
        'cinematic': {'bpm': (60, 120), 'brightness': (0.3, 0.7), 'energy': (0.3, 0.8)},
        'acoustic': {'bpm': (70, 130), 'brightness': (0.4, 0.7), 'energy': (0.2, 0.6)},
    }

    def __init__(self, sr: int = 22050):
        self.sr = sr

    def analyze(self, audio_path: str) -> AudioFeatures:
        """Main analysis function - extracts all features from audio file"""
        # Load audio
        y, sr = librosa.load(audio_path, sr=self.sr, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)

        # Extract all features
        tempo_features = self._analyze_tempo(y, sr)
        key_features = self._analyze_key(y, sr)
        energy_features = self._analyze_energy(y, sr)
        timbre_features = self._analyze_timbre(y, sr)
        mood = self._estimate_mood(energy_features, timbre_features, key_features)
        genre_hints = self._estimate_genres(tempo_features, energy_features, timbre_features)

        return AudioFeatures(
            # Tempo
            bpm=tempo_features['bpm'],
            beat_strength=tempo_features['beat_strength'],
            rhythm_complexity=tempo_features['rhythm_complexity'],
            groove_type=tempo_features['groove_type'],

            # Key
            key=key_features['key'],
            mode=key_features['mode'],
            key_confidence=key_features['confidence'],
            chord_complexity=key_features['chord_complexity'],

            # Energy
            energy=energy_features['energy'],
            energy_label=energy_features['label'],
            dynamics_range=energy_features['dynamics_range'],
            loudness=energy_features['loudness'],

            # Timbre
            brightness=timbre_features['brightness'],
            warmth=timbre_features['warmth'],
            texture=timbre_features['texture'],

            # Mood & Genre
            mood=mood['mood'],
            mood_confidence=mood['confidence'],
            genre_hints=genre_hints,

            # Duration
            duration_seconds=duration
        )

    def analyze_bytes(self, audio_bytes: bytes, format: str = 'mp3') -> AudioFeatures:
        """Analyze audio from bytes (for API uploads)"""
        import tempfile
        import os

        with tempfile.NamedTemporaryFile(suffix=f'.{format}', delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name

        try:
            return self.analyze(temp_path)
        finally:
            os.unlink(temp_path)

    def _analyze_tempo(self, y: np.ndarray, sr: int) -> dict:
        """Extract tempo and rhythm features"""
        # Get tempo and beat frames
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)

        # Handle tempo as array or scalar
        bpm = float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo)

        # Beat strength from onset envelope
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        beat_strength = float(np.mean(onset_env[beat_frames]) / (np.max(onset_env) + 1e-6))
        beat_strength = min(1.0, beat_strength)

        # Rhythm complexity from beat intervals
        if len(beat_frames) > 1:
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)
            intervals = np.diff(beat_times)
            rhythm_complexity = float(np.std(intervals) / (np.mean(intervals) + 1e-6))
            rhythm_complexity = min(1.0, rhythm_complexity)
        else:
            rhythm_complexity = 0.5

        # Classify groove type
        if rhythm_complexity < 0.15:
            groove_type = 'smooth'
        elif rhythm_complexity < 0.3:
            groove_type = 'bouncy'
        elif rhythm_complexity < 0.5:
            groove_type = 'driving'
        else:
            groove_type = 'syncopated'

        return {
            'bpm': bpm,
            'beat_strength': beat_strength,
            'rhythm_complexity': rhythm_complexity,
            'groove_type': groove_type
        }

    def _analyze_key(self, y: np.ndarray, sr: int) -> dict:
        """Extract key and harmonic features"""
        # Chromagram for key detection
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

        # Sum chroma bins to get key profile
        chroma_sum = np.sum(chroma, axis=1)

        # Major and minor templates (Krumhansl-Kessler profiles simplified)
        major_template = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_template = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

        # Correlate with all key shifts
        major_corrs = []
        minor_corrs = []

        for i in range(12):
            shifted = np.roll(chroma_sum, -i)
            major_corrs.append(np.corrcoef(shifted, major_template)[0, 1])
            minor_corrs.append(np.corrcoef(shifted, minor_template)[0, 1])

        max_major = np.max(major_corrs)
        max_minor = np.max(minor_corrs)

        if max_major > max_minor:
            key_idx = np.argmax(major_corrs)
            mode = 'major'
            confidence = float(max_major)
        else:
            key_idx = np.argmax(minor_corrs)
            mode = 'minor'
            confidence = float(max_minor)

        key = self.KEY_NAMES[key_idx]
        confidence = max(0, min(1, (confidence + 1) / 2))  # Normalize correlation to 0-1

        # Chord complexity from chroma variance
        chroma_var = np.var(chroma, axis=1)
        chord_complexity = float(np.mean(chroma_var) / (np.max(chroma_var) + 1e-6))
        chord_complexity = min(1.0, chord_complexity)

        return {
            'key': key,
            'mode': mode,
            'confidence': confidence,
            'chord_complexity': chord_complexity
        }

    def _analyze_energy(self, y: np.ndarray, sr: int) -> dict:
        """Extract energy and dynamics features"""
        # RMS energy
        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(np.mean(rms))

        # Normalize energy (typical RMS ranges from 0.01 to 0.3)
        energy = min(1.0, mean_rms / 0.2)

        # Dynamics range in dB
        rms_db = librosa.amplitude_to_db(rms + 1e-6)
        dynamics_range = float(np.percentile(rms_db, 95) - np.percentile(rms_db, 5))

        # Loudness (simplified LUFS-like)
        loudness = float(np.mean(rms_db))

        # Classify energy level
        if energy < 0.25:
            label = 'chill'
        elif energy < 0.5:
            label = 'medium'
        elif energy < 0.75:
            label = 'high'
        else:
            label = 'intense'

        return {
            'energy': energy,
            'label': label,
            'dynamics_range': dynamics_range,
            'loudness': loudness
        }

    def _analyze_timbre(self, y: np.ndarray, sr: int) -> dict:
        """Extract timbre and texture features"""
        # Spectral centroid (brightness)
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        brightness = float(np.mean(centroid) / (sr / 2))  # Normalize to 0-1
        brightness = min(1.0, brightness * 4)  # Scale up as most music is in lower half

        # Spectral rolloff for warmth (inverse - more low freq = warmer)
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.25)[0]
        warmth = 1.0 - float(np.mean(rolloff) / (sr / 2))
        warmth = max(0, min(1, warmth * 2))

        # Spectral bandwidth for texture density
        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        texture_density = float(np.mean(bandwidth) / (sr / 4))
        texture_density = min(1.0, texture_density)

        # Classify texture
        if texture_density < 0.25:
            texture = 'sparse'
        elif texture_density < 0.5:
            texture = 'moderate'
        elif texture_density < 0.75:
            texture = 'dense'
        else:
            texture = 'lush'

        return {
            'brightness': brightness,
            'warmth': warmth,
            'texture': texture
        }

    def _estimate_mood(self, energy: dict, timbre: dict, key: dict) -> dict:
        """Estimate mood from combined features"""
        e = energy['energy']
        b = timbre['brightness']
        w = timbre['warmth']
        mode = key['mode']

        # Simplified mood mapping
        if mode == 'minor':
            if e < 0.4 and b < 0.4:
                mood = 'melancholic'
                confidence = 0.7
            elif e > 0.7:
                mood = 'aggressive'
                confidence = 0.6
            else:
                mood = 'mysterious'
                confidence = 0.5
        else:  # major
            if e < 0.3 and w > 0.5:
                mood = 'dreamy'
                confidence = 0.7
            elif e > 0.6 and b > 0.5:
                mood = 'uplifting'
                confidence = 0.7
            elif e < 0.5:
                mood = 'peaceful'
                confidence = 0.6
            else:
                mood = 'energetic'
                confidence = 0.6

        return {'mood': mood, 'confidence': confidence}

    def _estimate_genres(self, tempo: dict, energy: dict, timbre: dict) -> List[str]:
        """Estimate likely genres based on features"""
        bpm = tempo['bpm']
        e = energy['energy']
        b = timbre['brightness']

        matches = []

        for genre, profile in self.GENRE_PROFILES.items():
            bpm_match = profile['bpm'][0] <= bpm <= profile['bpm'][1]
            brightness_match = profile['brightness'][0] <= b <= profile['brightness'][1]
            energy_match = profile['energy'][0] <= e <= profile['energy'][1]

            score = sum([bpm_match, brightness_match, energy_match])
            if score >= 2:
                matches.append((genre, score))

        # Sort by score and return top 3
        matches.sort(key=lambda x: x[1], reverse=True)
        return [g[0] for g in matches[:3]] if matches else ['unknown']
