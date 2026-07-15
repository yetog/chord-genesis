import { useState, useCallback } from 'react';
import {
  textToSpeech,
  generateMusic,
  playAudio,
  downloadAudio,
  TextToSpeechOptions,
  MusicGenerationOptions,
} from '../services/elevenlabsService';

export interface UseElevenLabsState {
  isGeneratingText: boolean;
  isGeneratingMusic: boolean;
  textError: string | null;
  musicError: string | null;
  lastGeneratedAudio: ArrayBuffer | null;
}

export function useElevenLabs() {
  const [state, setState] = useState<UseElevenLabsState>({
    isGeneratingText: false,
    isGeneratingMusic: false,
    textError: null,
    musicError: null,
    lastGeneratedAudio: null,
  });

  const updateState = useCallback((updates: Partial<UseElevenLabsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Text-to-Speech functions
  const generateSpeech = useCallback(async (options: TextToSpeechOptions): Promise<ArrayBuffer | null> => {
    updateState({ isGeneratingText: true, textError: null });

    try {
      const audioBuffer = await textToSpeech(options);
      updateState({
        isGeneratingText: false,
        lastGeneratedAudio: audioBuffer
      });
      return audioBuffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      updateState({
        isGeneratingText: false,
        textError: errorMessage
      });
      return null;
    }
  }, [updateState]);

  const speakText = useCallback(async (text: string, voice?: string): Promise<void> => {
    const audioBuffer = await generateSpeech({ text, voice });
    if (audioBuffer) {
      await playAudio(audioBuffer);
    }
  }, [generateSpeech]);

  const downloadSpeech = useCallback(async (text: string, filename: string, voice?: string): Promise<void> => {
    const audioBuffer = await generateSpeech({ text, voice });
    if (audioBuffer) {
      downloadAudio(audioBuffer, filename);
    }
  }, [generateSpeech]);

  // Music generation functions
  const generateMusicTrack = useCallback(async (options: MusicGenerationOptions): Promise<ArrayBuffer | null> => {
    updateState({ isGeneratingMusic: true, musicError: null });

    try {
      const audioBuffer = await generateMusic(options);
      updateState({
        isGeneratingMusic: false,
        lastGeneratedAudio: audioBuffer
      });
      return audioBuffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate music';
      updateState({
        isGeneratingMusic: false,
        musicError: errorMessage
      });
      return null;
    }
  }, [updateState]);

  const playGeneratedMusic = useCallback(async (prompt: string, length?: number): Promise<void> => {
    const audioBuffer = await generateMusicTrack({
      prompt,
      music_length_ms: length
    });
    if (audioBuffer) {
      await playAudio(audioBuffer);
    }
  }, [generateMusicTrack]);

  const downloadMusic = useCallback(async (prompt: string, filename: string, length?: number): Promise<void> => {
    const audioBuffer = await generateMusicTrack({
      prompt,
      music_length_ms: length
    });
    if (audioBuffer) {
      downloadAudio(audioBuffer, filename);
    }
  }, [generateMusicTrack]);

  // Utility functions
  const clearErrors = useCallback(() => {
    updateState({
      textError: null,
      musicError: null,
    });
  }, [updateState]);

  const playLastAudio = useCallback(async (): Promise<void> => {
    if (state.lastGeneratedAudio) {
      await playAudio(state.lastGeneratedAudio);
    }
  }, [state.lastGeneratedAudio]);

  const downloadLastAudio = useCallback((filename: string): void => {
    if (state.lastGeneratedAudio) {
      downloadAudio(state.lastGeneratedAudio, filename);
    }
  }, [state.lastGeneratedAudio]);

  return {
    // State
    ...state,

    // Text-to-Speech
    generateSpeech,
    speakText,
    downloadSpeech,

    // Music generation
    generateMusicTrack,
    playGeneratedMusic,
    downloadMusic,

    // Utilities
    clearErrors,
    playLastAudio,
    downloadLastAudio,
  };
}
