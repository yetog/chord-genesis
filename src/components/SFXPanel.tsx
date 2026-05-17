/**
 * SFX Panel Component for Chord Genesis
 * UI for controlling ambient textures, risers, impacts, and transitions
 */

import React, { useState } from 'react';
import {
  Waves,
  Zap,
  Target,
  ArrowRightLeft,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { useSFXLayer, SFXPreset, SFXCategory } from '../hooks/useSFXLayer';

interface SFXPanelProps {
  className?: string;
}

const CATEGORY_INFO: Record<SFXCategory, { icon: React.ReactNode; label: string; description: string }> = {
  ambient: {
    icon: <Waves className="w-4 h-4" />,
    label: 'Ambient',
    description: 'Background textures (click to toggle)'
  },
  riser: {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Risers',
    description: 'Build-up effects'
  },
  impact: {
    icon: <Target className="w-4 h-4" />,
    label: 'Impacts',
    description: 'Hits & drops'
  },
  transition: {
    icon: <ArrowRightLeft className="w-4 h-4" />,
    label: 'Transitions',
    description: 'Scene changes'
  }
};

export function SFXPanel({ className = '' }: SFXPanelProps) {
  const {
    playSFX,
    toggleAmbient,
    stopAllSFX,
    isPresetActive,
    activeSFX,
    sfxVolume,
    setSfxVolume,
    presets
  } = useSFXLayer();

  const [activeCategory, setActiveCategory] = useState<SFXCategory>('ambient');
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePresetClick = async (preset: SFXPreset) => {
    if (preset.category === 'ambient') {
      await toggleAmbient(preset.id);
    } else {
      await playSFX(preset.id);
    }
  };

  const filteredPresets = presets.filter(p => p.category === activeCategory);
  const hasActiveEffects = activeSFX.length > 0;

  return (
    <div className={`glass-panel rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">SFX Layer</h3>
            <p className="text-xs text-gray-400">Ambient, Risers, Impacts, Transitions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveEffects && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopAllSFX();
              }}
              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              Stop All
            </button>
          )}
          <div className="text-xs text-gray-500">
            {hasActiveEffects ? `${activeSFX.length} active` : 'Ready'}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Volume Control */}
          <div className="px-4 pb-3 flex items-center gap-3">
            <button
              onClick={() => setSfxVolume(sfxVolume > 0 ? 0 : 0.3)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {sfxVolume > 0 ? (
                <Volume2 className="w-4 h-4 text-gray-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-xs text-gray-500 w-12 text-right">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>

          {/* Category Tabs */}
          <div className="px-4 pb-3">
            <div className="flex gap-1 p-1 bg-black/30 rounded-lg">
              {(Object.keys(CATEGORY_INFO) as SFXCategory[]).map((category) => {
                const info = CATEGORY_INFO[category];
                const isActive = category === activeCategory;
                const categoryPresets = presets.filter(p => p.category === category);
                const hasActiveInCategory = categoryPresets.some(p => isPresetActive(p.id));

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-500/30 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {info.icon}
                    <span className="hidden sm:inline">{info.label}</span>
                    {hasActiveInCategory && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Description */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500">{CATEGORY_INFO[activeCategory].description}</p>
          </div>

          {/* Presets Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredPresets.map((preset) => {
                const isActive = isPresetActive(preset.id);

                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`relative p-3 rounded-lg text-left transition-all group ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 ring-1 ring-purple-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Color indicator */}
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />

                    {/* Play indicator for non-ambient */}
                    {preset.category !== 'ambient' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white/50" />
                      </div>
                    )}

                    <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {preset.description}
                    </div>

                    {/* Duration badge for one-shots */}
                    {preset.duration && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        {(preset.duration / 1000).toFixed(1)}s
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-2 right-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Effects List */}
          {hasActiveEffects && (
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-500 mb-2">Active Effects</div>
              <div className="flex flex-wrap gap-2">
                {activeSFX.map((sfx) => {
                  const preset = presets.find(p => p.id === sfx.presetId);
                  if (!preset) return null;

                  return (
                    <div
                      key={sfx.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 text-xs"
                    >
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-gray-300">{preset.name}</span>
                      {sfx.isLooping && (
                        <span className="text-gray-500">looping</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="px-4 pb-4">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-300">
                <strong>Tip:</strong> Layer ambient textures while playing your progression.
                Use risers before beat drops and impacts for transitions!
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SFXPanel;
