import { GaussianAvatar } from './gaussianAvatar.js';

interface Avatar {
  id: number;
  name: string;
  personality: string;
  model: string;
  state: string;
  container: HTMLDivElement;
  avatar: GaussianAvatar | null;
}

export class AvatarManager {
  private avatars: Avatar[] = [];
  private mainContainer: HTMLElement;
  private chatContainer: HTMLElement | null = null;
  private currentChatAvatar: Avatar | null = null;

  constructor() {
    this.mainContainer = document.getElementById('LAM_WebRender') || document.body;
    this.initialize();
  }

  private async initialize() {
    console.log('🚀 Initializing LAM Avatar Manager...');
    
    // Create main layout
    this.createMainLayout();
    
    // Create 100 avatars immediately
    await this.createAvatars();
    
    // Hide loading screen
    this.hideLoadingScreen();
    
    console.log('✅ LAM Avatar Manager initialized with 100 avatars');
  }

  private createMainLayout() {
    this.mainContainer.innerHTML = `
      <div id="avatar-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
        padding: 20px;
        height: 100vh;
        overflow-y: auto;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      "></div>
      
      <div id="chat-interface" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 600px;
        height: 70%;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 15px;
        display: none;
        flex-direction: column;
        z-index: 1000;
      ">
        <div style="
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: between;
          align-items: center;
        ">
          <h3 id="chat-title" style="color: white; margin: 0;">Chat with Avatar</h3>
          <button id="close-chat" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
          ">✕</button>
        </div>
        
        <div id="chat-messages" style="
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          color: white;
        "></div>
        
        <div style="
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 10px;
        ">
          <input id="chat-input" type="text" placeholder="Type your message..." style="
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            outline: none;
          ">
          <button id="send-message" style="
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            background: #667eea;
            color: white;
            cursor: pointer;
          ">Send</button>
        </div>
      </div>
    `;
    
    this.setupChatInterface();
  }

  private async createAvatars() {
    const gridContainer = document.getElementById('avatar-grid');
    if (!gridContainer) return;

    const personalities = [
      'Friendly', 'Professional', 'Creative', 'Analytical', 'Enthusiastic',
      'Calm', 'Energetic', 'Wise', 'Playful', 'Mysterious'
    ];

    const models = [
      'LAM-Base-v1', 'LAM-Enhanced-v2', 'LAM-Creative-v1', 'LAM-Pro-v2'
    ];

    // Create 100 avatars
    for (let i = 0; i < 100; i++) {
      const personality = personalities[i % personalities.length];
      const model = models[i % models.length];
      
      const avatarData: Avatar = {
        id: i + 1,
        name: `Avatar ${i + 1}`,
        personality,
        model,
        state: 'Idle',
        container: document.createElement('div'),
        avatar: null
      };

      // Create avatar container
      avatarData.container.style.cssText = `
        width: 120px;
        height: 120px;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
        overflow: hidden;
      `;

      avatarData.container.addEventListener('mouseenter', () => {
        avatarData.container.style.transform = 'scale(1.05)';
      });

      avatarData.container.addEventListener('mouseleave', () => {
        avatarData.container.style.transform = 'scale(1)';
      });

      avatarData.container.addEventListener('click', () => {
        this.openChat(avatarData);
      });

      // Add avatar info overlay
      const infoOverlay = document.createElement('div');
      infoOverlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px;
        font-size: 10px;
        text-align: center;
      `;
      infoOverlay.innerHTML = `
        <div>${avatarData.name}</div>
        <div style="opacity: 0.8;">${personality}</div>
      `;
      avatarData.container.appendChild(infoOverlay);

      // Initialize Gaussian Avatar
      try {
        avatarData.avatar = new GaussianAvatar(avatarData.container, `./asset/avatar_${i + 1}.json`, {
          width: 120,
          height: 120,
          backgroundColor: "#000",
          autoStart: true
        });
        
        console.log(`✅ Avatar ${i + 1} initialized`);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize Avatar ${i + 1}:`, error);
      }

      this.avatars.push(avatarData);
      gridContainer.appendChild(avatarData.container);

      // Add small delay to prevent overwhelming the browser
      if (i % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  private setupChatInterface() {
    const closeButton = document.getElementById('close-chat');
    const sendButton = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;

    closeButton?.addEventListener('click', () => this.closeChat());
    sendButton?.addEventListener('click', () => this.sendMessage());
    
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  private openChat(avatar: Avatar) {
    this.currentChatAvatar = avatar;
    
    const chatInterface = document.getElementById('chat-interface');
    const chatTitle = document.getElementById('chat-title');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatInterface && chatTitle && chatMessages) {
      chatTitle.textContent = `Chat with ${avatar.name}`;
      chatMessages.innerHTML = `
        <div style="text-align: center; padding: 20px; opacity: 0.7;">
          <div>🤖 ${avatar.name}</div>
          <div style="margin-top: 5px; font-size: 12px;">Personality: ${avatar.personality}</div>
          <div style="margin-top: 5px; font-size: 12px;">Model: ${avatar.model}</div>
          <div style="margin-top: 15px;">Start chatting!</div>
        </div>
      `;
      
      chatInterface.style.display = 'flex';
      
      // Update avatar state
      if (avatar.avatar) {
        avatar.avatar.setState('Listening');
      }
    }
  }

  private closeChat() {
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
      chatInterface.style.display = 'none';
    }
    
    // Reset avatar state
    if (this.currentChatAvatar && this.currentChatAvatar.avatar) {
      this.currentChatAvatar.avatar.setState('Idle');
    }
    
    this.currentChatAvatar = null;
  }

  private async sendMessage() {
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages || !this.currentChatAvatar) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    this.addChatMessage('user', message);
    chatInput.value = '';
    
    // Update avatar state
    if (this.currentChatAvatar.avatar) {
      this.currentChatAvatar.avatar.setState('Thinking');
    }
    
    // Simulate AI response
    setTimeout(() => {
      this.generateAvatarResponse(message);
    }, 1000 + Math.random() * 2000);
  }

  private generateAvatarResponse(userMessage: string) {
    if (!this.currentChatAvatar) return;
    
    const avatar = this.currentChatAvatar;
    
    // Generate personality-based response
    const responses = {
      'Friendly': [
        "That's a great question! I love talking about that.",
        "I'm so glad you asked! Let me share my thoughts...",
        "You seem really thoughtful! Here's what I think..."
      ],
      'Professional': [
        "Based on my analysis, I would recommend...",
        "That's an excellent point. Let me provide some insights...",
        "From a professional perspective, I believe..."
      ],
      'Creative': [
        "Oh, that sparks so many creative ideas! What if...",
        "I see this from an artistic angle. Have you considered...",
        "That's fascinating! It reminds me of..."
      ],
      'Analytical': [
        "Let me break this down systematically...",
        "The data suggests that...",
        "If we analyze this step by step..."
      ],
      'Enthusiastic': [
        "WOW! That's amazing! I think...",
        "I'm SO excited to discuss this with you!",
        "This is fantastic! Here's my take..."
      ]
    };
    
    const personalityResponses = responses[avatar.personality as keyof typeof responses] || responses['Friendly'];
    const response = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    
    // Update avatar state
    if (avatar.avatar) {
      avatar.avatar.setState('Responding');
    }
    
    // Add avatar response
    this.addChatMessage('avatar', response);
    
    // Reset to listening state
    setTimeout(() => {
      if (avatar.avatar) {
        avatar.avatar.setState('Listening');
      }
    }, 3000);
  }

  private addChatMessage(sender: 'user' | 'avatar', message: string) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 10px;
      ${sender === 'user' 
        ? 'background: #667eea; margin-left: 20%; text-align: right;' 
        : 'background: rgba(255, 255, 255, 0.1); margin-right: 20%;'
      }
    `;
    
    messageDiv.innerHTML = `
      <div style="font-size: 11px; opacity: 0.7; margin-bottom: 5px;">
        ${sender === 'user' ? 'You' : this.currentChatAvatar?.name || 'Avatar'}
      </div>
      <div>${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  private hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Also try global function
    if (typeof (window as any).hideLoadingScreen === 'function') {
      (window as any).hideLoadingScreen();
    }
  }

  // Public methods for external access
  public getAvatars(): Avatar[] {
    return this.avatars;
  }

  public getAvatarById(id: number): Avatar | undefined {
    return this.avatars.find(avatar => avatar.id === id);
  }

  public setAvatarState(id: number, state: string) {
    const avatar = this.getAvatarById(id);
    if (avatar && avatar.avatar) {
      avatar.avatar.setState(state);
    }
  }
}

// Make avatar manager globally accessible
export const avatarManager = new AvatarManager();