import { GaussianAvatar } from './gaussianAvatar';

export interface AvatarConfig {
  id: number;
  name: string;
  personality: string;
  modelType: string;
  assetPath: string;
  color: string;
  position: { x: number; y: number; z: number };
}

export interface ChatMessage {
  avatarId: number;
  avatarName: string;
  message: string;
  timestamp: string;
  messageId: string;
  isUser?: boolean;
}

export class AvatarManager {
  private avatars: Map<string, GaussianAvatar> = new Map();
  private avatarConfigs: AvatarConfig[] = [];
  private selectedAvatarId: number | null = null;
  private chatContainer!: HTMLElement;
  private avatarGrid!: HTMLElement;
  private chatMessages: ChatMessage[] = [];
  
  constructor(private container: HTMLElement) {
    console.log('🏗️ Initializing AvatarManager...');
    
    try {
      this.generateAvatars();
      console.log(`✅ Generated ${this.avatarConfigs.length} avatars`);
      
      this.createUI();
      console.log('✅ UI created successfully');
      
    } catch (error) {
      console.error('❌ Error in AvatarManager constructor:', error);
      throw error;
    }
  }

  private generateAvatars() {
    console.log('🎭 Generating avatar configurations...');
    
    const personalities = [
      'friendly', 'professional', 'creative', 'analytical', 'empathetic',
      'humorous', 'serious', 'optimistic', 'curious', 'supportive'
    ];
    
    const modelTypes = [
      'nlp_xlmr_named-entity-recognition_viet-ecommerce-title',
      'nlp_structbert_word-segmentation_chinese-base',
      'nlp_convbert_text-classification_chinese-base',
      'nlp_roberta_sentiment-classification_english-base'
    ];
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    this.avatarConfigs = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Avatar_${i + 1}`,
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      modelType: modelTypes[Math.floor(Math.random() * modelTypes.length)],
      assetPath: `./asset/avatar_${(i % 10) + 1}.zip`,
      color: colors[Math.floor(Math.random() * colors.length)],
      position: {
        x: (i % 10) * 120,
        y: Math.floor(i / 10) * 120,
        z: 0
      }
    }));
    
    console.log(`🎯 Created ${this.avatarConfigs.length} avatar configurations`);
  }

  private createUI() {
    console.log('🎨 Creating user interface...');
    
    if (!this.container) {
      throw new Error('Container element is required');
    }
    
    this.container.innerHTML = `
      <div class="app-container">
        <div class="header">
          <h1>🤖 100 AI Avatars - Live Chat Room</h1>
          <div class="stats">
            <span id="connectedUsers">Demo Mode - Ready!</span>
            <span id="activeAvatars">Loading avatars...</span>
          </div>
        </div>
        
        <div class="main-content">
          <div class="avatar-section">
            <div class="controls">
              <input type="text" id="searchAvatars" placeholder="Search avatars..." />
              <select id="filterPersonality">
                <option value="">All Personalities</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="analytical">Analytical</option>
                <option value="empathetic">Empathetic</option>
                <option value="humorous">Humorous</option>
                <option value="serious">Serious</option>
                <option value="optimistic">Optimistic</option>
                <option value="curious">Curious</option>
                <option value="supportive">Supportive</option>
              </select>
            </div>
            <div class="avatar-grid" id="avatarGrid">
              <div class="loading-message">Loading 100 AI Avatars...</div>
            </div>
          </div>
          
          <div class="chat-section">
            <div class="selected-avatar-info" id="selectedAvatarInfo">
              <div class="welcome-message">
                <h2>Welcome to 100 AI Avatars! 👋</h2>
                <p>Select any avatar from the left to start chatting. Each avatar has a unique personality and will respond differently to your messages.</p>
              </div>
            </div>
            <div class="avatar-display" id="avatarDisplay">
              <div class="no-avatar-selected">
                <div class="avatar-placeholder">
                  <div class="pulse-circle"></div>
                  <p>Choose an avatar from the left panel</p>
                  <p class="hint">✨ Try clicking on any of the 100 unique avatars!</p>
                </div>
              </div>
            </div>
            <div class="chat-container" id="chatContainer">
              <div class="welcome-chat">
                <div class="chat-message avatar-message">
                  <div class="message-header">
                    <span class="sender">System</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                  </div>
                  <div class="message-content">
                    Welcome! 🎉 Select an avatar to begin your conversation. Each avatar has a unique personality and will chat with you in their own style.
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-input-container">
              <div class="input-group">
                <input type="text" id="messageInput" placeholder="Select an avatar first, then type your message..." disabled />
                <button id="sendButton" disabled>Send</button>
                <button id="voiceButton" disabled title="Voice input coming soon!">🎤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Get references to key elements
    this.avatarGrid = document.getElementById('avatarGrid')!;
    this.chatContainer = document.getElementById('chatContainer')!;
    
    if (!this.avatarGrid || !this.chatContainer) {
      throw new Error('Required UI elements not found');
    }
    
    console.log('🎛️ Setting up event listeners...');
    this.setupEventListeners();
    
    console.log('🎨 Adding styles...');
    this.addStyles();
    
    console.log('🎭 Rendering avatar grid...');
    this.renderAvatarGrid();
  }

  private setupEventListeners() {
    try {
      const messageInput = document.getElementById('messageInput') as HTMLInputElement;
      const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
      const searchInput = document.getElementById('searchAvatars') as HTMLInputElement;
      const personalityFilter = document.getElementById('filterPersonality') as HTMLSelectElement;

      if (messageInput && sendButton) {
        sendButton.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.sendMessage();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => this.filterAvatars());
      }
      
      if (personalityFilter) {
        personalityFilter.addEventListener('change', () => this.filterAvatars());
      }

      const voiceButton = document.getElementById('voiceButton');
      if (voiceButton) {
        voiceButton.addEventListener('click', () => {
          alert('🎤 Voice input feature coming soon! For now, please type your messages.');
        });
      }
      
      console.log('✅ Event listeners set up successfully');
    } catch (error) {
      console.error('❌ Error setting up event listeners:', error);
    }
  }

  private renderAvatarGrid() {
    console.log('🎭 Rendering avatar grid...');
    
    if (!this.avatarGrid) {
      console.error('❌ Avatar grid element not found');
      return;
    }
    
    this.avatarGrid.innerHTML = '';
    
    if (this.avatarConfigs.length === 0) {
      this.avatarGrid.innerHTML = '<div class="error-message">No avatars available</div>';
      return;
    }
    
    this.avatarConfigs.forEach((config, index) => {
      try {
        const avatarCard = document.createElement('div');
        avatarCard.className = 'avatar-card';
        avatarCard.setAttribute('data-id', config.id.toString());
        avatarCard.setAttribute('data-personality', config.personality);
        
        avatarCard.innerHTML = `
          <div class="avatar-preview" style="background: linear-gradient(45deg, ${config.color}, ${config.color}80);">
            <div class="avatar-status idle" id="status-${config.id}"></div>
            <div class="avatar-mini" id="mini-${config.id}">
              <div class="avatar-icon">🤖</div>
            </div>
          </div>
          <div class="avatar-info">
            <h3>${config.name}</h3>
            <p class="personality">${config.personality}</p>
            <p class="model">${config.modelType.split('_')[1] || 'AI Model'}</p>
          </div>
        `;

        avatarCard.addEventListener('click', () => {
          console.log(`🎯 Avatar ${config.id} selected: ${config.name}`);
          this.selectAvatar(config.id);
        });
        
        this.avatarGrid.appendChild(avatarCard);
        
        // Log progress every 20 avatars
        if ((index + 1) % 20 === 0) {
          console.log(`📊 Rendered ${index + 1}/${this.avatarConfigs.length} avatars`);
        }
        
      } catch (error) {
        console.error(`❌ Error rendering avatar ${config.id}:`, error);
      }
    });
    
    this.updateStats();
    console.log(`✅ Successfully rendered ${this.avatarConfigs.length} avatars`);
  }

  private selectAvatar(avatarId: number) {
    console.log(`🎯 Selecting avatar ${avatarId}...`);
    
    this.selectedAvatarId = avatarId;
    const avatar = this.avatarConfigs.find(a => a.id === avatarId);
    
    if (!avatar) {
      console.error(`❌ Avatar ${avatarId} not found`);
      return;
    }
    
    // Update UI selection
    document.querySelectorAll('.avatar-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-id="${avatarId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
      selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Enable chat input
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    const voiceButton = document.getElementById('voiceButton') as HTMLButtonElement;
    
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.placeholder = `Chat with ${avatar.name} (${avatar.personality})...`;
      messageInput.focus();
    }
    
    if (sendButton) sendButton.disabled = false;
    if (voiceButton) voiceButton.disabled = false;
    
    this.displaySelectedAvatar(avatar);
    
    // Clear welcome message from chat
    const welcomeChat = document.querySelector('.welcome-chat');
    if (welcomeChat) {
      welcomeChat.remove();
    }
    
    console.log(`✅ Avatar ${avatar.name} selected successfully`);
  }

  private displaySelectedAvatar(avatar: AvatarConfig) {
    const avatarDisplay = document.getElementById('avatarDisplay')!;
    const selectedAvatarInfo = document.getElementById('selectedAvatarInfo')!;
    
    selectedAvatarInfo.innerHTML = `
      <div class="selected-avatar-details">
        <h2>${avatar.name} 🤖</h2>
        <div class="avatar-badges">
          <span class="badge personality">${avatar.personality}</span>
          <span class="badge model">${avatar.modelType.split('_')[1] || 'AI Model'}</span>
        </div>
        <p class="avatar-description">This avatar has a <strong>${avatar.personality}</strong> personality and will respond to your messages accordingly.</p>
      </div>
    `;

    avatarDisplay.innerHTML = `
      <div class="main-avatar-container" id="mainAvatar">
        <div class="main-avatar-display" style="background: linear-gradient(135deg, ${avatar.color}, ${avatar.color}40);">
          <div class="avatar-face">🤖</div>
          <div class="avatar-name">${avatar.name}</div>
          <div class="avatar-personality">${avatar.personality.toUpperCase()}</div>
          <div class="avatar-status-text" id="mainStatus">Ready to chat!</div>
        </div>
      </div>
    `;

    // Try to load enhanced avatar rendering
    this.loadMainAvatar(avatar);
  }

  private loadMainAvatar(avatar: AvatarConfig) {
    const mainContainer = document.getElementById('mainAvatar');
    if (mainContainer) {
      try {
        const mainAvatar = new GaussianAvatar(mainContainer as HTMLDivElement, avatar.assetPath, {
          width: 400,
          height: 400,
          autoStart: true
        });
        
        this.avatars.set(`main-${avatar.id}`, mainAvatar);
        console.log(`✅ Enhanced avatar loaded for ${avatar.name}`);
      } catch (error) {
        console.warn(`⚠️ Enhanced avatar failed for ${avatar.name}, using fallback:`, error);
        // Fallback is already shown, so this is fine
      }
    }
  }

  private sendMessage() {
    if (!this.selectedAvatarId) {
      alert('Please select an avatar first!');
      return;
    }
    
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const message = messageInput.value.trim();
    
    if (!message) {
      alert('Please enter a message!');
      return;
    }
    
    const avatar = this.avatarConfigs.find(a => a.id === this.selectedAvatarId);
    if (!avatar) return;
    
    console.log(`💬 Sending message to ${avatar.name}: "${message}"`);
    
    // Add user message
    const userMessage: ChatMessage = {
      avatarId: this.selectedAvatarId,
      avatarName: 'You',
      message,
      timestamp: new Date().toISOString(),
      messageId: `user-${Date.now()}`,
      isUser: true
    };
    
    this.addChatMessage(userMessage);
    messageInput.value = '';
    
    // Simulate avatar response
    this.simulateAvatarResponse(avatar, message);
  }

  private simulateAvatarResponse(avatar: AvatarConfig, userMessage: string) {
    console.log(`🤖 ${avatar.name} is responding to: "${userMessage}"`);
    
    // Update status to Listening
    this.updateAvatarState(avatar.id, 'Listening');
    
    setTimeout(() => {
      // Update status to Thinking
      this.updateAvatarState(avatar.id, 'Thinking');
      
      setTimeout(() => {
        // Update status to Responding
        this.updateAvatarState(avatar.id, 'Responding');
        
        // Generate response based on personality
        const response = this.generateResponse(userMessage, avatar.personality);
        
        const avatarMessage: ChatMessage = {
          avatarId: avatar.id,
          avatarName: avatar.name,
          message: response,
          timestamp: new Date().toISOString(),
          messageId: `avatar-${Date.now()}`
        };
        
        this.addChatMessage(avatarMessage);
        
        setTimeout(() => {
          // Return to Ready state
          this.updateAvatarState(avatar.id, 'Idle');
        }, 2000);
      }, 1000 + Math.random() * 2000); // Variable thinking time
    }, 300);
  }

  private generateResponse(text: string, personality: string): string {
    const responses = {
      friendly: [
        `Hi there! I love what you said: "${text}". That's really interesting! How can I help you today?`,
        `Hey! "${text}" - that's so cool to hear! I'm excited to chat with you more about this!`,
        `What a wonderful message: "${text}"! I'm here to help and would love to know more about what you're thinking.`
      ],
      professional: [
        `Thank you for your message: "${text}". I'm here to assist you with any questions you may have.`,
        `I appreciate your input regarding "${text}". Let me provide you with a comprehensive response.`,
        `Your point about "${text}" is well taken. I'm prepared to offer professional guidance on this matter.`
      ],
      creative: [
        `Wow, "${text}" - that sparks so many creative ideas! Let me think of something amazing to share with you.`,
        `"${text}" - now that's inspiring! It makes me think of art, innovation, and endless possibilities!`,
        `Your words "${text}" just lit up my creative circuits! I'm seeing colors, patterns, and new ideas everywhere!`
      ],
      analytical: [
        `I've processed your input: "${text}". Based on my analysis, here are some insights I can provide.`,
        `Analyzing "${text}"... I see several interesting patterns and logical connections here.`,
        `Your statement "${text}" presents fascinating data points. Let me break this down systematically.`
      ],
      empathetic: [
        `I understand you mentioned "${text}". I can sense this might be important to you. I'm here to listen.`,
        `Thank you for sharing "${text}" with me. I want you to know that I hear you and I care about what you're feeling.`,
        `Your words "${text}" really resonate with me. I can feel the emotion behind them, and I'm here to support you.`
      ],
      humorous: [
        `Haha, "${text}" - you know what? That reminds me of something funny! Let me brighten your day.`,
        `"${text}" - now that's comedy gold! 😄 You've got quite the sense of humor! This is going to be fun!`,
        `Oh my, "${text}" - that just made me chuckle! You know what they say... laughter is the best medicine!`
      ],
      serious: [
        `Regarding your statement "${text}", I want to provide you with a thoughtful and comprehensive response.`,
        `"${text}" - this is indeed a serious matter that deserves careful consideration and respect.`,
        `I take your message "${text}" very seriously and want to give you the attention and response it deserves.`
      ],
      optimistic: [
        `"${text}" - what a wonderful thing to share! I'm excited to explore this topic with you further.`,
        `Your message "${text}" just filled me with positive energy! The future looks bright when we think about this!`,
        `I love your perspective on "${text}"! It's amazing how every challenge can become an opportunity!`
      ],
      curious: [
        `"${text}" - now that's fascinating! I have so many questions about this. Tell me more!`,
        `Wow, "${text}" really makes me wonder... there's so much to explore here! What else can you tell me?`,
        `Your point about "${text}" is intriguing! I'm curious to dive deeper - what led you to think about this?`
      ],
      supportive: [
        `I appreciate you sharing "${text}" with me. I want you to know that I'm here to support you.`,
        `Thank you for trusting me with "${text}". Whatever you're going through, you don't have to face it alone.`,
        `Your message "${text}" shows real courage. I believe in you and I'm here to help however I can.`
      ]
    };
    
    const personalityResponses = responses[personality as keyof typeof responses];
    if (personalityResponses && personalityResponses.length > 0) {
      return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    }
    
    return `Thank you for saying "${text}". I'm here to chat with you!`;
  }

  private updateAvatarState(avatarId: number, state: string) {
    const statusElement = document.getElementById(`status-${avatarId}`);
    if (statusElement) {
      statusElement.className = `avatar-status ${state.toLowerCase()}`;
    }

    const mainStatus = document.getElementById('mainStatus');
    if (mainStatus && this.selectedAvatarId === avatarId) {
      const statusTexts = {
        'Idle': 'Ready to chat!',
        'Listening': '👂 Listening...',
        'Thinking': '🤔 Thinking...',
        'Responding': '💭 Responding...'
      };
      mainStatus.textContent = statusTexts[state as keyof typeof statusTexts] || state;
    }

    const mainAvatar = this.avatars.get(`main-${avatarId}`);
    if (mainAvatar && this.selectedAvatarId === avatarId) {
      mainAvatar.setState(state);
    }
  }

  private addChatMessage(message: ChatMessage) {
    this.chatMessages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${message.isUser ? 'user-message' : 'avatar-message'}`;
    
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="sender">${message.avatarName}</span>
        <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${message.message}</div>
    `;
    
    this.chatContainer.appendChild(messageElement);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    if (!message.isUser) {
      messageElement.classList.add('typing');
      setTimeout(() => {
        messageElement.classList.remove('typing');
      }, 1000);
    }
  }

  private filterAvatars() {
    const searchTerm = (document.getElementById('searchAvatars') as HTMLInputElement)?.value.toLowerCase() || '';
    const personalityFilter = (document.getElementById('filterPersonality') as HTMLSelectElement)?.value || '';
    
    let visibleCount = 0;
    
    document.querySelectorAll('.avatar-card').forEach(card => {
      const element = card as HTMLElement;
      const avatarId = parseInt(element.getAttribute('data-id')!);
      const config = this.avatarConfigs.find(c => c.id === avatarId);
      
      if (!config) return;
      
      const matchesSearch = config.name.toLowerCase().includes(searchTerm) ||
                           config.personality.toLowerCase().includes(searchTerm) ||
                           config.modelType.toLowerCase().includes(searchTerm);
      
      const matchesPersonality = !personalityFilter || config.personality === personalityFilter;
      
      const isVisible = matchesSearch && matchesPersonality;
      element.style.display = isVisible ? 'block' : 'none';
      
      if (isVisible) visibleCount++;
    });
    
    console.log(`🔍 Filtered: ${visibleCount}/${this.avatarConfigs.length} avatars visible`);
  }

  private updateStats() {
    const activeAvatarsElement = document.getElementById('activeAvatars');
    if (activeAvatarsElement) {
      activeAvatarsElement.textContent = `${this.avatarConfigs.length} Avatars Ready!`;
    }
  }

  private addStyles() {
    if (document.querySelector('#avatar-styles')) {
      return; // Styles already added
    }
    
    const style = document.createElement('style');
    style.id = 'avatar-styles';
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        overflow-x: hidden;
      }

      .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header h1 {
        color: white;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .stats {
        display: flex;
        gap: 2rem;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        flex-wrap: wrap;
      }

      .main-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .avatar-section {
        width: 400px;
        min-width: 300px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
      }

      .controls {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .controls input, .controls select {
        padding: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 0.9rem;
      }

      .controls input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .controls option {
        background: #333;
        color: white;
      }

      .avatar-grid {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
      }

      .loading-message, .error-message {
        grid-column: 1 / -1;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        padding: 2rem;
        font-size: 1.1rem;
      }

      .avatar-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        backdrop-filter: blur(5px);
      }

      .avatar-card:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .avatar-card.selected {
        border-color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
      }

      .avatar-preview {
        position: relative;
        height: 80px;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .avatar-status {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        z-index: 2;
        border: 2px solid rgba(255, 255, 255, 0.5);
      }

      .avatar-status.idle { background: #666; }
      .avatar-status.listening { 
        background: #00ff88; 
        animation: pulse 1s infinite;
        box-shadow: 0 0 10px #00ff88;
      }
      .avatar-status.thinking { 
        background: #ffa500; 
        animation: pulse 0.5s infinite;
        box-shadow: 0 0 10px #ffa500;
      }
      .avatar-status.responding { 
        background: #ff4757; 
        animation: pulse 0.3s infinite;
        box-shadow: 0 0 10px #ff4757;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      .avatar-mini {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
      }

      .avatar-icon {
        font-size: 2.5rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .avatar-info h3 {
        color: white;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
        font-weight: 600;
      }

      .avatar-info p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        margin-bottom: 0.1rem;
      }

      .avatar-info .personality {
        text-transform: capitalize;
        font-weight: 500;
      }

      .chat-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .selected-avatar-info {
        padding: 1rem 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
      }

      .welcome-message {
        text-align: center;
      }

      .welcome-message h2 {
        margin-bottom: 1rem;
        color: white;
      }

      .welcome-message p {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
      }

      .selected-avatar-details h2 {
        color: white;
        margin-bottom: 0.5rem;
      }

      .avatar-badges {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        color: white;
        font-weight: 500;
      }

      .badge.personality {
        background: rgba(0, 255, 136, 0.3);
      }

      .badge.model {
        background: rgba(255, 167, 0, 0.3);
      }

      .avatar-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .avatar-display {
        height: 350px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        margin: 1rem 2rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .no-avatar-selected {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
      }

      .pulse-circle {
        width: 80px;
        height: 80px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        margin: 0 auto 1rem;
        animation: pulse 2s infinite;
      }

      .hint {
        font-size: 0.9rem;
        margin-top: 0.5rem;
        opacity: 0.8;
      }

      .main-avatar-display {
        text-align: center;
        color: white;
        padding: 2rem;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      .avatar-face {
        font-size: 4rem;
        margin-bottom: 1rem;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .avatar-name {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .avatar-personality {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .avatar-status-text {
        font-size: 0.9rem;
        opacity: 0.8;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        display: inline-block;
      }

      .chat-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 2rem;
        margin-bottom: 1rem;
      }

      .chat-message {
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 12px;
        max-width: 85%;
        backdrop-filter: blur(10px);
      }

      .user-message {
        background: rgba(0, 255, 136, 0.2);
        margin-left: auto;
        color: white;
        border: 1px solid rgba(0, 255, 136, 0.3);
      }

      .avatar-message {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        opacity: 0.8;
      }

      .sender {
        font-weight: 600;
      }

      .message-content {
        line-height: 1.4;
        font-size: 0.95rem;
      }

      .chat-input-container {
        padding: 1rem 2rem 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .input-group {
        display: flex;
        gap: 0.5rem;
      }

      .input-group input {
        flex: 1;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1rem;
        backdrop-filter: blur(10px);
      }

      .input-group input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .input-group input:focus {
        outline: none;
        border-color: #00ff88;
        box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
      }

      .input-group button {
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 12px;
        background: #00ff88;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
      }

      .input-group button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #666;
      }

      .input-group button:not(:disabled):hover {
        background: #00e67a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
      }

      .typing {
        animation: typing 1s ease-in-out;
      }

      @keyframes typing {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .main-content {
          flex-direction: column;
        }
        
        .avatar-section {
          width: 100%;
          height: 50vh;
        }
        
        .header {
          padding: 1rem;
          text-align: center;
        }
        
        .header h1 {
          font-size: 1.2rem;
        }
        
        .stats {
          gap: 1rem;
          font-size: 0.8rem;
        }
        
        .avatar-grid {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        
        .avatar-display {
          height: 200px;
          margin: 0.5rem 1rem;
        }
        
        .chat-input-container {
          padding: 1rem;
        }
      }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Styles added successfully');
  }

  public start() {
    console.log('🚀 Avatar Manager started - 100 AI Avatars ready!');
    console.log('📊 Avatar configurations loaded:', this.avatarConfigs.length);
    console.log('🎨 UI initialized successfully');
    console.log('✨ Ready for user interaction!');
    
    // Hide loading screen
    if (typeof window !== 'undefined' && (window as any).hideLoadingScreen) {
      setTimeout(() => {
        (window as any).hideLoadingScreen();
      }, 500);
    }
  }
}