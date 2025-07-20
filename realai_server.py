#!/usr/bin/env python3
"""
Real AI Conversation Server for LAM Avatar
Implements the full pipeline: VAD → ASR → LLM → TTS → LAM_Audio2Expression
Based on OpenAvatarChat architecture
"""

import os
import sys
import json
import time
import base64
import asyncio
import tempfile
import threading
from io import BytesIO
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import librosa
import websockets
import torch
import soundfile as sf

# Audio processing imports
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    import requests
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Add LAM_Audio2Expression to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'LAM_Audio2Expression'))

try:
    from LAM_Audio2Expression.engines.defaults import default_config_parser, default_setup
    from LAM_Audio2Expression.engines.infer import INFER
    LAM_AVAILABLE = True
except ImportError as e:
    print(f"LAM_Audio2Expression not available: {e}")
    LAM_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Global components
whisper_model = None
openai_client = None
lam_infer_engine = None
conversation_history = {}

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
VAD_THRESHOLD = 0.02
MIN_SPEECH_DURATION = 1.0
MAX_SPEECH_DURATION = 10.0

def initialize_whisper():
    """Initialize Whisper ASR model"""
    global whisper_model
    
    if not WHISPER_AVAILABLE:
        return False
        
    try:
        print("Loading Whisper model...")
        whisper_model = whisper.load_model("base")
        print("✅ Whisper ASR loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to load Whisper: {e}")
        return False

def initialize_openai():
    """Initialize OpenAI client"""
    global openai_client
    
    if not OPENAI_AVAILABLE or not OPENAI_API_KEY:
        return False
        
    try:
        openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
        # Test the connection
        response = openai_client.models.list()
        print("✅ OpenAI client initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI: {e}")
        return False

def initialize_lam_engine():
    """Initialize the LAM_Audio2Expression inference engine"""
    global lam_infer_engine
    
    if not LAM_AVAILABLE:
        return False
        
    try:
        config_file = os.path.join(os.path.dirname(__file__), 'LAM_Audio2Expression', 'configs', 'lam_audio2exp_config_streaming.py')
        
        if not os.path.exists(config_file):
            print(f"❌ LAM config file not found: {config_file}")
            return False
        
        # Basic configuration
        options = {
            'weight': './LAM_Audio2Expression/pretrained_models/lam_audio2exp_streaming.tar',
            'save_path': './tmp_expressions'
        }
        
        cfg = default_config_parser(config_file, options)
        cfg = default_setup(cfg)
        
        lam_infer_engine = INFER.build(dict(type=cfg.infer.type, cfg=cfg))
        lam_infer_engine.model.eval()
        
        print("✅ LAM_Audio2Expression engine initialized successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize LAM engine: {e}")
        return False

def detect_speech_activity(audio_array, sample_rate=16000):
    """Simple VAD using energy-based detection"""
    # Calculate RMS energy
    frame_length = int(0.025 * sample_rate)  # 25ms frames
    hop_length = int(0.010 * sample_rate)    # 10ms hop
    
    frames = []
    for i in range(0, len(audio_array) - frame_length, hop_length):
        frame = audio_array[i:i + frame_length]
        rms = np.sqrt(np.mean(frame ** 2))
        frames.append(rms)
    
    frames = np.array(frames)
    
    # Speech activity if energy is above threshold
    speech_frames = frames > VAD_THRESHOLD
    
    # Find speech segments
    speech_segments = []
    start = None
    
    for i, is_speech in enumerate(speech_frames):
        if is_speech and start is None:
            start = i
        elif not is_speech and start is not None:
            duration = (i - start) * hop_length / sample_rate
            if duration >= MIN_SPEECH_DURATION:
                speech_segments.append((start * hop_length, i * hop_length))
            start = None
    
    # Handle case where speech continues to end
    if start is not None:
        duration = (len(speech_frames) - start) * hop_length / sample_rate
        if duration >= MIN_SPEECH_DURATION:
            speech_segments.append((start * hop_length, len(audio_array)))
    
    return speech_segments

def transcribe_speech(audio_array, sample_rate=16000):
    """Transcribe speech using Whisper"""
    global whisper_model
    
    if not whisper_model:
        return ""
    
    try:
        # Ensure audio is the right sample rate
        if sample_rate != 16000:
            audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
        
        # Whisper expects audio normalized to [-1, 1]
        audio_array = audio_array.astype(np.float32)
        if np.max(np.abs(audio_array)) > 1.0:
            audio_array = audio_array / np.max(np.abs(audio_array))
        
        # Transcribe
        result = whisper_model.transcribe(audio_array, language="en")
        text = result["text"].strip()
        
        print(f"🎤 ASR Result: '{text}'")
        return text
        
    except Exception as e:
        print(f"❌ ASR Error: {e}")
        return ""

def generate_ai_response(user_text, session_id="default"):
    """Generate AI response using OpenAI"""
    global openai_client, conversation_history
    
    if not openai_client:
        return "I'm sorry, but my AI language model is not available right now."
    
    try:
        # Get or create conversation history
        if session_id not in conversation_history:
            conversation_history[session_id] = [
                {"role": "system", "content": "You are a helpful AI assistant having a natural conversation. Keep responses conversational, friendly, and concise (1-3 sentences). You are embodied as a 3D avatar, so speak naturally as if you're really there talking to the person."}
            ]
        
        # Add user message
        conversation_history[session_id].append({"role": "user", "content": user_text})
        
        # Keep conversation history manageable
        if len(conversation_history[session_id]) > 20:
            # Keep system message and last 18 messages
            conversation_history[session_id] = [conversation_history[session_id][0]] + conversation_history[session_id][-18:]
        
        # Generate response
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=conversation_history[session_id],
            max_tokens=150,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Add AI response to history
        conversation_history[session_id].append({"role": "assistant", "content": ai_response})
        
        print(f"🤖 AI Response: '{ai_response}'")
        return ai_response
        
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "I'm having trouble thinking right now. Could you try asking again?"

def generate_speech_audio(text):
    """Generate speech audio using OpenAI TTS"""
    global openai_client
    
    if not openai_client:
        return None
    
    try:
        response = openai_client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
            response_format="wav"
        )
        
        # Get audio data
        audio_data = response.content
        
        # Load audio data and convert to numpy array
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file.flush()
            
            audio_array, sample_rate = librosa.load(temp_file.name, sr=16000)
            os.unlink(temp_file.name)
        
        print(f"🔊 Generated TTS audio: {len(audio_array)} samples at {sample_rate}Hz")
        return audio_array, sample_rate
        
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return None

def generate_lam_expressions(audio_array, sample_rate=16000, session_id="default"):
    """Generate LAM expressions from audio"""
    global lam_infer_engine
    
    if not lam_infer_engine:
        return []
    
    try:
        # Resample if needed
        if sample_rate != 16000:
            audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
        
        # Process in chunks for streaming
        chunk_size = 16000  # 1 second chunks
        all_expressions = []
        context = None
        
        for i in range(0, len(audio_array), chunk_size):
            chunk = audio_array[i:i+chunk_size]
            if len(chunk) < chunk_size:
                # Pad the last chunk
                chunk = np.pad(chunk, (0, chunk_size - len(chunk)), 'constant')
            
            output, context = lam_infer_engine.infer_streaming_audio(
                audio=chunk,
                ssr=16000,
                context=context
            )
            
            expressions = output.get('expression', np.array([]))
            if isinstance(expressions, np.ndarray) and expressions.size > 0:
                all_expressions.append(expressions.tolist())
        
        print(f"🎭 Generated LAM expressions: {len(all_expressions)} frames")
        return all_expressions
        
    except Exception as e:
        print(f"❌ LAM Expression Error: {e}")
        return []

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'components': {
            'whisper_asr': whisper_model is not None,
            'openai_llm': openai_client is not None,
            'lam_avatar': lam_infer_engine is not None
        }
    })

@app.route('/api/real_conversation', methods=['POST'])
def real_conversation():
    """Process the complete AI conversation pipeline"""
    try:
        data = request.get_json()
        
        if 'audio_data' not in data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        session_id = data.get('session_id', 'default')
        audio_base64 = data['audio_data']
        sample_rate = data.get('sample_rate', 16000)
        
        print(f"🎯 Starting real AI conversation for session: {session_id}")
        
        # Decode audio
        audio_bytes = base64.b64decode(audio_base64)
        audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
        
        # Step 1: VAD - Detect speech activity
        speech_segments = detect_speech_activity(audio_array, sample_rate)
        if not speech_segments:
            return jsonify({
                'success': False, 
                'message': 'No speech detected'
            })
        
        # Use the longest speech segment
        start, end = max(speech_segments, key=lambda x: x[1] - x[0])
        speech_audio = audio_array[start:end]
        
        # Step 2: ASR - Transcribe speech
        user_text = transcribe_speech(speech_audio, sample_rate)
        if not user_text:
            return jsonify({
                'success': False,
                'message': 'Could not transcribe speech'
            })
        
        # Step 3: LLM - Generate AI response
        ai_response = generate_ai_response(user_text, session_id)
        
        # Step 4: TTS - Generate speech audio
        tts_result = generate_speech_audio(ai_response)
        if not tts_result:
            return jsonify({
                'success': False,
                'message': 'Could not generate speech'
            })
        
        response_audio, response_sample_rate = tts_result
        
        # Step 5: LAM - Generate facial expressions
        lam_expressions = generate_lam_expressions(response_audio, response_sample_rate, session_id)
        
        # Encode response audio for client
        response_audio_base64 = base64.b64encode(response_audio.astype(np.float32).tobytes()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'user_text': user_text,
            'ai_response': ai_response,
            'response_audio': response_audio_base64,
            'response_sample_rate': response_sample_rate,
            'audio_duration': len(response_audio) / response_sample_rate,
            'lam_expressions': lam_expressions,
            'processing_info': {
                'speech_segments': len(speech_segments),
                'speech_duration': len(speech_audio) / sample_rate,
                'response_duration': len(response_audio) / response_sample_rate,
                'expression_frames': len(lam_expressions)
            }
        })
        
    except Exception as e:
        print(f"❌ Real conversation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/text_conversation', methods=['POST'])
def text_conversation():
    """Text-only conversation for testing"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        session_id = data.get('session_id', 'default')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        print(f"💬 Text conversation: '{text}'")
        
        # Generate AI response
        ai_response = generate_ai_response(text, session_id)
        
        # Generate TTS audio
        tts_result = generate_speech_audio(ai_response)
        if not tts_result:
            return jsonify({
                'success': False,
                'message': 'Could not generate speech'
            })
        
        response_audio, response_sample_rate = tts_result
        
        # Generate LAM expressions
        lam_expressions = generate_lam_expressions(response_audio, response_sample_rate, session_id)
        
        # Encode audio
        response_audio_base64 = base64.b64encode(response_audio.astype(np.float32).tobytes()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'user_text': text,
            'ai_response': ai_response,
            'response_audio': response_audio_base64,
            'response_sample_rate': response_sample_rate,
            'audio_duration': len(response_audio) / response_sample_rate,
            'lam_expressions': lam_expressions
        })
        
    except Exception as e:
        print(f"❌ Text conversation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset_conversation', methods=['POST'])
def reset_conversation():
    """Reset conversation history"""
    global conversation_history
    
    data = request.get_json()
    session_id = data.get('session_id', 'default')
    
    if session_id in conversation_history:
        del conversation_history[session_id]
    
    return jsonify({'success': True, 'message': f'Conversation reset for session {session_id}'})

if __name__ == '__main__':
    print("🚀 Starting Real AI Conversation Server...")
    print("Pipeline: VAD → ASR → LLM → TTS → LAM_Audio2Expression")
    
    # Initialize all components
    components_ready = []
    
    if initialize_whisper():
        components_ready.append("✅ Whisper ASR")
    else:
        components_ready.append("❌ Whisper ASR (install: pip install openai-whisper)")
    
    if initialize_openai():
        components_ready.append("✅ OpenAI LLM+TTS")
    else:
        components_ready.append("❌ OpenAI (set OPENAI_API_KEY env var)")
    
    if initialize_lam_engine():
        components_ready.append("✅ LAM_Audio2Expression")
    else:
        components_ready.append("❌ LAM_Audio2Expression")
    
    print("\n🎯 Component Status:")
    for status in components_ready:
        print(f"  {status}")
    
    print(f"\n🌐 Server starting on http://0.0.0.0:5002")
    print("📝 Required environment variables:")
    print("  - OPENAI_API_KEY: Your OpenAI API key for LLM and TTS")
    
    # Start the server
    app.run(host='0.0.0.0', port=5002, debug=True)