/**
 * Audio Analysis Hook for Chord Genesis
 * Connects to the Python backend for style replication
 */

import { useState, useCallback } from 'react';

// API base URL - configurable via env
const API_BASE = import.meta.env.VITE_ANALYSIS_API_URL || 'http://localhost:3020';

export interface AudioFeatures {
  // Tempo & Rhythm
  bpm: number;
  beat_strength: number;
  rhythm_complexity: number;
  groove_type: string;

  // Key & Harmony
  key: string;
  mode: string;
  key_confidence: number;
  chord_complexity: number;

  // Energy & Dynamics
  energy: number;
  energy_label: string;
  dynamics_range: number;
  loudness: number;

  // Timbre & Texture
  brightness: number;
  warmth: number;
  texture: string;

  // Mood
  mood: string;
  mood_confidence: number;

  // Genre hints
  genre_hints: string[];

  // Duration
  duration_seconds: number;
}

export interface PromptVariation {
  name: string;
  prompt: string;
  description: string;
}

export interface AnalysisResult {
  success: boolean;
  features: AudioFeatures;
  primary_prompt: string;
  style_prompt: string;
  variations: PromptVariation[];
}

export function useAudioAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Analyze an audio file
   */
  const analyzeAudio = useCallback(async (
    file: File,
    styleHints?: string[],
    customAdditions?: string
  ): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUploadProgress(0);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (styleHints && styleHints.length > 0) {
        formData.append('style_hints', styleHints.join(','));
      }

      if (customAdditions) {
        formData.append('custom_additions', customAdditions);
      }

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<AnalysisResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.detail || 'Analysis failed'));
            } catch {
              reject(new Error(`HTTP ${xhr.status}: Analysis failed`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error - is the analysis server running?'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timed out'));
        });

        xhr.open('POST', `${API_BASE}/analyze`);
        xhr.timeout = 120000; // 2 minute timeout for large files
        xhr.send(formData);
      });

      setAnalysisResult(result);
      setUploadProgress(100);
      return result;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Quick analyze - just get a prompt
   */
  const quickAnalyze = useCallback(async (file: File): Promise<string | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/quick-prompt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Quick analysis failed');
      }

      const result = await response.json();
      return result.prompt;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Get more prompt variations from existing features
   */
  const getVariations = useCallback(async (
    features: AudioFeatures,
    count: number = 3
  ): Promise<PromptVariation[]> => {
    try {
      const response = await fetch(`${API_BASE}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, count }),
      });

      if (!response.ok) {
        throw new Error('Failed to get variations');
      }

      const result = await response.json();
      return result.variations;

    } catch (error) {
      console.error('Failed to get variations:', error);
      return [];
    }
  }, []);

  /**
   * Generate a new prompt from existing features with overrides
   */
  const regeneratePrompt = useCallback(async (
    features: AudioFeatures,
    styleHints?: string[],
    customAdditions?: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE}/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, style_hints: styleHints, custom_additions: customAdditions }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const result = await response.json();
      return result.prompt;

    } catch (error) {
      console.error('Failed to regenerate prompt:', error);
      return null;
    }
  }, []);

  /**
   * Check if the analysis API is available
   */
  const checkApiHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  /**
   * Clear current analysis
   */
  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setUploadProgress(0);
  }, []);

  return {
    // State
    isAnalyzing,
    analysisResult,
    analysisError,
    uploadProgress,

    // Actions
    analyzeAudio,
    quickAnalyze,
    getVariations,
    regeneratePrompt,
    checkApiHealth,
    clearAnalysis,
  };
}
