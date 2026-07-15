/**
 * ElevenLabs Service - Uses server-side proxy to keep API key secure
 * All requests go through /api/elevenlabs/* endpoints
 */

const API_BASE = '/api/elevenlabs';

export interface TextToSpeechOptions {
  text: string;
  voice?: string;
  stability?: number;
  similarity_boost?: number;
}

export interface MusicGenerationOptions {
  prompt?: string;
  music_length_ms?: number;
  force_instrumental?: boolean;
}

export interface ElevenLabsStatus {
  configured: boolean;
  key_preview: string | null;
  tier?: string;
  character_count?: number;
  character_limit?: number;
}

/**
 * Check ElevenLabs API status and configuration
 */
export async function checkStatus(): Promise<ElevenLabsStatus> {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) {
    throw new Error('Failed to check ElevenLabs status');
  }
  return response.json();
}

/**
 * Get available voices
 */
export async function getVoices(): Promise<any> {
  const response = await fetch(`${API_BASE}/voices`);
  if (!response.ok) {
    throw new Error('Failed to fetch voices');
  }
  return response.json();
}

/**
 * Convert text to speech using server-side proxy
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<ArrayBuffer> {
  const { text, voice = 'pNInz6obpgDQGcFmaJgB', stability = 0.5, similarity_boost = 0.5 } = options;

  const response = await fetch(`${API_BASE}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice_id: voice,
      stability,
      similarity_boost,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to generate speech');
  }

  return response.arrayBuffer();
}

/**
 * Generate music using server-side proxy
 */
export async function generateMusic(options: MusicGenerationOptions): Promise<ArrayBuffer> {
  const { prompt, music_length_ms = 30000, force_instrumental = true } = options;

  if (!prompt) {
    throw new Error('Prompt is required for music generation');
  }

  const response = await fetch(`${API_BASE}/music/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      music_length_ms,
      force_instrumental,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to generate music');
  }

  return response.arrayBuffer();
}

/**
 * Generate sound effects using server-side proxy
 */
export async function generateSound(text: string, durationSeconds: number = 10.0): Promise<ArrayBuffer> {
  const response = await fetch(`${API_BASE}/generate-sound`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      duration_seconds: durationSeconds,
      prompt_influence: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to generate sound');
  }

  return response.arrayBuffer();
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
