import { GaussianAvatar } from './gaussianAvatar';

console.log('Starting LAM WebRender with Audio Interaction...');

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = '/asset/arkit/p2-1.zip';

console.log('Found div element:', div);
console.log('Asset path:', assetPath);

let avatarInstance: GaussianAvatar | null = null;
let isListening = false;
let recognition: any = null;
let audioContext: AudioContext | null = null;

function hideLoadingIndicator() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
    console.log('Loading indicator hidden');
  }
}

function addAudioControls() {
  // Add audio interaction controls to the page
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
    ">
      <div style="margin-bottom: 10px;">🎙️ Voice Interaction</div>
      <button id="micButton" style="
        background: #4CAF50;
        border: none;
        color: white;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
      ">Start Listening</button>
      <button id="speakButton" style="
        background: #2196F3;
        border: none;
        color: white;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
      ">Test Voice</button>
      <div id="statusText" style="margin-top: 10px; font-size: 12px;">
        Click "Start Listening" to begin voice interaction
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', controlsHtml);
  
  // Add event listeners
  document.getElementById('micButton')?.addEventListener('click', toggleListening);
  document.getElementById('speakButton')?.addEventListener('click', testVoice);
}

async function initializeAudio() {
  try {
    // Initialize Web Audio API
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('Audio context initialized');
    
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        updateStatus('Listening... Speak now!');
        if (avatarInstance) {
          avatarInstance.setState('Listening');
        }
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Speech recognized:', finalTranscript);
          handleSpeechInput(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        updateStatus(`Error: ${event.error}`);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        isListening = false;
        updateMicButton();
        if (avatarInstance) {
          avatarInstance.setState('Idle');
        }
      };
      
      console.log('Speech recognition initialized');
    } else {
      throw new Error('Speech recognition not supported');
    }
    
    // Request microphone permission
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Microphone access granted');
    
  } catch (error) {
    console.error('Error initializing audio:', error);
    updateStatus('Audio not available - text interaction only');
  }
}

function toggleListening() {
  if (!recognition) {
    updateStatus('Speech recognition not available');
    return;
  }
  
  if (isListening) {
    recognition.stop();
    isListening = false;
  } else {
    recognition.start();
    isListening = true;
  }
  updateMicButton();
}

function updateMicButton() {
  const button = document.getElementById('micButton') as HTMLButtonElement;
  if (button) {
    if (isListening) {
      button.textContent = 'Stop Listening';
      button.style.background = '#f44336';
    } else {
      button.textContent = 'Start Listening';
      button.style.background = '#4CAF50';
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

function handleSpeechInput(text: string) {
  console.log('Processing speech input:', text);
  updateStatus(`You said: "${text}"`);
  
  if (avatarInstance) {
    avatarInstance.setState('Thinking');
  }
  
  // Generate response based on speech input
  setTimeout(() => {
    const response = generateResponse(text);
    speakResponse(response);
  }, 1000 + Math.random() * 2000);
}

function generateResponse(input: string): string {
  const responses = [
    "I heard you say: " + input + ". That's interesting!",
    "Thanks for talking to me! You mentioned: " + input,
    "I understand you said: " + input + ". Tell me more!",
    "Your voice is clear! You said: " + input + ". What else would you like to discuss?",
    "Great! I caught: " + input + ". I'm listening and ready to respond!"
  ];
  
  // Simple keyword responses
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return "Hello there! It's wonderful to hear your voice! How are you today?";
  }
  if (lowerInput.includes('how are you')) {
    return "I'm doing great! Thanks for asking with your voice. I love being able to hear and talk with you!";
  }
  if (lowerInput.includes('name')) {
    return "I'm your AI avatar companion! I can see you, hear you, and respond with voice and expressions!";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function speakResponse(text: string) {
  console.log('Speaking response:', text);
  updateStatus(`Avatar: "${text}"`);
  
  if (avatarInstance) {
    avatarInstance.setState('Responding');
  }
  
  // Use Text-to-Speech
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      console.log('TTS started');
    };
    
    utterance.onend = () => {
      console.log('TTS ended');
      if (avatarInstance) {
        avatarInstance.setState('Idle');
      }
      updateStatus('Ready to listen...');
    };
    
    speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported');
    setTimeout(() => {
      if (avatarInstance) {
        avatarInstance.setState('Idle');
      }
      updateStatus('Ready to listen...');
    }, 2000);
  }
}

function testVoice() {
  speakResponse("Hello! I can hear you and speak back. Try talking to me with the microphone!");
}

if (div) {
  try {
    console.log('Creating GaussianAvatar...');
    avatarInstance = new GaussianAvatar(div, assetPath);
    console.log('Starting avatar rendering...');
    avatarInstance.start();
    console.log('Avatar started successfully!');
    
    // Initialize audio capabilities
    initializeAudio();
    
    // Add audio controls after a short delay
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
