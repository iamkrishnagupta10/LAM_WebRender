import { GaussianAvatar } from './gaussianAvatar';

console.log('Starting LAM WebRender with REAL AI Conversation...');

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

// Real AI server URL
const AI_SERVER_URL = 'http://localhost:5002';

function hideLoadingIndicator() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
    console.log('Loading indicator hidden');
  }
}

function addAudioControls() {
  // Add real AI conversation controls
  const controlsHtml = `
    <div id="audioControls" style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 15px;
      border-radius: 10px;
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
      z-index: 1000;
      max-width: 500px;
    ">
      <div style="margin-bottom: 10px;">🧠 REAL AI CONVERSATION</div>
      <div style="font-size: 10px; margin-bottom: 8px;">VAD → Whisper ASR → GPT → OpenAI TTS → LAM_Audio2Expression</div>
      
      <button id="micButton" style="
        background: #4CAF50;
        border: none;
        color: white;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      ">🎤 Talk to AI</button>
      
      <button id="textButton" style="
        background: #2196F3;
        border: none;
        color: white;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
      ">💬 Text Chat</button>
      
      <button id="resetButton" style="
        background: #ff9800;
        border: none;
        color: white;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
      ">🔄 Reset</button>
      
      <div>
        <input id="textInput" type="text" placeholder="Type your message..." style="
          width: 300px;
          padding: 8px;
          margin: 5px;
          border: none;
          border-radius: 5px;
          display: none;
        ">
      </div>
      
      <div id="statusText" style="margin-top: 10px; font-size: 12px;">
        Click "Talk to AI" for real voice conversation!
      </div>
      
      <div id="aiStatus" style="margin-top: 5px; font-size: 10px; color: #ccc;">
        Checking AI server...
      </div>
      
      <div id="conversationLog" style="
        margin-top: 10px;
        max-height: 100px;
        overflow-y: auto;
        text-align: left;
        font-size: 11px;
        background: rgba(255,255,255,0.1);
        padding: 5px;
        border-radius: 3px;
        display: none;
      "></div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', controlsHtml);
  
  // Add event listeners
  document.getElementById('micButton')?.addEventListener('click', toggleRecording);
  document.getElementById('textButton')?.addEventListener('click', toggleTextInput);
  document.getElementById('resetButton')?.addEventListener('click', resetConversation);
  
  // Text input handler
  const textInput = document.getElementById('textInput') as HTMLInputElement;
  textInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendTextMessage();
    }
  });
  
  // Check AI server status
  checkAIServerStatus();
}

async function checkAIServerStatus() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/`);
    const data = await response.json();
    
    const aiStatus = document.getElementById('aiStatus');
    if (aiStatus) {
      const components = data.components;
      const allReady = components.whisper_asr && components.openai_llm && components.lam_avatar;
      
      if (allReady) {
        aiStatus.innerHTML = '✅ Full AI Pipeline Ready<br>🎤ASR 🧠LLM 🔊TTS 🎭LAM';
        aiStatus.style.color = '#4CAF50';
      } else {
        const status = [];
        if (components.whisper_asr) status.push('🎤ASR');
        if (components.openai_llm) status.push('🧠LLM+TTS');
        if (components.lam_avatar) status.push('🎭LAM');
        
        aiStatus.innerHTML = `⚠️ Partial Ready: ${status.join(' ')}`;
        aiStatus.style.color = '#ff9800';
      }
    }
  } catch (error) {
    console.error('AI server not available:', error);
    const aiStatus = document.getElementById('aiStatus');
    if (aiStatus) {
      aiStatus.textContent = '❌ AI Server Offline';
      aiStatus.style.color = '#f44336';
    }
  }
}

async function initializeAudio() {
  try {
    // Initialize Web Audio API
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('Audio context initialized');
    
    // Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    
    // Create MediaRecorder for real audio recording
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      processRecordedAudio();
    };
    
    console.log('Real audio recording ready!');
    
  } catch (error) {
    console.error('Error initializing audio:', error);
    updateStatus('Microphone not available - text only');
  }
}

function toggleRecording() {
  if (!mediaRecorder) {
    updateStatus('Audio recording not available');
    return;
  }
  
  if (isListening) {
    // Stop recording
    mediaRecorder.stop();
    isListening = false;
    updateMicButton();
    updateStatus('Processing your speech...');
    
    if (avatarInstance) {
      avatarInstance.setState('Thinking');
    }
  } else {
    // Start recording
    audioChunks = [];
    mediaRecorder.start();
    isListening = true;
    updateMicButton();
    updateStatus('🎤 Listening... speak now!');
    
    if (avatarInstance) {
      avatarInstance.setState('Listening');
    }
  }
}

function updateMicButton() {
  const button = document.getElementById('micButton') as HTMLButtonElement;
  if (button) {
    if (isListening) {
      button.textContent = '⏹️ Stop Recording';
      button.style.background = '#f44336';
    } else {
      button.textContent = '🎤 Talk to AI';
      button.style.background = '#4CAF50';
    }
  }
}

function toggleTextInput() {
  const textInput = document.getElementById('textInput') as HTMLInputElement;
  const button = document.getElementById('textButton') as HTMLButtonElement;
  
  if (textInput.style.display === 'none') {
    textInput.style.display = 'inline-block';
    textInput.focus();
    button.textContent = '🗣️ Voice Mode';
  } else {
    textInput.style.display = 'none';
    button.textContent = '💬 Text Chat';
  }
}

async function sendTextMessage() {
  const textInput = document.getElementById('textInput') as HTMLInputElement;
  const text = textInput.value.trim();
  
  if (!text) return;
  
  textInput.value = '';
  updateStatus(`You: "${text}"`);
  logConversation('You', text);
  
  if (avatarInstance) {
    avatarInstance.setState('Thinking');
  }
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/api/text_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      handleAIResponse(data);
    } else {
      throw new Error(data.message || 'AI conversation failed');
    }
    
  } catch (error) {
    console.error('Text conversation error:', error);
    updateStatus('AI conversation failed');
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
  }
}

async function processRecordedAudio() {
  if (audioChunks.length === 0) {
    updateStatus('No audio recorded');
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
    return;
  }
  
  try {
    // Create blob from recorded chunks
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
    
    // Convert to audio array
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer);
    
    // Convert to float32 array
    const audioArray = audioBuffer.getChannelData(0);
    
    // Encode to base64
    const audioBase64 = base64EncodeArray(audioArray);
    
    updateStatus('Sending audio to AI...');
    
    // Send to real AI conversation pipeline
    const response = await fetch(`${AI_SERVER_URL}/api/real_conversation`, {
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
    
    if (data.success) {
      // Log what user said
      logConversation('You', data.user_text);
      updateStatus(`You said: "${data.user_text}"`);
      
      // Handle AI response
      handleAIResponse(data);
    } else {
      throw new Error(data.message || 'AI conversation failed');
    }
    
  } catch (error) {
    console.error('Real conversation error:', error);
    updateStatus('AI conversation failed');
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
  }
}

function handleAIResponse(data: any) {
  console.log('AI Response Data:', data);
  
  // Log AI response
  logConversation('AI', data.ai_response);
  updateStatus(`AI: "${data.ai_response}"`);
  
  if (avatarInstance) {
    avatarInstance.setState('Responding');
  }
  
  // Apply LAM expressions if available
  if (data.lam_expressions && data.lam_expressions.length > 0) {
    console.log('Applying LAM expressions:', data.lam_expressions.length, 'frames');
    if (avatarInstance) {
      avatarInstance.applyLAMExpressions(data.lam_expressions, data.audio_duration);
    }
  }
  
  // Play the AI's voice
  if (data.response_audio) {
    playAIAudio(data.response_audio, data.response_sample_rate);
  } else {
    // Fallback to default animation
    setTimeout(() => {
      if (avatarInstance) {
        avatarInstance.setState('Idle');
      }
      updateStatus('Ready for next conversation...');
    }, 2000);
  }
}

function playAIAudio(audioBase64: string, sampleRate: number) {
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
      if (avatarInstance) {
        avatarInstance.setState('Idle');
      }
      updateStatus('Ready for next conversation...');
    };
    
    // Play audio
    source.start();
    console.log('Playing AI audio response');
    
  } catch (error) {
    console.error('Error playing AI audio:', error);
    if (avatarInstance) {
      avatarInstance.setState('Idle');
    }
    updateStatus('Ready for next conversation...');
  }
}

function logConversation(speaker: string, message: string) {
  const log = document.getElementById('conversationLog');
  if (log) {
    log.style.display = 'block';
    const entry = document.createElement('div');
    entry.style.marginBottom = '3px';
    entry.innerHTML = `<strong>${speaker}:</strong> ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Keep only last 10 entries
    while (log.children.length > 10) {
      log.removeChild(log.firstChild!);
    }
  }
}

function updateStatus(message: string) {
  const statusElement = document.getElementById('statusText');
  if (statusElement) {
    statusElement.textContent = message;
  }
  console.log('Status:', message);
}

async function resetConversation() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/api/reset_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    });
    
    const data = await response.json();
    updateStatus('Conversation reset');
    
    // Clear conversation log
    const log = document.getElementById('conversationLog');
    if (log) {
      log.innerHTML = '';
      log.style.display = 'none';
    }
    
    console.log('Conversation reset:', data);
    
  } catch (error) {
    console.error('Error resetting conversation:', error);
    updateStatus('Failed to reset conversation');
  }
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
    
    // Initialize real audio capabilities
    initializeAudio();
    
    // Add controls after a short delay
    setTimeout(() => {
      hideLoadingIndicator();
      addAudioControls();
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
