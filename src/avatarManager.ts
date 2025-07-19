import { GaussianAvatar } from './gaussianAvatar';
import { io, Socket } from 'socket.io-client';

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
  private socket: Socket;
  private avatars: Map<number, GaussianAvatar> = new Map();
  private avatarConfigs: AvatarConfig[] = [];
  private selectedAvatarId: number | null = null;
  private chatContainer: HTMLElement;
  private avatarGrid: HTMLElement;
  private chatMessages: ChatMessage[] = [];
  
  constructor(
    private container: HTMLElement,
    private serverUrl: string = 'http://localhost:3001'
  ) {
    this.socket = io(this.serverUrl);
    this.setupSocketListeners();
    this.createUI();
  }

  private createUI() {
    this.container.innerHTML = `
      <div class="app-container">
        <div class="header">
          <h1>🤖 100 AI Avatars - Live Chat Room</h1>
          <div class="stats">
            <span id="connectedUsers">Connected Users: 1</span>
            <span id="activeAvatars">Active Avatars: 0</span>
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
            <div class="avatar-grid" id="avatarGrid"></div>
          </div>
          
          <div class="chat-section">
            <div class="selected-avatar-info" id="selectedAvatarInfo">
              <p>Select an avatar to start chatting</p>
            </div>
            <div class="avatar-display" id="avatarDisplay">
              <div class="no-avatar-selected">
                <div class="avatar-placeholder">
                  <div class="pulse-circle"></div>
                  <p>Choose an avatar from the left</p>
                </div>
              </div>
            </div>
            <div class="chat-container" id="chatContainer"></div>
            <div class="chat-input-container">
              <div class="input-group">
                <input type="text" id="messageInput" placeholder="Type your message..." disabled />
                <button id="sendButton" disabled>Send</button>
                <button id="voiceButton" disabled>🎤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.avatarGrid = document.getElementById('avatarGrid')!;
    this.chatContainer = document.getElementById('chatContainer')!;
    
    this.setupEventListeners();
    this.addStyles();
  }

  private setupEventListeners() {
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    const searchInput = document.getElementById('searchAvatars') as HTMLInputElement;
    const personalityFilter = document.getElementById('filterPersonality') as HTMLSelectElement;

    sendButton.addEventListener('click', () => this.sendMessage());
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    searchInput.addEventListener('input', () => this.filterAvatars());
    personalityFilter.addEventListener('change', () => this.filterAvatars());

    // Voice input (placeholder for future implementation)
    const voiceButton = document.getElementById('voiceButton');
    voiceButton?.addEventListener('click', () => {
      // TODO: Implement voice input
      console.log('Voice input not implemented yet');
    });
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('avatarConfigs', (configs: AvatarConfig[]) => {
      this.avatarConfigs = configs;
      this.renderAvatarGrid();
      this.updateStats();
    });

    this.socket.on('avatarStateUpdate', ({ avatarId, state }) => {
      this.updateAvatarState(avatarId, state);
    });

    this.socket.on('avatarResponse', (response: ChatMessage) => {
      this.addChatMessage(response);
    });

    this.socket.on('avatarSelected', (avatar: AvatarConfig) => {
      this.displaySelectedAvatar(avatar);
    });
  }

  private renderAvatarGrid() {
    this.avatarGrid.innerHTML = '';
    
    this.avatarConfigs.forEach(config => {
      const avatarCard = document.createElement('div');
      avatarCard.className = 'avatar-card';
      avatarCard.setAttribute('data-id', config.id.toString());
      avatarCard.setAttribute('data-personality', config.personality);
      
      avatarCard.innerHTML = `
        <div class="avatar-preview" style="background: linear-gradient(45deg, ${config.color}, ${config.color}80);">
          <div class="avatar-status idle" id="status-${config.id}"></div>
          <div class="avatar-mini" id="mini-${config.id}">
            <div class="loading-placeholder">Loading...</div>
          </div>
        </div>
        <div class="avatar-info">
          <h3>${config.name}</h3>
          <p class="personality">${config.personality}</p>
          <p class="model">${config.modelType.split('_')[1]}</p>
        </div>
      `;

      avatarCard.addEventListener('click', () => this.selectAvatar(config.id));
      this.avatarGrid.appendChild(avatarCard);
      
      // Load mini avatar preview
      this.loadMiniAvatar(config);
    });
  }

  private async loadMiniAvatar(config: AvatarConfig) {
    const miniContainer = document.getElementById(`mini-${config.id}`);
    if (miniContainer) {
      try {
        // Create a smaller version of the avatar for preview
        const miniAvatar = new GaussianAvatar(miniContainer as HTMLDivElement, config.assetPath, {
          width: 80,
          height: 80,
          autoStart: true
        });
        this.avatars.set(config.id, miniAvatar);
      } catch (error) {
        console.error(`Failed to load mini avatar ${config.id}:`, error);
        miniContainer.innerHTML = '<div class="error-placeholder">❌</div>';
      }
    }
  }

  private selectAvatar(avatarId: number) {
    this.selectedAvatarId = avatarId;
    this.socket.emit('selectAvatar', avatarId);
    
    // Update UI
    document.querySelectorAll('.avatar-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-id="${avatarId}"]`);
    selectedCard?.classList.add('selected');
    
    // Enable chat input
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    const voiceButton = document.getElementById('voiceButton') as HTMLButtonElement;
    
    messageInput.disabled = false;
    sendButton.disabled = false;
    voiceButton.disabled = false;
    messageInput.focus();
  }

  private displaySelectedAvatar(avatar: AvatarConfig) {
    const avatarDisplay = document.getElementById('avatarDisplay')!;
    const selectedAvatarInfo = document.getElementById('selectedAvatarInfo')!;
    
    selectedAvatarInfo.innerHTML = `
      <div class="selected-avatar-details">
        <h2>${avatar.name}</h2>
        <div class="avatar-badges">
          <span class="badge personality">${avatar.personality}</span>
          <span class="badge model">${avatar.modelType.split('_')[1]}</span>
        </div>
      </div>
    `;

    avatarDisplay.innerHTML = `
      <div class="main-avatar-container" id="mainAvatar">
        <div class="loading-main">Loading ${avatar.name}...</div>
      </div>
    `;

    // Load full-size avatar
    this.loadMainAvatar(avatar);
  }

  private async loadMainAvatar(avatar: AvatarConfig) {
    const mainContainer = document.getElementById('mainAvatar');
    if (mainContainer) {
      try {
        const mainAvatar = new GaussianAvatar(mainContainer as HTMLDivElement, avatar.assetPath, {
          width: 400,
          height: 400,
          autoStart: true
        });
        
        // Store reference for state updates
        this.avatars.set(`main-${avatar.id}`, mainAvatar);
      } catch (error) {
        console.error(`Failed to load main avatar ${avatar.id}:`, error);
        mainContainer.innerHTML = '<div class="error-main">Failed to load avatar</div>';
      }
    }
  }

  private updateAvatarState(avatarId: number, state: string) {
    const statusElement = document.getElementById(`status-${avatarId}`);
    if (statusElement) {
      statusElement.className = `avatar-status ${state.toLowerCase()}`;
    }

    // Update main avatar if it's the selected one
    const mainAvatar = this.avatars.get(`main-${avatarId}`);
    if (mainAvatar && this.selectedAvatarId === avatarId) {
      mainAvatar.setState(state);
    }
  }

  private sendMessage() {
    if (!this.selectedAvatarId) return;
    
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      avatarId: this.selectedAvatarId,
      avatarName: 'You',
      message,
      timestamp: new Date().toISOString(),
      messageId: `user-${Date.now()}`,
      isUser: true
    };
    
    this.addChatMessage(userMessage);
    
    // Send to server
    this.socket.emit('sendMessage', {
      avatarId: this.selectedAvatarId,
      message,
      userId: this.socket.id
    });
    
    messageInput.value = '';
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
    
    // Add typing animation for avatar responses
    if (!message.isUser) {
      messageElement.classList.add('typing');
      setTimeout(() => {
        messageElement.classList.remove('typing');
      }, 1000);
    }
  }

  private filterAvatars() {
    const searchTerm = (document.getElementById('searchAvatars') as HTMLInputElement).value.toLowerCase();
    const personalityFilter = (document.getElementById('filterPersonality') as HTMLSelectElement).value;
    
    document.querySelectorAll('.avatar-card').forEach(card => {
      const element = card as HTMLElement;
      const avatarId = parseInt(element.getAttribute('data-id')!);
      const config = this.avatarConfigs.find(c => c.id === avatarId);
      
      if (!config) return;
      
      const matchesSearch = config.name.toLowerCase().includes(searchTerm) ||
                           config.personality.toLowerCase().includes(searchTerm) ||
                           config.modelType.toLowerCase().includes(searchTerm);
      
      const matchesPersonality = !personalityFilter || config.personality === personalityFilter;
      
      element.style.display = (matchesSearch && matchesPersonality) ? 'block' : 'none';
    });
  }

  private updateStats() {
    const activeAvatarsCount = this.avatars.size;
    const activeAvatarsElement = document.getElementById('activeAvatars');
    if (activeAvatarsElement) {
      activeAvatarsElement.textContent = `Active Avatars: ${activeAvatarsCount}`;
    }
  }

  private addStyles() {
    const style = document.createElement('style');
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
      }

      .main-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .avatar-section {
        width: 400px;
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

      .avatar-grid {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
      }

      .avatar-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }

      .avatar-card:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.15);
      }

      .avatar-card.selected {
        border-color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
      }

      .avatar-preview {
        position: relative;
        height: 80px;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        overflow: hidden;
      }

      .avatar-status {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        z-index: 2;
      }

      .avatar-status.idle { background: #gray; }
      .avatar-status.listening { background: #00ff88; animation: pulse 1s infinite; }
      .avatar-status.thinking { background: #ffa500; animation: pulse 0.5s infinite; }
      .avatar-status.responding { background: #ff4757; animation: pulse 0.3s infinite; }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .avatar-mini {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
      }

      .avatar-info h3 {
        color: white;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .avatar-info p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        margin-bottom: 0.1rem;
      }

      .chat-section {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .selected-avatar-info {
        padding: 1rem 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .selected-avatar-details h2 {
        color: white;
        margin-bottom: 0.5rem;
      }

      .avatar-badges {
        display: flex;
        gap: 0.5rem;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        color: white;
      }

      .badge.personality {
        background: rgba(0, 255, 136, 0.3);
      }

      .badge.model {
        background: rgba(255, 167, 0, 0.3);
      }

      .avatar-display {
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        margin: 1rem 2rem;
        border-radius: 12px;
      }

      .no-avatar-selected {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
      }

      .pulse-circle {
        width: 100px;
        height: 100px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        margin: 0 auto 1rem;
        animation: pulse 2s infinite;
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
        max-width: 80%;
      }

      .user-message {
        background: rgba(0, 255, 136, 0.2);
        margin-left: auto;
        color: white;
      }

      .avatar-message {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        opacity: 0.8;
      }

      .message-content {
        line-height: 1.4;
      }

      .chat-input-container {
        padding: 1rem 2rem 2rem;
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
      }

      .input-group input::placeholder {
        color: rgba(255, 255, 255, 0.6);
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
      }

      .input-group button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .input-group button:not(:disabled):hover {
        background: #00e67a;
        transform: translateY(-1px);
      }

      .typing {
        animation: typing 1s ease-in-out;
      }

      @keyframes typing {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* Scrollbar styles */
      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `;
    
    document.head.appendChild(style);
  }

  public start() {
    console.log('🚀 Avatar Manager started - 100 AI Avatars ready!');
  }
}