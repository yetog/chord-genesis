import React, { useState, useEffect } from 'react';
import { Music, Sparkles, AlertCircle, Volume2, ChevronDown, ArrowRight } from 'lucide-react';
import { useElevenLabs } from '../hooks/useElevenLabs';
import AudioPlayer from './AudioPlayer';

interface Chord {
  name: string;
  root: string;
  quality: string;
}

interface ChordProgression {
  chords: Chord[];
  scale: string;
}

interface MusicGeneratorProps {
  currentProgression?: ChordProgression;
  selectedKey?: string;
  selectedScale?: string;
  externalPrompt?: string;
  onExternalPromptClear?: () => void;
}

export default function MusicGeneratorPanel({
  currentProgression,
  selectedKey = 'C',
  selectedScale = 'major',
  externalPrompt,
  onExternalPromptClear
}: MusicGeneratorProps) {
  const [selectedGenre, setSelectedGenre] = useState('ambient');
  const [musicLength, setMusicLength] = useState(30000);
  const [selectedBPM, setSelectedBPM] = useState(120);
  const [useGenreBPM, setUseGenreBPM] = useState(false);
  const [customInput, setCustomInput] = useState(externalPrompt || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [includeVocals, setIncludeVocals] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<ArrayBuffer | null>(null);
  
  const {
    isGeneratingMusic,
    musicError,
    generateMusicTrack,
    clearErrors
  } = useElevenLabs();

  // Update customInput when external prompt is provided
  useEffect(() => {
    if (externalPrompt) {
      setCustomInput(externalPrompt);
      setShowCustomInput(true);
    }
  }, [externalPrompt]);

  // Combined music styles with gradient colors and BPM ranges
  const musicStyles = [
    // Original styles
    { id: 'ambient', name: 'Ambient / Atmospheric', description: 'Ethereal, spacious soundscapes', color: 'from-teal-400 to-cyan-500', bpmRange: [60, 90] },
    { id: 'cinematic', name: 'Cinematic', description: 'Epic, orchestral arrangements', color: 'from-slate-600 to-slate-800', bpmRange: [80, 130] },
    { id: 'electronic', name: 'Electronic', description: 'Modern, synthesized sounds', color: 'from-blue-500 to-indigo-600', bpmRange: [100, 140] },
    { id: 'acoustic', name: 'Acoustic', description: 'Natural, organic instruments', color: 'from-green-500 to-emerald-600', bpmRange: [80, 120] },
    { id: 'classical', name: 'Classical', description: 'Traditional orchestral style', color: 'from-amber-600 to-yellow-700', bpmRange: [60, 120] },
    { id: 'jazz', name: 'Jazz', description: 'Sophisticated harmonies and rhythms', color: 'from-purple-600 to-indigo-700', bpmRange: [100, 140] },
    { id: 'folk', name: 'Folk', description: 'Simple, melodic arrangements', color: 'from-orange-500 to-red-500', bpmRange: [80, 110] },
    { id: 'rock', name: 'Rock', description: 'Guitar-driven with energy', color: 'from-red-600 to-rose-700', bpmRange: [110, 150] },

    // Genre styles from music genres
    { id: 'hiphop', name: 'Hip Hop', description: 'Urban beats and rhythmic flow', color: 'from-purple-500 to-pink-600', bpmRange: [70, 90] },
    { id: 'trapsoul', name: 'Trap Soul', description: 'Melodic trap with soulful elements', color: 'from-indigo-500 to-purple-600', bpmRange: [75, 85] },
    { id: 'rnb', name: 'R&B', description: 'Smooth rhythm and blues', color: 'from-rose-500 to-pink-600', bpmRange: [70, 100] },
    { id: 'citypop', name: 'City Pop Bounce', description: 'Japanese city pop with house, funk, R&B bounce', color: 'from-pink-400 to-purple-500', bpmRange: [100, 120] },
    { id: 'vaporwave', name: 'Vaporwave', description: 'Nostalgic synthesized atmospheres', color: 'from-cyan-400 to-purple-500', bpmRange: [60, 85] },
    { id: 'westcoast', name: 'West Coast', description: 'West Coast hip hop style', color: 'from-orange-500 to-red-600', bpmRange: [85, 95] },
    { id: 'gfunk', name: 'G-Funk', description: 'Funk-influenced hip hop', color: 'from-green-500 to-blue-600', bpmRange: [90, 110] },
    { id: 'rap', name: 'Rap', description: 'Classic rap instrumentals', color: 'from-gray-600 to-gray-800', bpmRange: [80, 100] },
    { id: 'latenight', name: 'Late Night', description: 'Moody late-night vibes', color: 'from-blue-800 to-purple-900', bpmRange: [60, 75] },
    { id: 'ukrnbjazz', name: 'UK R&B Jazz', description: 'UK-influenced R&B with jazz elements', color: 'from-emerald-500 to-teal-600', bpmRange: [85, 105] },
    { id: 'lofi', name: 'Lo-Fi', description: 'Relaxed lo-fi hip hop', color: 'from-amber-400 to-orange-500', bpmRange: [70, 90] },
    { id: 'brazilianjazz', name: 'Brazilian Jazz', description: 'Bossa nova and Brazilian rhythms', color: 'from-yellow-400 to-green-500', bpmRange: [120, 140] },
    { id: 'house', name: 'House', description: 'Four-on-the-floor electronic dance', color: 'from-blue-500 to-indigo-600', bpmRange: [120, 130] },
    { id: 'funk', name: 'Funk', description: 'Groovy, rhythmic bass-driven', color: 'from-orange-400 to-pink-500', bpmRange: [100, 120] },
    { id: 'neosoul', name: 'Neo Soul', description: 'Modern soul with jazz influences', color: 'from-teal-400 to-emerald-600', bpmRange: [75, 95] }
  ];

  // Calculate effective BPM based on user settings
  const getEffectiveBPM = () => {
    if (useGenreBPM) {
      const genreInfo = musicStyles.find(g => g.id === selectedGenre);
      if (genreInfo && genreInfo.bpmRange) {
        return Math.round((genreInfo.bpmRange[0] + genreInfo.bpmRange[1]) / 2);
      }
    }
    return selectedBPM;
  };

  // Generate music prompt based on chord progression and settings
  const generateMusicPrompt = () => {
    if (!currentProgression) {
      return `Create an instrumental ${selectedGenre} composition in ${selectedKey} ${selectedScale}`;
    }
    
    const chordNames = currentProgression.chords.map(chord => chord.name).join(' - ');
    const moodDescription = selectedScale === 'minor' ? 'contemplative and emotional' : 'uplifting and bright';
    const genreInfo = musicStyles.find(g => g.id === selectedGenre);
    const effectiveBPM = getEffectiveBPM();
    
    const tempoDescription = effectiveBPM < 80 ? 'slow tempo' : effectiveBPM < 110 ? 'medium tempo' : 'fast tempo';
    const basePrompt = `Create a ${moodDescription} ${selectedGenre} composition in ${selectedKey} ${selectedScale} featuring the chord progression: ${chordNames}. ${genreInfo?.description || 'High quality production'}. ${tempoDescription} at ${effectiveBPM} BPM, professional arrangement.`;
    
    const customDetails = customInput.trim() ? ` Additional details: ${customInput.trim()}.` : '';
    const finalPrompt = basePrompt + customDetails;
    
    return includeVocals 
      ? finalPrompt + ' Include subtle vocal harmonies and melodic elements.'
      : finalPrompt + ' Pure instrumental, no vocals.';
  };

  const handleGenerateMusic = async () => {
    try {
      const prompt = generateMusicPrompt();
      const audioBuffer = await generateMusicTrack({ 
        prompt, 
        music_length_ms: musicLength,
        force_instrumental: !includeVocals // Opposite of includeVocals
      });
      
      if (audioBuffer) {
        setGeneratedAudio(audioBuffer);
      }
    } catch (error) {
      console.error('Music generation failed:', error);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio) return;
    
    const blob = new Blob([generatedAudio], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    
    const genreName = musicStyles.find(g => g.id === selectedGenre)?.name || selectedGenre;
    const filename = `${selectedKey}_${selectedScale}_${genreName.replace(/\s+/g, '_')}_${Date.now()}.mp3`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProgressionSummary = () => {
    if (!currentProgression) return 'Generate a chord progression first to create contextual music';
    
    const chordNames = currentProgression.chords.map(chord => chord.name).join(' - ');
    return `${selectedKey} ${selectedScale}: ${chordNames}`;
  };

  return (
    <div className="glass-panel border border-amber-500/30 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-200">AI Music Generator</h3>
          <p className="text-gray-400 text-sm">Create music from your chord progressions</p>
        </div>
      </div>

      {/* Chord Progression Context */}
      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">Current Progression</span>
        </div>
        <p className="text-gray-300 text-sm">{getProgressionSummary()}</p>
      </div>

      {/* Musical Style Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Musical Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {musicStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedGenre(style.id)}
              className={`
                group relative p-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105
                bg-gradient-to-r ${style.color} text-white shadow-lg hover:shadow-xl
                ${selectedGenre === style.id ? 'ring-2 ring-white ring-opacity-50 scale-105' : ''}
              `}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                <div className="font-semibold">{style.name}</div>
                <div className="text-xs opacity-80 mt-1">{style.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input Dropdown */}
      <div className="mb-6">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center justify-between w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:border-amber-500/50 transition-all duration-200"
        >
          <span className="text-sm font-medium">Additional Details & Directions</span>
          <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showCustomInput ? 'rotate-180' : ''}`} />
        </button>
        
        {showCustomInput && (
          <div className="mt-3 p-4 bg-gray-800/40 rounded-xl border border-gray-600/50 animate-slide-down">
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Describe additional elements you want in your music (mood, instruments, style details, etc.)..."
              className="w-full h-24 px-4 py-3 bg-gray-900/60 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              These details will be added to the AI music generation prompt for more personalized results.
            </p>
          </div>
        )}
      </div>

      {/* Music Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Settings */}
        <div className="space-y-4">
          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={musicLength}
              onChange={(e) => setMusicLength(Number(e.target.value))}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={15000}>15 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={45000}>45 seconds</option>
              <option value={60000}>1 minute (recommended)</option>
              <option value={90000}>1.5 minutes</option>
              <option value={120000}>2 minutes</option>
              <option value={180000}>3 minutes</option>
              <option value={240000}>4 minutes</option>
              <option value={300000}>5 minutes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Actual duration may vary slightly based on musical phrasing
            </p>
          </div>

          {/* BPM */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              BPM (Tempo)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useGenreBPM"
                  checked={useGenreBPM}
                  onChange={(e) => setUseGenreBPM(e.target.checked)}
                  className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="useGenreBPM" className="text-sm text-gray-300">
                  Use average BPM of genre {useGenreBPM && `(${getEffectiveBPM()} BPM)`}
                </label>
              </div>
              <input
                type="number"
                value={selectedBPM}
                onChange={(e) => setSelectedBPM(Number(e.target.value))}
                disabled={useGenreBPM}
                min="40"
                max="200"
                className={`w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  useGenreBPM ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Enter BPM (40-200)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {useGenreBPM 
                ? 'BPM will be automatically set based on the selected musical style' 
                : 'Controls the speed and energy of the generated music'
              }
            </p>
          </div>

          {/* Vocal Toggle */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVocals}
                onChange={(e) => setIncludeVocals(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-300">Include Vocals</span>
                <p className="text-xs text-gray-500">Add vocal harmonies and melodies</p>
              </div>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateMusic}
            disabled={isGeneratingMusic || !currentProgression}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
          >
            {isGeneratingMusic ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Generate Music
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {musicError && (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{musicError}</span>
          <button
            onClick={clearErrors}
            className="ml-auto text-xs text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer
        audioData={generatedAudio}
        title={`${selectedKey} ${selectedScale} - ${musicStyles.find(g => g.id === selectedGenre)?.name || selectedGenre}`}
        isGenerating={isGeneratingMusic}
        onDownload={handleDownload}
      />

      {/* Volume Tip */}
      {generatedAudio && (
        <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300">
          <Volume2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Use the volume slider in the player to adjust audio level</span>
        </div>
      )}
    </div>
  );
}