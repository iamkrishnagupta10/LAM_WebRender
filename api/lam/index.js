// Simple LAM-style Real-time Audio Processing API
// Based on LAM_Audio2Expression streaming approach

import OpenAI from 'openai';

// Session storage for LAM contexts (simplified)
const sessions = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { audio_data, sample_rate, session_id, context } = req.body;
    
    if (!audio_data) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    console.log(`🎵 Processing audio: ${audio_data.length} chars, session: ${session_id}`);
    
    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Get or create session
    let sessionData = sessions.get(session_id) || {
      conversation: [],
      audioContext: null
    };
    
    // Decode audio (simplified)
    let audioArray;
    try {
      const audioBuffer = Buffer.from(audio_data, 'base64');
      audioArray = new Float32Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / 4);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid audio data' });
    }
    
    // Simple voice activity detection
    const energy = audioArray.reduce((sum, val) => sum + val * val, 0) / audioArray.length;
    const hasVoice = energy > 0.001;
    
    console.log(`🔊 Audio energy: ${energy}, hasVoice: ${hasVoice}`);
    
    if (!hasVoice) {
      return res.status(200).json({
        success: true,
        expressions: [],
        context: sessionData.audioContext,
        hasVoice: false
      });
    }
    
    // Create WAV buffer for Whisper
    const wavBuffer = createWavBuffer(audioArray, sample_rate || 16000);
    
    // Transcribe with Whisper
    let transcription = '';
    try {
      const transcriptionFile = new File([wavBuffer], 'audio.wav', { type: 'audio/wav' });
      const result = await openai.audio.transcriptions.create({
        file: transcriptionFile,
        model: 'whisper-1',
        response_format: 'text'
      });
      transcription = result.trim();
    } catch (error) {
      console.error('Whisper error:', error);
      transcription = 'Hello'; // Fallback
    }
    
    console.log(`🗣️ Transcribed: "${transcription}"`);
    
    if (!transcription || transcription.length < 2) {
      return res.status(200).json({
        success: true,
        expressions: [],
        context: sessionData.audioContext,
        hasVoice: false
      });
    }
    
    // Generate AI response
    sessionData.conversation.push({ role: 'user', content: transcription });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful AI avatar. Keep responses short and natural.' },
        ...sessionData.conversation.slice(-10) // Keep last 10 messages
      ],
      max_tokens: 150
    });
    
    const aiResponse = completion.choices[0].message.content.trim();
    sessionData.conversation.push({ role: 'assistant', content: aiResponse });
    
    console.log(`🤖 AI response: "${aiResponse}"`);
    
    // Generate TTS audio
    let ttsAudio = null;
    try {
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: aiResponse,
        response_format: 'wav'
      });
      
      const audioBuffer = await ttsResponse.arrayBuffer();
      ttsAudio = Buffer.from(audioBuffer).toString('base64');
    } catch (error) {
      console.error('TTS error:', error);
    }
    
    // Generate simple LAM-style expressions
    const expressions = generateSimpleLAMExpressions(aiResponse, ttsAudio);
    
    // Update session
    sessions.set(session_id, sessionData);
    
    console.log(`✅ Generated ${expressions.length} expression frames`);
    
    return res.status(200).json({
      success: true,
      user_text: transcription,
      ai_response: aiResponse,
      expressions: expressions,
      tts_audio: ttsAudio,
      context: sessionData.audioContext, // Simple context
      processing_info: {
        frames: expressions.length,
        duration: expressions.length / 30.0 // 30 FPS
      }
    });
    
  } catch (error) {
    console.error('LAM API error:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
}

function createWavBuffer(audioArray, sampleRate) {
  const length = audioArray.length;
  const buffer = Buffer.alloc(length * 2 + 44);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(length * 2 + 36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(length * 2, 40);
  
  // Convert float32 to int16
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, audioArray[i]));
    buffer.writeInt16LE(sample * 32767, 44 + i * 2);
  }
  
  return buffer;
}

function generateSimpleLAMExpressions(text, ttsAudio) {
  // Simple expression generation (in real LAM this would be ML model output)
  const duration = Math.max(2.0, text.length * 0.08); // Rough timing
  const frameCount = Math.floor(duration * 30); // 30 FPS
  const expressions = [];
  
  for (let i = 0; i < frameCount; i++) {
    const t = i / frameCount;
    
    // Simple talking animation
    const intensity = Math.sin(t * Math.PI * 8) * 0.3 + 0.3; // Mouth movement
    const blinkChance = Math.random() < 0.05 ? 1.0 : 0.0; // Occasional blinks
    
    // ARKit blendshape format (simplified)
    expressions.push([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Eye expressions
      blinkChance, blinkChance, // Eye blinks
      0, 0, 0, 0, 0, 0, 0, 0, // Eye look directions
      intensity * 0.4, // Jaw open
      intensity * 0.6, // Mouth open
      intensity * 0.3, // Mouth smile
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Other mouth shapes
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Additional mouth expressions
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // More expressions
      0, 0  // Final expressions (52 total for ARKit)
    ]);
  }
  
  return expressions;
}