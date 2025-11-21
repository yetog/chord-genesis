import { useState, useCallback } from 'react';
import { 
  textToSpeech, 
  generateMusic, 
  createCompositionPlan,
  generateMusicDetailed,
  playAudio,
  downloadAudio,
  TextToSpeechOptions,
  MusicGenerationOptions,
  CompositionPlan
} from '../services/elevenlabsService';

export interface UseElevenLabsState {
  isGeneratingText: boolean;
  isGeneratingMusic: boolean;
  isCreatingPlan: boolean;
  textError: string | null;
  musicError: string | null;
  planError: string | null;
  lastGeneratedAudio: ArrayBuffer | null;
  lastCompositionPlan: CompositionPlan | null;
}

export function useElevenLabs() {
  const [state, setState] = useState<UseElevenLabsState>({
    isGeneratingText: false,
    isGeneratingMusic: false,
    isCreatingPlan: false,
    textError: null,
    musicError: null,
    planError: null,
    lastGeneratedAudio: null,
    lastCompositionPlan: null,
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

  // Composition plan functions
  const generateCompositionPlan = useCallback(async (prompt: string, length: number = 30000): Promise<CompositionPlan | null> => {
    updateState({ isCreatingPlan: true, planError: null });
    
    try {
      const plan = await createCompositionPlan(prompt, length);
      updateState({ 
        isCreatingPlan: false, 
        lastCompositionPlan: plan 
      });
      return plan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create composition plan';
      updateState({ 
        isCreatingPlan: false, 
        planError: errorMessage 
      });
      return null;
    }
  }, [updateState]);

  const generateDetailedMusic = useCallback(async (prompt: string, length: number = 30000) => {
    updateState({ isGeneratingMusic: true, musicError: null });
    
    try {
      const response = await generateMusicDetailed(prompt, length);
      updateState({ 
        isGeneratingMusic: false, 
        lastGeneratedAudio: response.audio,
        lastCompositionPlan: response.json?.composition_plan
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate detailed music';
      updateState({ 
        isGeneratingMusic: false, 
        musicError: errorMessage 
      });
      return null;
    }
  }, [updateState]);

  // Utility functions
  const clearErrors = useCallback(() => {
    updateState({ 
      textError: null, 
      musicError: null, 
      planError: null 
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
    generateDetailedMusic,
    
    // Composition plans
    generateCompositionPlan,
    
    // Utilities
    clearErrors,
    playLastAudio,
    downloadLastAudio,
  };
}