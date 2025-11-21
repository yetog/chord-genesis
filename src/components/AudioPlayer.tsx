import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, RotateCcw, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioData: ArrayBuffer | null;
  title: string;
  isGenerating?: boolean;
  onDownload?: () => void;
}

export default function AudioPlayer({ audioData, title, isGenerating = false, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0); // Maximum default volume
  const [volumeBoost, setVolumeBoost] = useState(true); // Enable volume boost by default
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Create audio URL when audioData changes
  useEffect(() => {
    if (audioData) {
      // Clean up previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Create new blob and URL with higher volume
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Reset player state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
    
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioData]);

  // Set up audio element when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;
      audio.src = audioUrl;
      // Apply volume boost if enabled
      const effectiveVolume = volumeBoost ? Math.min(volume * 2.5, 1.0) : volume;
      audio.volume = effectiveVolume;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl, volume, volumeBoost]);

  const togglePlayPause = async () => {
    if (!audioRef.current || !audioData) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        // Critical mobile fix: Handle play promise and user interaction
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
        // Don't update playing state if play failed
        return;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      // Apply volume boost if enabled
      const effectiveVolume = volumeBoost ? Math.min(newVolume * 2.5, 1.0) : newVolume;
      audioRef.current.volume = effectiveVolume;
    }
  };

  const toggleVolumeBoost = () => {
    setVolumeBoost(!volumeBoost);
    // Re-apply volume with new boost setting
    if (audioRef.current) {
      const effectiveVolume = !volumeBoost ? Math.min(volume * 2.5, 1.0) : volume;
      audioRef.current.volume = effectiveVolume;
    }
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!audioData || !onDownload) return;
    onDownload();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isGenerating) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300">Generating your music...</span>
        </div>
      </div>
    );
  }

  if (!audioData) {
    return (
      <div className="bg-gray-800/20 border border-gray-600/30 rounded-xl p-4 text-center">
        <p className="text-gray-400">Generate music to see the player</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 space-y-4">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Title */}
      <div className="text-center">
        <h4 className="font-medium text-gray-200 truncate">{title}</h4>
        <p className="text-sm text-gray-400">
          {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'Loading...'}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="w-full h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-10 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors duration-200"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          
          {/* Reset */}
          <button
            onClick={resetAudio}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVolumeBoost}
            className={`flex items-center justify-center w-6 h-6 rounded transition-colors duration-200 ${
              volumeBoost ? 'text-amber-400 bg-amber-400/20' : 'text-gray-400 bg-gray-600/20'
            }`}
            title={volumeBoost ? 'Volume boost enabled' : 'Volume boost disabled'}
          >
            {volumeBoost ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(245, 158, 11) 0%, rgb(245, 158, 11) ${volume * 100}%, rgb(75, 85, 99) ${volume * 100}%, rgb(75, 85, 99) 100%)`
            }}
          />
          {volumeBoost && (
            <span className="text-xs text-amber-400 font-medium">BOOST</span>
          )}
        </div>
        
        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors duration-200"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}