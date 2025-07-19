export class AvatarManager {
  private selectedAvatarId: number | null = null;
  private chatMessages: any[] = [];
  
  constructor(private container: HTMLElement) {
    console.log('Creating avatar manager...');
    this.createApp();
  }

  private createApp() {
    // Clear container and create the app
    this.container.innerHTML = `
      <div style="display: flex; height: 100vh; font-family: Arial, sans-serif;">
        
        <!-- Left side: Avatar grid -->
        <div style="width: 50%; padding: 20px; overflow-y: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h2 style="color: white; text-align: center; margin-bottom: 20px;">🤖 100 AI Avatars</h2>
          <div id="avatarGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px;">
            ${this.generateAvatarHTML()}
          </div>
        </div>
        
        <!-- Right side: Chat -->
        <div style="width: 50%; display: flex; flex-direction: column; background: #f5f5f5;">
          
          <!-- Selected avatar info -->
          <div id="avatarInfo" style="padding: 20px; background: white; border-bottom: 1px solid #ddd;">
            <h3>Select an avatar to start chatting</h3>
          </div>
          
          <!-- Chat messages -->
          <div id="chatArea" style="flex: 1; padding: 20px; overflow-y: auto; background: #fafafa;">
            <div style="text-align: center; color: #666; margin-top: 50px;">
              Choose any of the 100 avatars on the left to begin your conversation!
            </div>
          </div>
          
          <!-- Chat input -->
          <div style="padding: 20px; background: white; border-top: 1px solid #ddd;">
            <div style="display: flex; gap: 10px;">
              <input type="text" id="messageInput" placeholder="Type your message..." 
                     style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;" disabled>
              <button id="sendButton" onclick="window.avatarManager.sendMessage()" 
                      style="padding: 12px 24px; background: #00ff88; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;" disabled>
                Send
              </button>
            </div>
          </div>
          
        </div>
      </div>
    `;

    // Set up event listeners
    this.setupEventListeners();
    
    console.log('✅ 100 avatars created and ready!');
  }

  private generateAvatarHTML() {
    const personalities = ['friendly', 'professional', 'creative', 'analytical', 'empathetic', 'humorous', 'serious', 'optimistic', 'curious', 'supportive'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    
    let html = '';
    for (let i = 1; i <= 100; i++) {
      const personality = personalities[Math.floor(Math.random() * personalities.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      html += `
        <div class="avatar-card" data-id="${i}" onclick="window.avatarManager.selectAvatar(${i}, '${personality}')" 
             style="
               background: ${color}; 
               border-radius: 12px; 
               padding: 15px; 
               text-align: center; 
               cursor: pointer; 
               transition: transform 0.2s;
               color: white;
               font-weight: bold;
             "
             onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'">
          <div style="font-size: 2rem; margin-bottom: 8px;">🤖</div>
          <div style="font-size: 12px;">Avatar ${i}</div>
          <div style="font-size: 10px; opacity: 0.8;">${personality}</div>
        </div>
      `;
    }
    return html;
  }

  private setupEventListeners() {
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
  }

  public selectAvatar(id: number, personality: string) {
    console.log(`Selected Avatar ${id} with personality: ${personality}`);
    
    this.selectedAvatarId = id;
    
    // Update selected avatar info
    const avatarInfo = document.getElementById('avatarInfo');
    if (avatarInfo) {
      avatarInfo.innerHTML = `
        <h3>🤖 Avatar ${id}</h3>
        <p>Personality: <strong>${personality}</strong></p>
        <p style="color: #666; font-size: 14px;">This avatar will respond based on their ${personality} personality</p>
      `;
    }
    
    // Clear chat and show welcome message
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
      chatArea.innerHTML = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <strong>Avatar ${id}:</strong> Hello! I'm Avatar ${id} and I have a ${personality} personality. How can I help you today?
        </div>
      `;
    }
    
    // Enable chat input
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.placeholder = `Chat with Avatar ${id}...`;
      messageInput.focus();
    }
    if (sendButton) {
      sendButton.disabled = false;
    }
    
    // Highlight selected avatar
    document.querySelectorAll('.avatar-card').forEach(card => {
      (card as HTMLElement).style.border = 'none';
    });
    
    const selectedCard = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
    if (selectedCard) {
      selectedCard.style.border = '3px solid #00ff88';
    }
  }

  public sendMessage() {
    if (!this.selectedAvatarId) return;
    
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    console.log(`Sending message to Avatar ${this.selectedAvatarId}: "${message}"`);
    
    // Add user message to chat
    this.addMessageToChat('You', message, true);
    
    // Clear input
    messageInput.value = '';
    
    // Generate and add avatar response
    setTimeout(() => {
      const response = this.generateResponse(message, this.selectedAvatarId!);
      this.addMessageToChat(`Avatar ${this.selectedAvatarId}`, response, false);
    }, 500);
  }

  private addMessageToChat(sender: string, message: string, isUser: boolean) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      background: ${isUser ? '#00ff88' : '#e3f2fd'};
      color: ${isUser ? 'white' : 'black'};
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      margin-left: ${isUser ? '20%' : '0'};
      margin-right: ${isUser ? '0' : '20%'};
    `;
    
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageDiv);
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  private generateResponse(userMessage: string, avatarId: number): string {
    const responses = [
      `That's interesting! You said "${userMessage}". Let me think about that...`,
      `I understand your point about "${userMessage}". Here's what I think...`,
      `"${userMessage}" - that's a great topic! I'd love to discuss this further.`,
      `Thanks for sharing "${userMessage}" with me. I appreciate your perspective.`,
      `Your message "${userMessage}" really made me think. Here's my response...`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public start() {
    console.log('🚀 Avatar Manager started - 100 AI Avatars ready!');
    
    // Hide loading screen if it exists
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }
}