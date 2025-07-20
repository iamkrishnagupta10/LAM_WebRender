import * as THREE from 'three'
import { GaussianAvatar } from './gaussianAvatar'

// Real-time LAM Audio2Expression Implementation
// Based on the proven LAM_Audio2Expression streaming approach

let avatarInstance: GaussianAvatar | null = null
let audioContext: AudioContext | null = null
let mediaRecorder: MediaRecorder | null = null
let mediaStream: MediaStream | null = null
let isRecording = false
let sessionId = `session_${Date.now()}`

// LAM Context for streaming audio processing
let lamContext: any = null

// Simple real-time configuration
const config = {
  audioSampleRate: 16000,
  chunkDurationMs: 1000, // 1 second chunks like LAM
  fps: 30,
  apiUrl: '/api/lam'
}

function debugLog(message: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`)
  
  const debugContent = document.getElementById('debugContent')
  if (debugContent) {
    debugContent.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`
    debugContent.scrollTop = debugContent.scrollHeight
  }
}

function updateStatus(status: string) {
  const statusEl = document.getElementById('status')
  if (statusEl) {
    statusEl.textContent = status
  }
}

async function initializeRealTimeAvatar() {
  try {
    debugLog('🚀 Initializing Real-Time Avatar...')
    
    // Initialize audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Get microphone access
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        sampleRate: config.audioSampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      } 
    })
    
    debugLog('✅ Microphone access granted')
    
    // Initialize MediaRecorder for real-time processing
    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 16000
    })
    
    // Process audio chunks in real-time like LAM
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && !isRecording) {
        await processAudioChunk(event.data)
      }
    }
    
    // Start continuous recording in chunks
    startContinuousRecording()
    
    updateStatus('🎤 Listening for your voice...')
    debugLog('✅ Real-time audio processing ready')
    
  } catch (error) {
    debugLog(`❌ Failed to initialize: ${error}`)
    updateStatus('❌ Microphone access denied')
  }
}

function startContinuousRecording() {
  if (!mediaRecorder) return
  
  const recordChunk = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start()
      
      // Record for chunk duration, then process
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        
        // Continue recording next chunk
        setTimeout(recordChunk, 100) // Small gap between chunks
      }, config.chunkDurationMs)
    }
  }
  
  recordChunk()
  debugLog('🔄 Started continuous audio recording')
}

async function processAudioChunk(audioBlob: Blob) {
  if (isRecording) return // Prevent overlap
  
  try {
    isRecording = true
    debugLog(`🎵 Processing ${audioBlob.size} byte audio chunk`)
    
    updateStatus('🧠 AI processing audio...')
    
    // Convert audio blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer)
    const audioData = audioBuffer.getChannelData(0)
    
    // Check if audio has meaningful content
    const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length)
    
    if (rms < 0.005) {
      // Too quiet, skip processing
      isRecording = false
      return
    }
    
    debugLog(`🔊 Audio RMS: ${rms.toFixed(4)} - processing...`)
    
    // Convert to base64 for transmission (like LAM)
    const audioBase64 = arrayBufferToBase64(audioData.buffer)
    
    // Send to LAM-style API
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_data: audioBase64,
        sample_rate: audioBuffer.sampleRate,
        session_id: sessionId,
        context: lamContext
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.expressions) {
      debugLog(`✅ Received ${result.expressions.length} expression frames`)
      
      // Update LAM context for next chunk
      lamContext = result.context
      
      // Apply expressions to avatar
      if (avatarInstance && result.expressions.length > 0) {
        avatarInstance.applyLAMExpressions(result.expressions)
        updateStatus('🗣️ Avatar speaking...')
        
        // Play TTS audio if provided
        if (result.tts_audio) {
          await playTTSAudio(result.tts_audio)
        }
      }
    }
    
  } catch (error) {
    debugLog(`❌ Audio processing error: ${error instanceof Error ? error.message : String(error)}`)
    updateStatus('❌ Processing failed')
  } finally {
    isRecording = false
    updateStatus('👂 Listening for your voice...')
  }
}

async function playTTSAudio(audioBase64: string) {
  try {
    const audioBytes = base64ToArrayBuffer(audioBase64)
    const audioBlob = new Blob([audioBytes], { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)
    
    const audio = new Audio(audioUrl)
    audio.volume = 1.0
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      debugLog('🔊 TTS audio finished')
    }
    
    await audio.play()
    debugLog('🔊 Playing TTS audio')
    
  } catch (error) {
    debugLog(`❌ TTS audio error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Create simple UI
  document.body.innerHTML = `
    <div id="app">
      <canvas id="avatar-canvas" style="width: 100vw; height: 100vh;"></canvas>
      
      <div id="status" style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: Arial;
        z-index: 1000;
      ">
        Initializing...
      </div>
      
      <div id="debug" style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: #00ff00;
        padding: 10px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 12px;
        max-width: 400px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 999;
      ">
        <div style="color: #fff; margin-bottom: 10px;">🔍 Real-Time Debug:</div>
        <div id="debugContent"></div>
      </div>
    </div>
  `
  
  // Initialize avatar
  const canvas = document.getElementById('avatar-canvas') as HTMLCanvasElement
  if (canvas) {
    try {
      debugLog('Creating avatar...')
      avatarInstance = new GaussianAvatar(canvas)
      await avatarInstance.initialize()
      debugLog('✅ Avatar initialized')
      
      // Start real-time processing
      await initializeRealTimeAvatar()
      
    } catch (error) {
      debugLog(`❌ Avatar initialization failed: ${error}`)
      updateStatus('❌ Avatar failed to load')
    }
  }
})
