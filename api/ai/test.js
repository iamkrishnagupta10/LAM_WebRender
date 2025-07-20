// Simple test endpoint for AI functionality
import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('🧪 Testing AI functionality...');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        status: 'failed'
      });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Test text input or use default
    const testText = req.body?.text || "Hello! I'm your AI avatar. This is a test to make sure I can speak to you!";
    
    console.log('🗣️ Generating TTS for:', testText);
    
    // Generate TTS
    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: testText,
      response_format: 'wav'
    });
    
    const ttsBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    console.log('🔊 TTS generated:', ttsBuffer.length, 'bytes');
    
    // Convert to float32 for client
    const ttsAudioData = ttsBuffer.slice(44); // Skip WAV header
    const ttsAudioArray = new Float32Array(ttsAudioData.length / 2);
    
    for (let i = 0; i < ttsAudioArray.length; i++) {
      const sample = ttsAudioData.readInt16LE(i * 2);
      ttsAudioArray[i] = sample / 32767;
    }
    
    const audioDuration = ttsAudioArray.length / 16000;
    
    // Generate simple expressions
    const frameRate = 30;
    const totalFrames = Math.floor(audioDuration * frameRate);
    const expressions = [];
    
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const expression = new Array(52).fill(0);
      
      // Basic talking animation
      expression[17] = 0.3 + Math.sin(progress * Math.PI * 8) * 0.2; // jawOpen
      expression[18] = 0.2; // mouthClose
      
      // Eye blinks
      if (Math.random() < 0.03) {
        expression[0] = 0.8; // eyeBlinkLeft
        expression[7] = 0.8; // eyeBlinkRight
      }
      
      expressions.push(expression);
    }
    
    // Encode audio
    const responseAudioBase64 = Buffer.from(ttsAudioArray.buffer).toString('base64');
    
    console.log('✅ Test successful');
    
    return res.status(200).json({
      success: true,
      message: 'AI test successful!',
      ai_response: testText,
      response_audio: responseAudioBase64,
      response_sample_rate: 16000,
      audio_duration: audioDuration,
      lam_expressions: expressions,
      test: true
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      status: 'failed'
    });
  }
}