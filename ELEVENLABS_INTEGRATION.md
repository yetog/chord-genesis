# ElevenLabs Integration for Chord Genesis

This document describes the ElevenLabs AI integration features added to Chord Genesis, including text-to-speech and music generation capabilities.

## Features

### 🎤 Text-to-Speech
- **Voice Selection**: Choose from multiple AI voices (Adam, Bella, Antoni, Arnold)
- **Custom Text**: Input any text or use auto-generated progression descriptions
- **Audio Playback**: Instantly preview generated speech
- **Download**: Save speech as MP3 files
- **Smart Descriptions**: Automatically generates descriptive text about your chord progressions

### 🎵 Music Generation
- **AI Composition**: Generate music tracks based on text prompts
- **Length Control**: Create tracks from 10 seconds to 2 minutes
- **Smart Prompts**: Auto-generate prompts based on your current chord progression and key
- **Instant Playback**: Preview generated music immediately
- **Download**: Save music as MP3 files
- **Style Intelligence**: Adapts musical style based on major/minor scales

## How to Use

### Text-to-Speech
1. Navigate to the ElevenLabs panel (appears when you have a chord progression)
2. Select the "Text-to-Speech" tab
3. Choose your preferred voice from the dropdown
4. Either:
   - Enter custom text in the textarea
   - Leave empty to use auto-generated progression description
5. Click "Speak" to hear the text or "Download" to save as MP3

### Music Generation
1. Switch to the "Music Generation" tab in the ElevenLabs panel
2. Select desired music length (10s - 2 minutes)
3. Either:
   - Enter a custom music prompt
   - Leave empty for auto-generated prompt based on your progression
4. Click "Generate & Play" to create and hear music or "Download" to save

## Auto-Generated Content

### Progression Descriptions
When you have a chord progression loaded, the system automatically generates descriptive text like:
```
"Here's your chord progression in C major: C, Am, F, G. This progression creates a beautiful harmonic sequence perfect for songwriting."
```

### Music Prompts
Music prompts are intelligently generated based on your current settings:
```
"Create a uplifting musical piece in C major, featuring the chord progression with rich harmonies, flowing melody, and contemporary arrangement. Medium tempo, professional production quality."
```

## Technical Implementation

### API Configuration
- Uses ElevenLabs API with your provided API key
- Environment variable: `VITE_ELEVENLABS_API_KEY`
- Browser-compatible audio playback using Web Audio API

### Key Files
- `src/services/elevenlabsService.ts` - Core API integration
- `src/hooks/useElevenLabs.ts` - React hook for state management
- `src/components/ElevenLabsPanel.tsx` - UI component
- `.env` - API key configuration

### Error Handling
- Copyrighted material detection with suggested alternatives
- Network error handling with user-friendly messages
- Audio playback fallbacks for browser compatibility

## Usage Tips

1. **Voice Selection**: Different voices work better for different content types
2. **Music Length**: Shorter tracks (10-30s) generate faster and are great for previews
3. **Custom Prompts**: Be specific about genre, mood, and instruments for better results
4. **Progressive Enhancement**: Features only appear when you have chord progressions loaded

## API Limits

- Text-to-Speech: Available to all ElevenLabs users
- Music Generation: Available to paid ElevenLabs users only
- Rate limits apply based on your ElevenLabs subscription tier

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Troubleshooting

### Common Issues
1. **"Failed to generate speech"**: Check API key and internet connection
2. **"Copyrighted material detected"**: Use the suggested prompt provided in the error
3. **No audio playback**: Check browser permissions and audio settings
4. **Music generation fails**: Ensure you have a paid ElevenLabs subscription

### Debug Mode
Enable console logging to see detailed error messages:
```javascript
// Open browser console to see detailed logs
```

## Future Enhancements

Potential future features:
- Voice cloning for personalized narration
- Advanced composition plans for complex musical structures
- Integration with MIDI export for seamless workflow
- Batch processing for multiple progressions
- Custom voice training for musical terminology