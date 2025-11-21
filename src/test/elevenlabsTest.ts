// Test file for ElevenLabs integration
// This is for development testing only

import { textToSpeech, generateMusic } from '../services/elevenlabsService';

export async function testTextToSpeech() {
  try {
    console.log('Testing text-to-speech...');
    const audioBuffer = await textToSpeech({
      text: 'Testing ElevenLabs text-to-speech integration in Chord Genesis.',
      voice: 'pNInz6obpgDQGcFmaJgB'
    });
    console.log('Text-to-speech successful:', audioBuffer.byteLength, 'bytes');
    return true;
  } catch (error) {
    console.error('Text-to-speech test failed:', error);
    return false;
  }
}

export async function testMusicGeneration() {
  try {
    console.log('Testing music generation...');
    const audioBuffer = await generateMusic({
      prompt: 'Create a calm, ambient electronic track with soft synths',
      music_length_ms: 10000 // 10 seconds for testing
    });
    console.log('Music generation successful:', audioBuffer.byteLength, 'bytes');
    return true;
  } catch (error) {
    console.error('Music generation test failed:', error);
    return false;
  }
}

export async function runAllTests() {
  console.log('Running ElevenLabs integration tests...');
  
  const ttsResult = await testTextToSpeech();
  const musicResult = await testMusicGeneration();
  
  console.log('Test Results:');
  console.log('- Text-to-Speech:', ttsResult ? 'PASS' : 'FAIL');
  console.log('- Music Generation:', musicResult ? 'PASS' : 'FAIL');
  
  return ttsResult && musicResult;
}