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
      <button id="simpleTestButton" style="
        background: #2196F3;
        border: none;
        color: white;
        padding: 5px 10px;
        margin-top: 5px;
        margin-right: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 10px;
      ">🔗 Test API</button>
      <button id="debugTestButton" style="
        background: #ff9800;
        border: none;
        color: white;
        padding: 5px 10px;
        margin-top: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 10px;
        display: none;
      ">🧪 Test AI</button>
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
    
    <div id="debugLog" style="
      position: fixed;
      top: 120px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 10px;
      max-width: 300px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 999;
      display: none;
    ">
      <div>🔍 Debug Log:</div>
      <div id="debugContent"></div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', uiHtml);
  
  // Add test button handlers
  document.getElementById('simpleTestButton')?.addEventListener('click', testSimpleAPI);
  document.getElementById('debugTestButton')?.addEventListener('click', testAIDirectly);
}

function debugLog(message: string) {
  console.log(message);
  const debugContent = document.getElementById('debugContent');
  if (debugContent) {
    const debugDiv = document.getElementById('debugLog');
    if (debugDiv) {
      debugDiv.style.display = 'block';
    }
    
    const timestamp = new Date().toLocaleTimeString();
    debugContent.innerHTML += `<div>${timestamp}: ${message}</div>`;
    debugContent.scrollTop = debugContent.scrollHeight;
    
    // Keep only last 20 entries
    while (debugContent.children.length > 20) {
      debugContent.removeChild(debugContent.firstChild!);
    }
  }
}

async function testSimpleAPI() {
  debugLog('🔗 Testing basic API connection...');
  updateStatus('🔗 Testing API...');
  
  try {
    const testUrl = `${AI_SERVER_URL}/simple-test`;
    debugLog(`📡 Calling: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET'
    });
    
    debugLog(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API test failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    debugLog(`✅ API Response: ${JSON.stringify(data, null, 2)}`);
    
    updateStatus(`✅ API Working! OpenAI Key: ${data.environment.hasOpenAIKey ? 'YES' : 'NO'}`);
    
    if (data.environment.hasOpenAIKey) {
      // Show the AI test button if API key is available
      const aiTestBtn = document.getElementById('debugTestButton');
      if (aiTestBtn) {
        aiTestBtn.style.display = 'inline-block';
      }
    }
    
  } catch (error) {
    debugLog(`❌ API test failed: ${error}`);
    updateStatus('❌ API test failed');
    console.error('Simple API test error:', error);
    
    // Try to show what went wrong
    if (error instanceof TypeError && error.message.includes('fetch')) {
      debugLog('❌ Network error - check if site is deployed properly');
    }
  }
}

async function testAIDirectly() {
  debugLog('🧪 Testing AI directly...');
  updateStatus('🧪 Testing AI...');
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Hello! This is a direct test of the AI system. Can you hear me?"
      })
    });
    
    debugLog(`📡 Test response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      debugLog(`❌ Error response: ${errorText}`);
      throw new Error(`Test failed: ${response.status}`);
    }
    
    const data = await response.json();
    debugLog('✅ Test response received');
    
    if (data.success) {
      updateStatus('🔊 AI test successful - playing audio');
      debugLog('🎵 About to play test audio...');
      
      // Apply expressions first
      if (data.lam_expressions && data.lam_expressions.length > 0) {
        debugLog(`🎭 Applying ${data.lam_expressions.length} expression frames`);
        if (avatarInstance) {
          avatarInstance.setState('Responding');
          avatarInstance.applyLAMExpressions(data.lam_expressions, data.audio_duration);
        }
      }
      
      // Try to play audio
      if (data.response_audio) {
        try {
          await playAIAudio(data.response_audio, data.response_sample_rate);
          debugLog('🎵 Test audio played successfully');
        } catch (audioError) {
          debugLog(`❌ Audio playback failed: ${audioError}`);
          // Still consider test successful if we got the response
        }
      }
      
      if (avatarInstance) {
        avatarInstance.setState('Idle');
      }
      updateStatus('✅ AI test completed');
      
    } else {
      throw new Error(data.error || 'Test failed');
    }
    
  } catch (error) {
    debugLog(`❌ Test failed: ${error}`);
    updateStatus('❌ AI test failed');
    console.error('AI test error:', error);
  }
}

async function checkAIServerStatus() {
  try {
    debugLog('🔍 Checking AI server...');
    const response = await fetch(`${AI_SERVER_URL}/health`);
    const data = await response.json();
    
    debugLog(`📊 Health check: ${JSON.stringify(data.components)}`);
    
    const statusElement = document.getElementById('aiPipelineStatus');
    const testButton = document.getElementById('debugTestButton');
    
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
        if (testButton) {
          testButton.style.display = 'inline-block';
        }
        debugLog('✅ All AI components ready');
        return true;
      } else {
        statusElement.textContent = `⚠️ ${readyComponents.join(' ')} (${readyComponents.length}/4)`;
        statusElement.style.color = '#ff9800';
        if (testButton) {
          testButton.style.display = 'inline-block';
        }
        debugLog(`⚠️ Partial AI ready: ${readyComponents.join(', ')}`);
        return false;
      }
    }
    return false;
  } catch (error) {
    debugLog(`❌ Health check failed: ${error}`);
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
    debugLog('🎤 Initializing microphone...');
    
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
    
    debugLog('✅ Microphone access granted');
    
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
    
    debugLog('🔄 Auto conversation system ready');
    console.log('Auto conversation system ready!');
    
  } catch (error) {
    debugLog(`❌ Microphone init failed: ${error}`);
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
  
  debugLog('🔄 Starting continuous listening');
  
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
    
    debugLog(`🎵 Audio blob: ${audioBlob.size} bytes`);
    
    // Quick check if audio has meaningful content
    if (audioBlob.size < 10000) { // Less than 10KB probably silence
      debugLog('🔇 Audio too small, skipping');
      return;
    }
    
    conversationActive = true;
    updateStatus('🎯 Processing your voice...');
    debugLog('🎯 Starting audio processing');
    
    if (avatarInstance) {
      avatarInstance.setState('Listening');
    }
    
    // Convert to audio array
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer);
    
    // Check for actual speech content
    const audioArray = audioBuffer.getChannelData(0);
    const rms = Math.sqrt(audioArray.reduce((sum, val) => sum + val * val, 0) / audioArray.length);
    
    debugLog(`🔊 Audio RMS: ${rms.toFixed(4)}`);
    
    if (rms < 0.01) { // Too quiet, probably no speech
      conversationActive = false;
      updateStatus('👂 Listening for your voice...');
      debugLog('🔇 Audio too quiet, skipping');
      return;
    }
    
    // Encode to base64
    const audioBase64 = base64EncodeArray(audioArray);
    
    updateStatus('🧠 AI is thinking...');
    debugLog('📡 Sending to AI server...');
    
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
    
    debugLog(`📡 AI response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`AI server error: ${response.status}`);
    }
    
    const data = await response.json();
    debugLog(`📨 AI response: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (data.success && data.user_text && data.user_text.trim().length > 2) {
      // Valid speech detected and transcribed
      debugLog(`🗣️ Transcribed: "${data.user_text}"`);
      updateStatus(`💬 "${data.user_text}"`);
      await handleAIResponse(data);
    } else {
      // No meaningful speech detected
      conversationActive = false;
      updateStatus('👂 Listening for your voice...');
      debugLog('🔇 No meaningful speech detected');
    }
    
  } catch (error) {
    debugLog(`❌ Audio processing error: ${error}`);
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
  debugLog(`🤖 AI said: "${data.ai_response}"`);
  
  updateStatus(`🤖 "${data.ai_response}"`);
  
  if (avatarInstance) {
    avatarInstance.setState('Responding');
  }
  
  // Apply LAM expressions
  if (data.lam_expressions && data.lam_expressions.length > 0) {
    debugLog(`🎭 Applying ${data.lam_expressions.length} expression frames`);
    console.log('Applying LAM expressions:', data.lam_expressions.length, 'frames');
    if (avatarInstance) {
      avatarInstance.applyLAMExpressions(data.lam_expressions, data.audio_duration);
    }
  }
  
  // Play AI audio response
  if (data.response_audio) {
    debugLog('🔊 Playing AI audio response');
    await playAIAudio(data.response_audio, data.response_sample_rate);
  }
  
  // Resume listening after response
  setTimeout(() => {
    conversationActive = false;
    updateStatus('👂 Listening for your voice...');
    debugLog('👂 Resuming listening');
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
        debugLog('🔊 Audio playback finished');
        console.log('AI audio playback finished');
        resolve();
      };
      
      // Play audio
      source.start();
      console.log('Playing AI response audio');
      
    } catch (error) {
      debugLog(`❌ Audio playback error: ${error}`);
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
  // Fix for stack overflow - process in chunks instead of all at once
  const chunkSize = 8192; // Process 8KB chunks
  let result = '';
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    const chunkResult = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
    result += chunkResult;
  }
  
  return result;
}

function base64DecodeToArray(base64: string): Float32Array {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  } catch (error) {
    console.error('Error decoding base64 audio:', error);
    return new Float32Array(0);
  }
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
      
      // First test basic API connectivity
      debugLog('🚀 App loaded, testing basic connectivity...');
      await testSimpleAPI();
      
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
