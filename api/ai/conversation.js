// Vercel Serverless Function for AI Conversation Pipeline
import OpenAI from 'openai';

// Session storage for conversation context
const conversations = new Map();

// Simple VAD using energy-based detection
function detectSpeechActivity(audioArray, sampleRate = 16000) {
  const frameLength = Math.floor(0.025 * sampleRate); // 25ms frames
  const hopLength = Math.floor(0.010 * sampleRate);    // 10ms hop
  const threshold = 0.01; // Lowered threshold
  const minDuration = 0.5; // Shorter minimum duration
  
  const frames = [];
  for (let i = 0; i < audioArray.length - frameLength; i += hopLength) {
    const frame = audioArray.slice(i, i + frameLength);
    const rms = Math.sqrt(frame.reduce((sum, val) => sum + val * val, 0) / frame.length);
    frames.push(rms);
  }
  
  // Find speech segments
  const speechFrames = frames.map(rms => rms > threshold);
  const speechSegments = [];
  let start = null;
  
  for (let i = 0; i < speechFrames.length; i++) {
    if (speechFrames[i] && start === null) {
      start = i;
    } else if (!speechFrames[i] && start !== null) {
      const duration = (i - start) * hopLength / sampleRate;
      if (duration >= minDuration) {
        speechSegments.push([start * hopLength, i * hopLength]);
      }
      start = null;
    }
  }
  
  // Handle case where speech continues to end
  if (start !== null) {
    const duration = (speechFrames.length - start) * hopLength / sampleRate;
    if (duration >= minDuration) {
      speechSegments.push([start * hopLength, audioArray.length]);
    }
  }
  
  return speechSegments;
}

// Simple LAM expression generator
function generateSimpleLAMExpressions(text, audioDuration) {
  const frameRate = 30; // 30 FPS
  const totalFrames = Math.floor(audioDuration * frameRate);
  const expressions = [];
  
  // Generate basic talking expressions based on text
  const vowels = 'aeiouAEIOU';
  const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
  
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const charIndex = Math.floor(progress * text.length);
    const char = text[charIndex] || ' ';
    
    // Create basic ARKit blendshape values
    const expression = new Array(52).fill(0);
    
    // Basic mouth movements
    if (vowels.includes(char)) {
      expression[17] = 0.4 + Math.sin(progress * Math.PI * 6) * 0.3; // jawOpen
      expression[18] = 0.1; // mouthClose
      expression[23] = 0.2; // mouthSmileLeft
      expression[24] = 0.2; // mouthSmileRight
    } else if (consonants.includes(char)) {
      expression[17] = 0.15; // jawOpen
      expression[18] = 0.4; // mouthClose
      expression[19] = 0.3; // mouthFunnel
      expression[20] = 0.2; // mouthPucker
    }
    
    // Basic eye blinks
    if (Math.random() < 0.03) {
      expression[0] = 0.9; // eyeBlinkLeft
      expression[7] = 0.9; // eyeBlinkRight
    }
    
    // Eyebrow movements for expression
    expression[43] = 0.1 + Math.sin(progress * Math.PI * 3) * 0.1; // browInnerUp
    expression[44] = 0.05 + Math.sin(progress * Math.PI * 2) * 0.05; // browOuterUpLeft
    expression[45] = 0.05 + Math.sin(progress * Math.PI * 2) * 0.05; // browOuterUpRight
    
    expressions.push(expression);
  }
  
  return expressions;
}

export default async function handler(req, res) {
  console.log('🚀 AI Conversation endpoint called');
  
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
    const { audio_data, sample_rate, session_id } = req.body;
    
    if (!audio_data) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    console.log('📋 Request received:', {
      audioDataLength: audio_data.length,
      sampleRate: sample_rate,
      sessionId: session_id
    });

    // **NEW APPROACH**: Stream-process audio instead of loading all at once
    let audioArray;
    try {
      console.log('🔍 Stream-processing audio data...');
      
      // Decode base64 in smaller chunks to avoid stack overflow
      const chunkSize = 1024 * 1024; // 1MB chunks
      const audioChunks = [];
      
      for (let i = 0; i < audio_data.length; i += chunkSize) {
        const chunk = audio_data.slice(i, i + chunkSize);
        const decodedChunk = Buffer.from(chunk, 'base64');
        audioChunks.push(decodedChunk);
      }
      
      // Combine chunks
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const audioBuffer = Buffer.concat(audioChunks, totalLength);
      
      console.log('🔍 Audio buffer created:', {
        totalLength,
        chunks: audioChunks.length
      });
      
      // Convert to Float32Array safely
      if (audioBuffer.length % 4 !== 0) {
        console.error('❌ Audio buffer length not divisible by 4:', audioBuffer.length);
        return res.status(400).json({ 
          error: 'Invalid audio data format - buffer length not divisible by 4',
          bufferLength: audioBuffer.length 
        });
      }
      
      // Process in smaller chunks to avoid stack overflow
      const floatArrayLength = audioBuffer.length / 4;
      audioArray = new Float32Array(floatArrayLength);
      
      // Fill array in chunks
      const processChunkSize = 8192; // Process 8K floats at a time
      for (let i = 0; i < floatArrayLength; i += processChunkSize) {
        const endIndex = Math.min(i + processChunkSize, floatArrayLength);
        const chunkBuffer = audioBuffer.slice(i * 4, endIndex * 4);
        const chunkArray = new Float32Array(chunkBuffer.buffer, chunkBuffer.byteOffset, chunkBuffer.length / 4);
        audioArray.set(chunkArray, i);
      }
      
      console.log('🎵 Audio processed successfully:', {
        arrayLength: audioArray.length,
        maxAmplitude: audioArray.length > 0 ? Math.max(...Array.from(audioArray.slice(0, 1000)).map(Math.abs)) : 0
      });
      
      if (audioArray.length === 0) {
        return res.status(400).json({ error: 'Audio array is empty after conversion' });
      }
      
    } catch (decodeError) {
      console.error('❌ Audio decode error:', decodeError);
      return res.status(400).json({ 
        error: 'Audio processing failed', 
        details: decodeError.message,
        audioDataLength: audio_data?.length || 0
      });
    }

    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found in environment');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Step 1: VAD - Voice Activity Detection (simplified)
    const energy = audioArray.reduce((sum, val) => sum + val * val, 0) / audioArray.length;
    const hasVoice = energy > 0.001; // Simple energy threshold
    
    console.log('🔊 VAD result:', { energy, hasVoice });
    
    if (!hasVoice) {
      return res.status(200).json({
        success: true,
        message: 'No voice detected',
        has_voice: false
      });
    }
    
    // Step 2: ASR - Whisper Transcription (FIXED)
    try {
      // Create WAV file buffer for Whisper
      const speechLength = audioArray.length; // Use the full audio array for transcription
      const wavBuffer = Buffer.alloc(speechLength * 2 + 44);
      
      // WAV header
      wavBuffer.write('RIFF', 0);
      wavBuffer.writeUInt32LE(wavBuffer.length - 8, 4);
      wavBuffer.write('WAVE', 8);
      wavBuffer.write('fmt ', 12);
      wavBuffer.writeUInt32LE(16, 16);
      wavBuffer.writeUInt16LE(1, 20);
      wavBuffer.writeUInt16LE(1, 22);
      wavBuffer.writeUInt32LE(sample_rate, 24);
      wavBuffer.writeUInt32LE(sample_rate * 2, 28);
      wavBuffer.writeUInt16LE(2, 32);
      wavBuffer.writeUInt16LE(16, 34);
      wavBuffer.write('data', 36);
      wavBuffer.writeUInt32LE(speechLength * 2, 40);
      
      // Convert float32 to int16
      for (let i = 0; i < speechLength; i++) {
        const sample = Math.max(-1, Math.min(1, audioArray[i])); // Use audioArray directly
        wavBuffer.writeInt16LE(sample * 32767, 44 + i * 2);
      }
      
      console.log('🎵 WAV buffer created:', wavBuffer.length, 'bytes');
      
      // Create File object for Whisper API (FIXED FOR SERVERLESS)
      const audioFile = new File([wavBuffer], 'audio.wav', { type: 'audio/wav' });
      
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en'
      });
      
      const userText = transcriptionResponse.text.trim();
      console.log('🎤 Whisper transcribed:', userText);
      
      if (!userText || userText.length < 2) {
        return res.status(200).json({
          success: false,
          message: 'Could not transcribe speech clearly',
          debug: { transcription: userText }
        });
      }
      
      // Step 3: LLM - Generate AI Response
      let conversationHistory = conversations.get(session_id) || [
        {
          role: 'system',
          content: 'You are a helpful AI assistant embodied as a 3D avatar. Keep responses conversational, friendly, and concise (1-2 sentences). Speak naturally as if you\'re really there talking to the person. Be engaging and helpful.'
        }
      ];
      
      conversationHistory.push({ role: 'user', content: userText });
      
      // Keep conversation manageable
      if (conversationHistory.length > 20) {
        conversationHistory = [conversationHistory[0], ...conversationHistory.slice(-18)];
      }
      
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        max_tokens: 100,
        temperature: 0.8
      });
      
      const aiResponse = chatResponse.choices[0].message.content.trim();
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      conversations.set(session_id, conversationHistory);
      
      console.log('🤖 AI response generated:', aiResponse);
      
      // Step 4: TTS - Generate Speech
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: aiResponse,
        response_format: 'wav'
      });
      
      const ttsBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      console.log('🔊 TTS audio generated:', ttsBuffer.length, 'bytes');
      
      // Convert TTS audio to float32 array for client
      const ttsAudioData = ttsBuffer.slice(44); // Skip WAV header
      const ttsAudioArray = new Float32Array(ttsAudioData.length / 2);
      
      for (let i = 0; i < ttsAudioArray.length; i++) {
        const sample = ttsAudioData.readInt16LE(i * 2);
        ttsAudioArray[i] = sample / 32767;
      }
      
      const audioDuration = ttsAudioArray.length / sample_rate;
      console.log('🎵 Audio duration:', audioDuration, 'seconds');
      
      // Step 5: LAM - Generate Facial Expressions
      const lamExpressions = generateSimpleLAMExpressions(aiResponse, audioDuration);
      console.log('🎭 LAM expressions generated:', lamExpressions.length, 'frames');
      
      // Encode TTS audio for client
      const responseAudioBase64 = Buffer.from(ttsAudioArray.buffer).toString('base64');
      
      const result = {
        success: true,
        user_text: userText,
        ai_response: aiResponse,
        response_audio: responseAudioBase64,
        response_sample_rate: sample_rate,
        audio_duration: audioDuration,
        lam_expressions: lamExpressions,
        processing_info: {
          speech_segments: 1, // Simplified VAD
          speech_duration: audioArray.length / sample_rate,
          response_duration: audioDuration,
          expression_frames: lamExpressions.length
        }
      };
      
      console.log('✅ Conversation processing complete');
      return res.status(200).json(result);
      
    } catch (whisperError) {
      console.error('❌ Whisper transcription error:', whisperError);
      
      // Return detailed error for debugging
      return res.status(500).json({
        success: false,
        error: 'Speech transcription failed',
        details: whisperError.message,
        stage: 'whisper_transcription'
      });
    }
    
  } catch (error) {
    console.error('❌ Conversation processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      stage: 'general_error'
    });
  }
}