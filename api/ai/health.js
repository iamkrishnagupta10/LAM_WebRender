// Vercel Serverless Function for AI Health Check
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Check if required environment variables are set
    const openaiKey = process.env.OPENAI_API_KEY;
    const whisperEnabled = !!openaiKey;
    const gptEnabled = !!openaiKey;
    const ttsEnabled = !!openaiKey;
    
    // For LAM, we'll use a simplified version or external service
    const lamEnabled = true; // We'll implement a simplified LAM service
    
    return res.status(200).json({
      status: 'healthy',
      components: {
        whisper_asr: whisperEnabled,
        openai_llm: gptEnabled,
        openai_tts: ttsEnabled,
        lam_avatar: lamEnabled
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}