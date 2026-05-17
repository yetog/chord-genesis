"""
Prompt Generator for Chord Genesis
Converts audio features into ElevenLabs music generation prompts
"""

from typing import Optional, Dict, List
from audio_analyzer import AudioFeatures


class PromptGenerator:
    """Generates ElevenLabs-compatible prompts from audio features"""

    # Mood descriptors with synonyms
    MOOD_DESCRIPTORS = {
        'dreamy': ['ethereal', 'floaty', 'hazy', 'atmospheric'],
        'uplifting': ['euphoric', 'triumphant', 'soaring', 'inspiring'],
        'melancholic': ['bittersweet', 'nostalgic', 'wistful', 'somber'],
        'aggressive': ['intense', 'powerful', 'hard-hitting', 'raw'],
        'mysterious': ['dark', 'enigmatic', 'suspenseful', 'brooding'],
        'peaceful': ['serene', 'calm', 'tranquil', 'soothing'],
        'energetic': ['vibrant', 'dynamic', 'lively', 'driving'],
    }

    # Genre-specific vocabulary
    GENRE_VOCAB = {
        'lofi': ['dusty vinyl crackle', 'tape saturation', 'mellow chords', 'jazz samples'],
        'trap': ['808 bass', 'hi-hat rolls', 'dark melodies', 'hard-hitting drums'],
        'rnb': ['smooth vocals', 'silky production', 'sensual grooves', 'lush harmonies'],
        'house': ['four-on-the-floor', 'pumping bassline', 'filtered synths', 'disco samples'],
        'ambient': ['textured pads', 'evolving soundscapes', 'subtle movement', 'spacious reverb'],
        'jazz': ['swinging rhythms', 'complex harmonies', 'improvisational', 'sophisticated'],
        'hiphop': ['boom bap drums', 'soulful samples', 'head-nodding groove', 'lyrical flow'],
        'electronic': ['synthesizers', 'digital textures', 'pulsing rhythms', 'futuristic'],
        'cinematic': ['orchestral swells', 'epic build-ups', 'emotional depth', 'dramatic'],
        'acoustic': ['organic instruments', 'natural warmth', 'intimate', 'stripped-back'],
    }

    # Energy level descriptions
    ENERGY_DESCRIPTIONS = {
        'chill': ['laid-back', 'relaxed', 'low-key', 'easy-going'],
        'medium': ['moderate energy', 'balanced', 'steady groove'],
        'high': ['high energy', 'powerful', 'driving force'],
        'intense': ['maximum intensity', 'explosive', 'relentless energy'],
    }

    # Texture descriptions
    TEXTURE_DESCRIPTIONS = {
        'sparse': ['minimalist', 'stripped-back', 'space between notes'],
        'moderate': ['balanced arrangement', 'well-defined layers'],
        'dense': ['full production', 'layered sounds', 'rich arrangement'],
        'lush': ['thick textures', 'wall of sound', 'immersive'],
    }

    def generate_prompt(
        self,
        features: AudioFeatures,
        style_hints: Optional[List[str]] = None,
        custom_additions: Optional[str] = None
    ) -> str:
        """Generate a comprehensive ElevenLabs prompt from audio features"""

        parts = []

        # 1. Core genre/style
        if features.genre_hints and features.genre_hints[0] != 'unknown':
            primary_genre = features.genre_hints[0]
            genre_desc = self._get_genre_description(primary_genre)
            parts.append(genre_desc)

        # 2. Mood and atmosphere
        mood_desc = self._get_mood_description(features.mood, features.mood_confidence)
        parts.append(mood_desc)

        # 3. Key and tonality
        key_desc = f"{features.key} {features.mode}"
        parts.append(f"in {key_desc}")

        # 4. Tempo and groove
        tempo_desc = self._get_tempo_description(features.bpm, features.groove_type)
        parts.append(tempo_desc)

        # 5. Energy level
        energy_desc = self._get_energy_description(features.energy_label)
        parts.append(energy_desc)

        # 6. Texture and production
        texture_desc = self._get_texture_description(
            features.texture,
            features.brightness,
            features.warmth
        )
        parts.append(texture_desc)

        # 7. Style hints if provided
        if style_hints:
            parts.append(f"drawing influence from {', '.join(style_hints)}")

        # 8. Custom additions
        if custom_additions:
            parts.append(custom_additions)

        # Combine and clean up
        prompt = ', '.join(parts)
        prompt = prompt[0].upper() + prompt[1:]  # Capitalize first letter

        return prompt

    def generate_style_prompt(
        self,
        features: AudioFeatures,
        target_mood: Optional[str] = None,
        target_energy: Optional[str] = None
    ) -> str:
        """Generate a prompt for style replication with optional mood/energy overrides"""

        # Use original features but allow overrides
        mood = target_mood or features.mood
        energy_label = target_energy or features.energy_label

        parts = []

        # Start with a strong genre/vibe statement
        if features.genre_hints and features.genre_hints[0] != 'unknown':
            vocab = self.GENRE_VOCAB.get(features.genre_hints[0], [])
            if vocab:
                parts.append(f"{features.genre_hints[0]} production with {vocab[0]}")

        # Mood
        mood_words = self.MOOD_DESCRIPTORS.get(mood, [mood])
        parts.append(f"{mood_words[0]} atmosphere")

        # Key signature
        parts.append(f"written in {features.key} {features.mode}")

        # BPM
        parts.append(f"at {int(features.bpm)} BPM")

        # Energy
        energy_words = self.ENERGY_DESCRIPTIONS.get(energy_label, [energy_label])
        parts.append(energy_words[0])

        # Texture characteristics
        if features.warmth > 0.6:
            parts.append("warm analog tones")
        elif features.brightness > 0.6:
            parts.append("bright crystalline sounds")

        if features.texture == 'lush':
            parts.append("dense layered production")
        elif features.texture == 'sparse':
            parts.append("minimalist arrangement")

        # Groove
        if features.groove_type == 'syncopated':
            parts.append("syncopated rhythms")
        elif features.groove_type == 'bouncy':
            parts.append("bouncy groove")

        return ', '.join(parts)

    def generate_variation_prompts(
        self,
        features: AudioFeatures,
        num_variations: int = 3
    ) -> List[Dict[str, str]]:
        """Generate multiple prompt variations based on the same source"""

        variations = []

        # Variation 1: Same mood, different energy
        energy_levels = ['chill', 'medium', 'high', 'intense']
        current_idx = energy_levels.index(features.energy_label) if features.energy_label in energy_levels else 1
        alt_energy = energy_levels[(current_idx + 2) % 4]

        variations.append({
            'name': f'{features.mood.capitalize()} - {alt_energy.capitalize()} Version',
            'prompt': self.generate_style_prompt(features, target_energy=alt_energy),
            'description': f'Same {features.mood} vibe but with {alt_energy} energy'
        })

        # Variation 2: Opposite mode (major->minor or vice versa)
        opposite_mood = 'melancholic' if features.mood in ['uplifting', 'energetic', 'peaceful'] else 'uplifting'
        variations.append({
            'name': f'{opposite_mood.capitalize()} Reinterpretation',
            'prompt': self.generate_style_prompt(features, target_mood=opposite_mood),
            'description': f'Reimagined with a {opposite_mood} feel'
        })

        # Variation 3: Genre blend
        if len(features.genre_hints) >= 2:
            blend_genres = features.genre_hints[:2]
            variations.append({
                'name': f'{blend_genres[0].capitalize()}-{blend_genres[1].capitalize()} Fusion',
                'prompt': self.generate_prompt(features, style_hints=blend_genres),
                'description': f'Blending {blend_genres[0]} and {blend_genres[1]} styles'
            })
        else:
            # Default to adding cinematic elements
            variations.append({
                'name': 'Cinematic Version',
                'prompt': self.generate_prompt(features, style_hints=['cinematic', 'orchestral']),
                'description': 'Enhanced with cinematic, orchestral elements'
            })

        return variations[:num_variations]

    def _get_genre_description(self, genre: str) -> str:
        """Get rich description for a genre"""
        vocab = self.GENRE_VOCAB.get(genre, [])
        if vocab:
            return f"{genre} track featuring {vocab[0]} and {vocab[1]}"
        return f"{genre} inspired track"

    def _get_mood_description(self, mood: str, confidence: float) -> str:
        """Get mood description with appropriate intensity"""
        descriptors = self.MOOD_DESCRIPTORS.get(mood, [mood])

        if confidence > 0.7:
            return f"deeply {descriptors[0]}"
        elif confidence > 0.5:
            return descriptors[0]
        else:
            return f"subtle {mood} undertones"

    def _get_tempo_description(self, bpm: float, groove_type: str) -> str:
        """Describe tempo and groove"""
        if bpm < 80:
            tempo_feel = "slow, contemplative"
        elif bpm < 100:
            tempo_feel = "mid-tempo"
        elif bpm < 120:
            tempo_feel = "uptempo"
        elif bpm < 140:
            tempo_feel = "fast-paced"
        else:
            tempo_feel = "high-energy rapid"

        return f"{tempo_feel} {int(bpm)} BPM with {groove_type} groove"

    def _get_energy_description(self, energy_label: str) -> str:
        """Get energy description"""
        descriptions = self.ENERGY_DESCRIPTIONS.get(energy_label, [energy_label])
        return descriptions[0]

    def _get_texture_description(self, texture: str, brightness: float, warmth: float) -> str:
        """Describe the sonic texture"""
        parts = []

        # Base texture
        tex_desc = self.TEXTURE_DESCRIPTIONS.get(texture, [texture])
        parts.append(tex_desc[0])

        # Tonal character
        if warmth > 0.6 and brightness < 0.4:
            parts.append("warm, analog character")
        elif brightness > 0.6 and warmth < 0.4:
            parts.append("bright, crisp highs")
        elif warmth > 0.5 and brightness > 0.5:
            parts.append("full-spectrum sound")

        return ' with '.join(parts)


# Quick generation functions for common use cases
def quick_prompt(features: AudioFeatures) -> str:
    """Generate a quick, concise prompt"""
    gen = PromptGenerator()
    return gen.generate_prompt(features)


def style_match_prompt(features: AudioFeatures) -> str:
    """Generate a prompt optimized for style matching"""
    gen = PromptGenerator()
    return gen.generate_style_prompt(features)


def get_variations(features: AudioFeatures, count: int = 3) -> List[Dict]:
    """Get prompt variations"""
    gen = PromptGenerator()
    return gen.generate_variation_prompts(features, count)
