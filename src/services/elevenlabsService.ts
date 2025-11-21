import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Get API key with fallback
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_8e01678d62936838bc440a754e187457811e36b93613dca6';
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required. Please set VITE_ELEVENLABS_API_KEY environment variable.');
  }
  
  return apiKey;
};

// Initialize the ElevenLabs client
let elevenlabs: ElevenLabsClient;

const getElevenLabsClient = (): ElevenLabsClient => {
  if (!elevenlabs) {
    try {
      elevenlabs = new ElevenLabsClient({
        apiKey: getApiKey()
      });
    } catch (error) {
      console.error('Failed to initialize ElevenLabs client:', error);
      throw error;
    }
  }
  return elevenlabs;
};

export interface TextToSpeechOptions {
  text: string;
  voice?: string;
  stability?: number;
  similarity_boost?: number;
}

export interface CompositionPlan {
  positiveGlobalStyles: string[];
  negativeGlobalStyles: string[];
  sections: Array<{
    sectionName: string;
    positiveLocalStyles: string[];
    negativeLocalStyles: string[];
    durationMs: number;
    lines: string[];
  }>;
}

export interface MusicGenerationOptions {
  prompt?: string;
  music_length_ms?: number;
  composition_plan?: CompositionPlan;
  force_instrumental?: boolean;
}

/**
 * Convert ReadableStream to ArrayBuffer
 */
async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  // Calculate total length
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  
  // Create result array
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  // Copy all chunks
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result.buffer;
}

/**
 * Convert text to speech using ElevenLabs API
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<ArrayBuffer> {
  const { text, voice = 'pNInz6obpgDQGcFmaJgB', stability = 0.5, similarity_boost = 0.5 } = options;

  try {
    const client = getElevenLabsClient();
    const response = await client.textToSpeech.convert(voice, {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability,
        similarity_boost
      }
    });

    return await streamToArrayBuffer(response);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Generate music using ElevenLabs Music API
 */
export async function generateMusic(options: MusicGenerationOptions): Promise<ArrayBuffer> {
  const { prompt, music_length_ms = 30000, composition_plan, force_instrumental = true } = options;

  try {
    const client = getElevenLabsClient();
    
    // Validate duration (API accepts 10000ms to 300000ms)
    const validatedDuration = Math.max(10000, Math.min(music_length_ms, 300000));
    
    const requestBody: any = {};
    
    if (composition_plan) {
      requestBody.compositionPlan = composition_plan;
      requestBody.respectSectionsDurations = true;
    } else if (prompt) {
      requestBody.prompt = prompt;
      requestBody.musicLengthMs = validatedDuration; // Use camelCase
      requestBody.forceInstrumental = force_instrumental;
      requestBody.modelId = "music_v1";
    } else {
      throw new Error('Either prompt or composition_plan is required');
    }

    console.log('Music generation request:', requestBody); // Debug log
    
    const response = await client.music.compose(requestBody);
    return await streamToArrayBuffer(response);
  } catch (error) {
    console.error('Music generation error:', error);
    if ((error as any).body?.detail?.status === 'bad_prompt') {
      const suggestion = (error as any).body.detail.data?.prompt_suggestion;
      throw new Error(`Copyrighted material detected. Try: "${suggestion}"`);
    }
    throw new Error('Failed to generate music');
  }
}

/**
 * Create a composition plan from a prompt
 */
export async function createCompositionPlan(prompt: string, music_length_ms: number = 30000) {
  try {
    const client = getElevenLabsClient();
    const plan = await client.music.compositionPlan.create({
      prompt,
      music_length_ms,
    });
    return plan;
  } catch (error) {
    console.error('Composition plan error:', error);
    if ((error as any).body?.detail?.status === 'bad_prompt') {
      const suggestion = (error as any).body.detail.data?.prompt_suggestion;
      throw new Error(`Copyrighted material detected. Try: "${suggestion}"`);
    }
    throw new Error('Failed to create composition plan');
  }
}

/**
 * Generate music with detailed response (includes composition plan)
 */
export async function generateMusicDetailed(prompt: string, music_length_ms: number = 30000): Promise<{ audio: ArrayBuffer; json: { composition_plan: CompositionPlan } }> {
  try {
    const client = getElevenLabsClient();
    const response = await client.music.composeDetailed({
      prompt,
      music_length_ms,
    });
    
    const audio = await streamToArrayBuffer(response);
    return {
      audio,
      json: { composition_plan: {} as CompositionPlan } // This would need to be parsed from response
    };
  } catch (error) {
    console.error('Detailed music generation error:', error);
    if ((error as any).body?.detail?.status === 'bad_prompt') {
      const suggestion = (error as any).body.detail.data?.prompt_suggestion;
      throw new Error(`Copyrighted material detected. Try: "${suggestion}"`);
    }
    throw new Error('Failed to generate detailed music');
  }
}

/**
 * Play audio buffer directly (for preview) - Browser compatible version with volume boost
 */
export async function playAudio(audioBuffer: ArrayBuffer): Promise<void> {
  try {
    // Create audio context for browser playback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBufferData = await audioContext.decodeAudioData(audioBuffer.slice());
    
    // Create source and gain node for volume boost
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = audioBufferData;
    
    // Boost the volume by 3x (adjust as needed)
    gainNode.gain.value = 3.0;
    
    // Connect: source -> gain -> destination
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    
    // Return a promise that resolves when playback ends
    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  } catch (error) {
    console.error('Audio playback error:', error);
    throw new Error('Failed to play audio');
  }
}

/**
 * Convert audio buffer to blob for download
 */
export function audioBufferToBlob(audioBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Blob {
  return new Blob([audioBuffer], { type: mimeType });
}

/**
 * Download audio as file
 */
export function downloadAudio(audioBuffer: ArrayBuffer, filename: string, mimeType: string = 'audio/mpeg'): void {
  const blob = audioBufferToBlob(audioBuffer, mimeType);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}