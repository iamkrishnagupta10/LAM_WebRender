import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Avatar configuration - 100 unique avatars
const avatarConfigs = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Avatar_${i + 1}`,
  personality: getRandomPersonality(),
  modelType: getRandomModelType(),
  assetPath: `./asset/avatar_${(i % 10) + 1}.zip`, // Cycling through 10 different avatar models
  color: getRandomColor(),
  position: {
    x: (i % 10) * 120,
    y: Math.floor(i / 10) * 120,
    z: 0
  }
}));

function getRandomPersonality() {
  const personalities = [
    'friendly', 'professional', 'creative', 'analytical', 'empathetic',
    'humorous', 'serious', 'optimistic', 'curious', 'supportive'
  ];
  return personalities[Math.floor(Math.random() * personalities.length)];
}

function getRandomModelType() {
  const modelTypes = [
    'nlp_xlmr_named-entity-recognition_viet-ecommerce-title',
    'nlp_structbert_word-segmentation_chinese-base',
    'nlp_convbert_text-classification_chinese-base',
    'nlp_roberta_sentiment-classification_english-base'
  ];
  return modelTypes[Math.floor(Math.random() * modelTypes.length)];
}

function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ModelScope API integration
const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY || 'your-api-key';

async function callModelScopeAPI(text, modelType, personality) {
  try {
    // Simulate ModelScope API call - replace with actual API endpoint
    const response = await axios.post('https://api.modelscope.cn/v1/models/predict', {
      model: `damo/${modelType}`,
      input: {
        text: text,
        personality: personality
      }
    }, {
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.output;
  } catch (error) {
    console.error('ModelScope API error:', error);
    // Fallback response
    return generateFallbackResponse(text, personality);
  }
}

function generateFallbackResponse(text, personality) {
  const responses = {
    friendly: `Hi there! I heard you say "${text}". That's really interesting! How can I help you today?`,
    professional: `Thank you for your message: "${text}". I'm here to assist you with any questions you may have.`,
    creative: `Wow, "${text}" - that sparks so many creative ideas! Let me think of something amazing to share with you.`,
    analytical: `I've processed your input: "${text}". Based on my analysis, here are some insights I can provide.`,
    empathetic: `I understand you mentioned "${text}". I can sense this might be important to you. I'm here to listen.`,
    humorous: `Haha, "${text}" - you know what? That reminds me of something funny! Let me brighten your day.`,
    serious: `Regarding your statement "${text}", I want to provide you with a thoughtful and comprehensive response.`,
    optimistic: `"${text}" - what a wonderful thing to share! I'm excited to explore this topic with you further.`,
    curious: `"${text}" - now that's fascinating! I have so many questions about this. Tell me more!`,
    supportive: `I appreciate you sharing "${text}" with me. I want you to know that I'm here to support you.`
  };
  
  return responses[personality] || `Thank you for saying "${text}". I'm here to chat with you!`;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send avatar configurations to client
  socket.emit('avatarConfigs', avatarConfigs);
  
  // Handle user messages
  socket.on('sendMessage', async (data) => {
    const { avatarId, message, userId } = data;
    const avatar = avatarConfigs.find(a => a.id === avatarId);
    
    if (avatar) {
      // Update avatar state to "Listening"
      io.emit('avatarStateUpdate', { avatarId, state: 'Listening' });
      
      setTimeout(async () => {
        // Update avatar state to "Thinking"
        io.emit('avatarStateUpdate', { avatarId, state: 'Thinking' });
        
        // Get response from ModelScope
        const response = await callModelScopeAPI(message, avatar.modelType, avatar.personality);
        
        setTimeout(() => {
          // Update avatar state to "Responding"
          io.emit('avatarStateUpdate', { avatarId, state: 'Responding' });
          
          // Send response back to all clients
          io.emit('avatarResponse', {
            avatarId,
            avatarName: avatar.name,
            message: response,
            timestamp: new Date().toISOString(),
            messageId: uuidv4()
          });
          
          setTimeout(() => {
            // Return to idle state
            io.emit('avatarStateUpdate', { avatarId, state: 'Idle' });
          }, 3000);
        }, 1000);
      }, 500);
    }
  });
  
  // Handle avatar selection
  socket.on('selectAvatar', (avatarId) => {
    const avatar = avatarConfigs.find(a => a.id === avatarId);
    if (avatar) {
      socket.emit('avatarSelected', avatar);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/avatars', (req, res) => {
  res.json(avatarConfigs);
});

app.get('/api/avatar/:id', (req, res) => {
  const avatar = avatarConfigs.find(a => a.id === parseInt(req.params.id));
  if (avatar) {
    res.json(avatar);
  } else {
    res.status(404).json({ error: 'Avatar not found' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { avatarId, message } = req.body;
  const avatar = avatarConfigs.find(a => a.id === avatarId);
  
  if (!avatar) {
    return res.status(404).json({ error: 'Avatar not found' });
  }
  
  const response = await callModelScopeAPI(message, avatar.modelType, avatar.personality);
  res.json({ response, avatarName: avatar.name });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 100 AI Avatars ready for real-time chat!`);
  console.log(`📡 WebSocket server ready for connections`);
});