import React, { useState, useCallback, useEffect } from 'react';
import { Music, Sparkles, Home, Settings, Zap, Volume2, VolumeX } from 'lucide-react';
import EnhancedControls from './components/EnhancedControls';
import ChordCard from './components/ChordCard';
import PlaybackBar from './components/PlaybackBar';
import SaveLoadPanel from './components/SaveLoadPanel';
import MusicGeneratorPanel from './components/ElevenLabsPanel';
import AdvancedControlsPanel from './components/rpg/AdvancedControlsPanel';
import LoadingCrystal from './components/rpg/LoadingCrystal';
import { ChordProgression, CHORD_TEMPLATES, SavedIdea, MUSIC_GENRES, EnergyLevel, GrooveType, DrumStyle, BeatDropType, ArtistStyleId } from './types/music';
import { KEYS, SCALES } from './types/music';
import { generateProgression, progressionToMidiData } from './utils/musicTheory';
import { RHYTHM_PATTERNS } from './utils/rhythmPatterns';
import { useAudioContext } from './hooks/useAudioContext';
import { useSoundEffects } from './hooks/useSoundEffects';

function App() {
  const [progression, setProgression] = useState<ChordProgression | null>(null);
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('major');
  const [selectedTemplate, setSelectedTemplate] = useState('Random');
  const [selectedRhythmPattern, setSelectedRhythmPattern] = useState('Block Chord');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedBPM, setSelectedBPM] = useState(120);
  const [customInput, setCustomInput] = useState('');
  const [addExtensions, setAddExtensions] = useState(false);
  const [melodyEnabled, setMelodyEnabled] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Advanced controls state
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');
  const [selectedGroove, setSelectedGroove] = useState<GrooveType>('smooth');
  const [selectedDrumStyle, setSelectedDrumStyle] = useState<DrumStyle>('acoustic');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('piano');
  const [selectedBeatDrop, setSelectedBeatDrop] = useState<BeatDropType>('none');
  const [selectedArtistStyle, setSelectedArtistStyle] = useState<ArtistStyleId>('none');
  const [skipMusicStyle, setSkipMusicStyle] = useState(false);

  // Simple/Advanced mode toggle
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
    const saved = localStorage.getItem('chordGenesisMode');
    return saved === 'advanced';
  });

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('chordGenesisSounds');
    return saved !== 'false';
  });

  const { playClick, playSuccess, playGenerate, playComplete, playToggle, setEnabled } = useSoundEffects();

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem('chordGenesisMode', isAdvancedMode ? 'advanced' : 'simple');
  }, [isAdvancedMode]);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem('chordGenesisSounds', soundEnabled ? 'true' : 'false');
    setEnabled(soundEnabled);
  }, [soundEnabled, setEnabled]);

  const { 
    isPlaying, 
    isLooping,
    currentChordIndex, 
    tempo, 
    masterVolume,
    setTempo, 
    setMasterVolume,
    toggleLoop,
    playProgression, 
    playChordPreview,
    stopPlayback
  } = useAudioContext();

  const handleGenerate = useCallback(async () => {
    // Stop current playback but preserve loop state
    if (isPlaying) {
      stopPlayback();
    }

    setIsGenerating(true);

    // Brief delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 800));

    const template = CHORD_TEMPLATES.find(t => t.name === selectedTemplate);
    const newProgression = generateProgression(
      selectedKey,
      selectedScale,
      template?.degrees || [],
      4,
      addExtensions,
      melodyEnabled,
      {
        energy: selectedEnergy,
        groove: selectedGroove,
        drumStyle: selectedDrumStyle,
        beatDrop: selectedBeatDrop,
        instrument: selectedInstrument
      }
    );
    setProgression(newProgression);
    setIsGenerating(false);
    playComplete(); // Success fanfare
  }, [isPlaying, stopPlayback, selectedTemplate, selectedKey, selectedScale, addExtensions, melodyEnabled, playComplete, selectedEnergy, selectedGroove, selectedDrumStyle, selectedBeatDrop, selectedInstrument]);

  const handleRandomize = useCallback(async () => {
    // Stop current playback
    if (isPlaying) {
      stopPlayback();
    }

    setIsGenerating(true);

    // Brief delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get random selections
    const randomKey = KEYS[Math.floor(Math.random() * KEYS.length)].name;
    const scaleKeys = Object.keys(SCALES);
    const randomScale = scaleKeys[Math.floor(Math.random() * scaleKeys.length)];
    const randomTemplate = CHORD_TEMPLATES[Math.floor(Math.random() * CHORD_TEMPLATES.length)].name;
    const randomRhythm = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)].name;

    // Update state
    setSelectedKey(randomKey);
    setSelectedScale(randomScale);
    setSelectedTemplate(randomTemplate);
    setSelectedRhythmPattern(randomRhythm);

    // Generate progression with new random settings
    const template = CHORD_TEMPLATES.find(t => t.name === randomTemplate);
    const newProgression = generateProgression(
      randomKey,
      randomScale,
      template?.degrees || [],
      4,
      addExtensions,
      melodyEnabled,
      {
        energy: selectedEnergy,
        groove: selectedGroove,
        drumStyle: selectedDrumStyle,
        beatDrop: selectedBeatDrop,
        instrument: selectedInstrument
      }
    );
    setProgression(newProgression);
    setIsGenerating(false);
    playComplete(); // Success fanfare
  }, [isPlaying, stopPlayback, addExtensions, melodyEnabled, playComplete, selectedEnergy, selectedGroove, selectedDrumStyle, selectedBeatDrop, selectedInstrument]);

  const handlePlay = useCallback(() => {
    if (progression) {
      playProgression(progression.chords, selectedRhythmPattern, 'sine');
    }
  }, [progression, playProgression, selectedRhythmPattern]);

  const handleExport = useCallback(async () => {
    if (!progression) return;

    setIsExporting(true);
    setExportSuccess(false);

    // Simulate export process with delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const midiData = progressionToMidiData(progression);
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `progression_${selectedKey}_${selectedScale}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccess(true);
    
    // Reset success state after 3 seconds
    setTimeout(() => setExportSuccess(false), 3000);
  }, [progression, selectedKey, selectedScale]);

  const handleSaveLoad = useCallback(() => {
    setShowSaveLoad(true);
  }, []);

  const handleLoadIdea = useCallback((idea: SavedIdea) => {
    // Load progression
    setProgression(idea.progression);
    
    // Load settings
    setSelectedKey(idea.settings.selectedKey);
    setSelectedScale(idea.settings.selectedScale);
    setSelectedTemplate(idea.settings.selectedTemplate);
    setSelectedRhythmPattern(idea.settings.selectedRhythmPattern);
    setAddExtensions(idea.settings.addExtensions);
    setMelodyEnabled(idea.settings.melodyEnabled);
  }, []);

  const handleChordHover = useCallback((chord: { root: string; quality: string; name: string }) => {
    if (!isPlaying) {
      playChordPreview(chord);
    }
  }, [isPlaying, playChordPreview]);

  const handleModeToggle = useCallback(() => {
    playToggle();
    setIsAdvancedMode(prev => !prev);
  }, [playToggle]);

  const handleSoundToggle = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen theme-transition">
      {/* Header - FF7 Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0515] via-[#150a25] to-[#0a0515] animate-floating-bg" style={{backgroundSize: '400% 400%'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.1),transparent_50%)]" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400/50 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-amber-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          {/* Top Controls */}
          <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
            {/* Home Button */}
            <a
              href="https://zaylegend.com"
              onClick={() => playClick()}
              className="inline-flex items-center gap-2 px-4 py-2 ff7-panel rounded-xl text-purple-200 hover:text-white transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </a>

            {/* Mode & Sound Toggles */}
            <div className="flex items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={handleSoundToggle}
                className="p-2 ff7-panel rounded-lg text-purple-200 hover:text-white transition-all"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Mode Toggle */}
              <button
                onClick={handleModeToggle}
                className={`flex items-center gap-2 px-4 py-2 ff7-panel rounded-xl transition-all duration-200 ${
                  isAdvancedMode ? 'text-amber-300' : 'text-purple-200'
                }`}
              >
                {isAdvancedMode ? <Settings className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                <span className="hidden sm:inline text-sm font-medium">
                  {isAdvancedMode ? 'Advanced' : 'Simple'}
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-2xl border border-purple-400/30" style={{boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'}}>
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="materia-indicator active" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-glow bg-gradient-to-r from-purple-200 via-white to-amber-200 bg-clip-text text-transparent">
                Chord Genesis
              </h1>
            </div>
            <p className="text-purple-200 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Generate beautiful chord progressions with intelligent music theory.
              <br />
              <span className="text-amber-300 text-glow-gold">Export to MIDI and use in your favorite DAW.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-purple-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Real-time Audio Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Professional MIDI Export</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Rhythmic Patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Music Theory Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Enhanced Controls */}
          <EnhancedControls
            selectedKey={selectedKey}
            selectedScale={selectedScale}
            selectedTemplate={selectedTemplate}
            selectedRhythmPattern={selectedRhythmPattern}
            selectedGenre={selectedGenre}
            selectedBPM={selectedBPM}
            customInput={customInput}
            isPlaying={isPlaying}
            addExtensions={addExtensions}
            melodyEnabled={melodyEnabled}
            isExporting={isExporting}
            exportSuccess={exportSuccess}
            isAdvancedMode={isAdvancedMode}
            onKeyChange={setSelectedKey}
            onScaleChange={setSelectedScale}
            onTemplateChange={setSelectedTemplate}
            onRhythmChange={setSelectedRhythmPattern}
            onGenreChange={setSelectedGenre}
            onBPMChange={setSelectedBPM}
            onCustomInputChange={setCustomInput}
            onShuffle={() => { playGenerate(); handleGenerate(); }}
            onRandomize={() => { playGenerate(); handleRandomize(); }}
            onPlay={() => { playClick(); handlePlay(); }}
            onExport={() => { playClick(); handleExport(); }}
            onExtensionsChange={setAddExtensions}
            onMelodyChange={setMelodyEnabled}
            onSaveLoad={() => { playClick(); handleSaveLoad(); }}
          />

          {/* Advanced Controls Panel - Only shown in Advanced mode */}
          {isAdvancedMode && (
            <AdvancedControlsPanel
              energy={selectedEnergy}
              groove={selectedGroove}
              drumStyle={selectedDrumStyle}
              instrument={selectedInstrument}
              beatDrop={selectedBeatDrop}
              artistStyle={selectedArtistStyle}
              skipMusicStyle={skipMusicStyle}
              onEnergyChange={setSelectedEnergy}
              onGrooveChange={setSelectedGroove}
              onDrumStyleChange={setSelectedDrumStyle}
              onInstrumentChange={setSelectedInstrument}
              onBeatDropChange={setSelectedBeatDrop}
              onArtistStyleChange={setSelectedArtistStyle}
              onSkipMusicStyleChange={setSkipMusicStyle}
            />
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="ff7-panel rounded-2xl p-8">
              <LoadingCrystal message="Crafting your progression..." />
            </div>
          )}

          {/* Chord Progression Display */}
          {progression && (
            <div className="space-y-8 animate-slide-up">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-200 mb-3">
                  {selectedKey} {progression.scale.charAt(0).toUpperCase() + progression.scale.slice(1)} Scale
                </h2>
                <p className="text-gray-400 text-lg">
                  {selectedTemplate !== 'Random' ? selectedTemplate : 'Custom Progression'} • {selectedRhythmPattern}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {progression.chords.map((chord, index) => (
                  <ChordCard
                    key={`${chord.root}-${chord.quality}-${index}`}
                    chord={chord}
                    index={index}
                    isPlaying={currentChordIndex === index}
                    onHover={() => handleChordHover(chord)}
                  />
                ))}
              </div>

              {/* Playback Bar */}
              <PlaybackBar
                isPlaying={isPlaying}
                isLooping={isLooping}
                currentChordIndex={currentChordIndex}
                totalChords={progression.chords.length}
                onPlay={handlePlay}
                onToggleLoop={toggleLoop}
                tempo={tempo}
                onTempoChange={setTempo}
                masterVolume={masterVolume}
                onVolumeChange={setMasterVolume}
              />

              {/* AI Music Generator */}
              <MusicGeneratorPanel
                currentProgression={progression}
                selectedKey={selectedKey}
                selectedScale={selectedScale}
              />
            </div>
          )}

          {/* Welcome State */}
          {!progression && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
                    <div className="absolute inset-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-500" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-4">
                  Ready to create music?
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Click "Generate" to create your first chord progression.<br />
                  <span className="text-sm text-gray-500">Choose rhythm patterns • Hover over chords to preview • Export as MIDI</span>
                </p>
                <button
                  onClick={handleGenerate}
                  className="btn-primary text-lg px-10 py-4"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save/Load Panel */}
      {showSaveLoad && (
        <SaveLoadPanel
          currentIdea={progression ? {
            progression,
            settings: {
              selectedKey,
              selectedScale,
              selectedTemplate,
              selectedRhythmPattern,
              addExtensions,
              melodyEnabled
            }
          } : null}
          onLoad={handleLoadIdea}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-700/50 glass-panel">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p className="font-medium">Built for musicians, producers, and creators worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;