import { GaussianAvatar } from './gaussianAvatar';

console.log('Starting LAM WebRender with Auto AI Conversation...');

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = '/asset/arkit/p2-1.zip';

console.log('Found div element:', div);
console.log('Asset path:', assetPath);

let avatarInstance: GaussianAvatar | null = null;
let isListening = false;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioContext: AudioContext | null = null;
let sessionId: string = 'session_' + Date.now();
let conversationActive = false;

// Production AI server URL (will be deployed to Vercel/GCP)
const AI_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? '/api/ai'  // Vercel serverless function
  : 'http://localhost:5002';

function hideLoadingIndicator() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
    console.log('Loading indicator hidden');
  }
}

function addMinimalUI() {
  // Minimal UI showing avatar status only
  const uiHtml = `
    <div id="avatarStatus" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 15px;
      border-radius: 20px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 1000;
      backdrop-filter: blur(10px);
    ">
      <div id="statusText">🤖 Initializing AI Avatar...</div>
      <div id="aiPipelineStatus" style="font-size: 10px; margin-top: 3px; opacity: 0.8;">
        Connecting to AI services...
      </div>
    </div>
    
    <div id="conversationHint" style="
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 15px 25px;
      border-radius: 25px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 1000;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      display: none;
    ">
      <div style="font-weight: bold; margin-bottom: 5px;">👋 Hi! I'm your AI Avatar</div>
      <div style="font-size: 12px;">Just start talking to me - I'm listening!</div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', uiHtml);
}

async function checkAIServerStatus() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/health`);
    const data = await response.json();
    
    const statusElement = document.getElementById('aiPipelineStatus');
    if (statusElement && data.components) {
      const components = data.components;
      const readyComponents = [];
      
      if (components.whisper_asr) readyComponents.push('🎤 ASR');
      if (components.openai_llm) readyComponents.push('🧠 LLM');
      if (components.openai_tts) readyComponents.push('🔊 TTS');
      if (components.lam_avatar) readyComponents.push('🎭 LAM');
      
      if (readyComponents.length === 4) {
        statusElement.textContent = '✅ Full AI Pipeline Ready';
        statusElement.style.color = '#4CAF50';
        return true;
      } else {
        statusElement.textContent = `⚠️ ${readyComponents.join(' ')} (${readyComponents.length}/4)`;
        statusElement.style.color = '#ff9800';
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('AI server check failed:', error);
    const statusElement = document.getElementById('aiPipelineStatus');
    if (statusElement) {
      statusElement.textContent = '❌ AI Service Offline';
      statusElement.style.color = '#f44336';
    }
    return false;
  }
}

async function initializeAutoConversation() {
  try {
    // Initialize Web Audio API
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('Audio context initialized');
    
    // Request microphone permission immediately
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    // Create MediaRecorder for continuous audio monitoring
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      if (audioChunks.length > 0) {
        processRecordedAudio();
      }
    };
    
    updateStatus('🎤 Microphone Ready - Listening...');
    
    // Start continuous listening
    startContinuousListening();
    
    console.log('Auto conversation system ready!');
    
  } catch (error) {
    console.error('Error initializing auto conversation:', error);
    updateStatus('❌ Microphone access denied');
    
    // Fallback: show click-to-enable message
    showMicrophonePrompt();
  }
}

function startContinuousListening() {
  if (!mediaRecorder) return;
  
  updateStatus('👂 Listening for your voice...');
  showConversationHint();
  
  // Start recording in chunks for voice activity detection
  const recordChunk = () => {
    if (!conversationActive && mediaRecorder && mediaRecorder.state === 'inactive') {
      audioChunks = [];
      mediaRecorder.start();
      
      // Record for 3 seconds, then process
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
        
        // Continue listening after a short delay
        setTimeout(recordChunk, 500);
      }, 3000);
    }
  };
  
  recordChunk();
}

function showConversationHint() {
  const hint = document.getElementById('conversationHint');
  if (hint) {
    hint.style.display = 'block';
    
    // Hide hint after 10 seconds
    setTimeout(() => {
      hint.style.display = 'none';
    }, 10000);
  }
}

function showMicrophonePrompt() {
  const hint = document.getElementById('conversationHint');
  if (hint) {
    hint.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">🎤 Microphone Access Needed</div>
      <div style="font-size: 12px;">Click anywhere to enable voice conversation</div>
    `;
    hint.style.display = 'block';
    
    // Add click listener to try again
    document.addEventListener('click', async () => {
      hint.style.display = 'none';
      await initializeAutoConversation();
    }, { once: true });
  }
}

async function processRecordedAudio() {
  if (audioChunks.length === 0 || conversationActive) {
    return;
  }
  
  try {
    // Create blob from recorded chunks
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
    
    // Quick check if audio has meaningful content
    if (audioBlob.size < 10000) { // Less than 10KB probably silence
      return;
    }
    
    conversationActive = true;
    updateStatus('🎯 Processing your voice...');
    
    if (avatarInstance) {
      avatarInstance.setState('Listening');
    }
    
    // Convert to audio array
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer);
    
    // Check for actual speech content
    const audioArray = audioBuffer.getChannelData(0);
    const rms = Math.sqrt(audioArray.reduce((sum, val) => sum + val * val, 0) / audioArray.length);
    
    if (rms < 0.01) { // Too quiet, probably no speech
      conversationActive = false;
      updateStatus('👂 Listening for your voice...');
      return;
    }
    
    // Encode to base64
    const audioBase64 = base64EncodeArray(audioArray);
    
    updateStatus('🧠 AI is thinking...');
    if (avatarInstance) {
      avatarInstance.setState('Thinking');
    }
    
    // Send to AI conversation pipeline
    const response = await fetch(`${AI_SERVER_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_data: audioBase64,
        sample_rate: audioBuffer.sampleRate,
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.user_text && data.user_text.trim().length > 3) {
      // Valid speech detected and transcribed
      updateStatus(`💬 "${data.user_text}"`);
      await handleAIResponse(data);
    } else {
      // No meaningful speech detected
      conversationActive = false;
      updateStatus('👂 Listening for your voice...');
    }
    
  } catch (error) {
    console.error('Audio processing error:', error);
    conversationActive = false;
    updateStatus('👂 Ready to listen...');
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
  }
}

async function handleAIResponse(data: any) {
  console.log('AI Response:', data.ai_response);
  
  updateStatus(`🤖 "${data.ai_response}"`);
  
  if (avatarInstance) {
    avatarInstance.setState('Responding');
  }
  
  // Apply LAM expressions
  if (data.lam_expressions && data.lam_expressions.length > 0) {
    console.log('Applying LAM expressions:', data.lam_expressions.length, 'frames');
    if (avatarInstance) {
      avatarInstance.applyLAMExpressions(data.lam_expressions, data.audio_duration);
    }
  }
  
  // Play AI audio response
  if (data.response_audio) {
    await playAIAudio(data.response_audio, data.response_sample_rate);
  }
  
  // Resume listening after response
  setTimeout(() => {
    conversationActive = false;
    updateStatus('👂 Listening for your voice...');
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
  }, 1000);
}

function playAIAudio(audioBase64: string, sampleRate: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      // Decode base64 audio
      const audioBytes = base64DecodeToArray(audioBase64);
      
      // Create audio buffer
      const audioBuffer = audioContext!.createBuffer(1, audioBytes.length, sampleRate);
      audioBuffer.copyToChannel(audioBytes, 0);
      
      // Create audio source
      const source = audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext!.destination);
      
      source.onended = () => {
        console.log('AI audio playback finished');
        resolve();
      };
      
      // Play audio
      source.start();
      console.log('Playing AI response audio');
      
    } catch (error) {
      console.error('Error playing AI audio:', error);
      resolve();
    }
  });
}

function updateStatus(message: string) {
  const statusElement = document.getElementById('statusText');
  if (statusElement) {
    statusElement.textContent = message;
  }
  console.log('Status:', message);
}

// Utility functions for base64 encoding/decoding of float32 arrays
function base64EncodeArray(array: Float32Array): string {
  const bytes = new Uint8Array(array.buffer);
  return btoa(String.fromCharCode(...bytes));
}

function base64DecodeToArray(base64: string): Float32Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

if (div) {
  try {
    console.log('Creating GaussianAvatar...');
    avatarInstance = new GaussianAvatar(div, assetPath);
    console.log('Starting avatar rendering...');
    avatarInstance.start();
    console.log('Avatar started successfully!');
    
    // Add minimal UI
    addMinimalUI();
    
    // Wait for avatar to load, then start conversation system
    setTimeout(async () => {
      hideLoadingIndicator();
      
      // Check AI services
      const aiReady = await checkAIServerStatus();
      
      if (aiReady) {
        await initializeAutoConversation();
      } else {
        updateStatus('⚠️ AI services starting up...');
        // Retry in 5 seconds
        setTimeout(async () => {
          const retryReady = await checkAIServerStatus();
          if (retryReady) {
            await initializeAutoConversation();
          }
        }, 5000);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error creating or starting avatar:', error);
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      indicator.innerHTML = `
        <div style="color: red;">Error Loading Avatar</div>
        <div style="font-size: 12px;">${errorMessage}</div>
        <div style="font-size: 10px; margin-top: 10px;">Check browser console for details</div>
      `;
    }
  }
} else {
  console.error('Could not find LAM_WebRender div element!');
}
