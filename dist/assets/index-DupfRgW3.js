var x=Object.defineProperty;var I=(i,e,t)=>e in i?x(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var d=(i,e,t)=>I(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const k="modulepreload",A=function(i,e){return new URL(i,e).href},b={},$=function(e,t,a){let r=Promise.resolve();if(t&&t.length>0){const n=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),u=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));r=Promise.allSettled(t.map(l=>{if(l=A(l,a),l in b)return;b[l]=!0;const p=l.endsWith(".css"),v=p?'[rel="stylesheet"]':"";if(!!a)for(let m=n.length-1;m>=0;m--){const h=n[m];if(h.href===l&&(!p||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${v}`))return;const c=document.createElement("link");if(c.rel=p?"stylesheet":k,p||(c.as="script"),c.crossOrigin="",c.href=l,u&&c.setAttribute("nonce",u),document.head.appendChild(c),p)return new Promise((m,h)=>{c.addEventListener("load",m),c.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${l}`)))})}))}function o(n){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=n,window.dispatchEvent(s),!s.defaultPrevented)throw n}return r.then(n=>{for(const s of n||[])s.status==="rejected"&&o(s.reason);return e().catch(o)})};class E{constructor(e,t,a={}){d(this,"container");d(this,"assetPath");d(this,"curState","Idle");d(this,"options");d(this,"startTime",0);d(this,"expressionData",{});this.container=e,this.assetPath=t,this.options={width:400,height:400,autoStart:!1,backgroundColor:"#000000",...a},this.init(),this.options.autoStart&&this.start()}init(){if(!this.container)throw new Error("Container element is required");this.options.width&&(this.container.style.width=`${this.options.width}px`),this.options.height&&(this.container.style.height=`${this.options.height}px`),this.container.style.position="relative",this.container.style.background=this.options.backgroundColor||"#000",this.container.style.borderRadius="8px",this.container.style.overflow="hidden"}start(){this.render()}render(){try{this.startTime=performance.now()/1e3,this.container.innerHTML=`
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
          <div style="width: 60px; height: 60px; border: 3px solid #00ff88; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin-bottom: 10px;"></div>
          <div style="text-align: center; font-size: 12px; opacity: 0.8;">
            <div>AI Avatar</div>
            <div style="margin-top: 4px; font-size: 10px;">${this.curState}</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `,this.loadGaussianRenderer().catch(()=>{console.log("Using fallback avatar display")})}catch(e){console.error("Failed to render avatar:",e),this.showError()}}async loadGaussianRenderer(){try{const e=await $(()=>import("./gaussian-splat-renderer-for-lam.module-hPBUDvpJ.js"),[],import.meta.url);if(e&&e.GaussianSplatRenderer){const t=await e.GaussianSplatRenderer.getInstance(this.container,this.assetPath,{getChatState:this.options.getChatState||this.getChatState.bind(this),getExpressionData:this.options.getExpressionData||this.getExpressionData.bind(this),backgroundColor:this.options.backgroundColor||"#000000"});console.log("Gaussian renderer loaded successfully")}}catch(e){throw console.warn("Gaussian renderer not available, using fallback"),e}}showError(){this.container.innerHTML=`
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ff6b6b; text-align: center; font-size: 12px;">
        <div>
          <div>⚠️</div>
          <div style="margin-top: 8px;">Avatar Error</div>
        </div>
      </div>
    `}getChatState(){return this.curState}setState(e){this.curState=e;const t=this.container.querySelector("[data-status]");t&&(t.textContent=e),this.updateVisualState(e)}updateVisualState(e){const a={Idle:"#666",Listening:"#00ff88",Thinking:"#ffa500",Responding:"#ff4757"}[e]||"#666",r=this.container.querySelector('[style*="border"]');r&&(r.style.borderColor=a)}getExpressionData(){const e=(performance.now()/1e3-this.startTime)*2;return{eyeBlinkLeft:Math.sin(e*.1)*.1+.1,eyeBlinkRight:Math.sin(e*.1)*.1+.1,jawOpen:Math.sin(e*.05)*.05+.05,mouthSmileLeft:Math.sin(e*.02)*.3+.3,mouthSmileRight:Math.sin(e*.02)*.3+.3}}destroy(){this.container&&(this.container.innerHTML="")}updateExpressionData(e){this.expressionData=e}setAssetPath(e){this.assetPath=e}getState(){return this.curState}}class y{constructor(e){d(this,"avatars",new Map);d(this,"avatarConfigs",[]);d(this,"selectedAvatarId",null);d(this,"chatContainer");d(this,"avatarGrid");d(this,"chatMessages",[]);this.container=e,console.log("🏗️ Initializing AvatarManager...");try{this.generateAvatars(),console.log(`✅ Generated ${this.avatarConfigs.length} avatars`),this.createUI(),console.log("✅ UI created successfully")}catch(t){throw console.error("❌ Error in AvatarManager constructor:",t),t}}generateAvatars(){console.log("🎭 Generating avatar configurations...");const e=["friendly","professional","creative","analytical","empathetic","humorous","serious","optimistic","curious","supportive"],t=["nlp_xlmr_named-entity-recognition_viet-ecommerce-title","nlp_structbert_word-segmentation_chinese-base","nlp_convbert_text-classification_chinese-base","nlp_roberta_sentiment-classification_english-base"],a=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9"];this.avatarConfigs=Array.from({length:100},(r,o)=>({id:o+1,name:`Avatar_${o+1}`,personality:e[Math.floor(Math.random()*e.length)],modelType:t[Math.floor(Math.random()*t.length)],assetPath:`./asset/avatar_${o%10+1}.zip`,color:a[Math.floor(Math.random()*a.length)],position:{x:o%10*120,y:Math.floor(o/10)*120,z:0}})),console.log(`🎯 Created ${this.avatarConfigs.length} avatar configurations`)}createUI(){if(console.log("🎨 Creating user interface..."),!this.container)throw new Error("Container element is required");if(this.container.innerHTML=`
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
    `,this.avatarGrid=document.getElementById("avatarGrid"),this.chatContainer=document.getElementById("chatContainer"),!this.avatarGrid||!this.chatContainer)throw new Error("Required UI elements not found");console.log("🎛️ Setting up event listeners..."),this.setupEventListeners(),console.log("🎨 Adding styles..."),this.addStyles(),console.log("🎭 Rendering avatar grid..."),this.renderAvatarGrid()}setupEventListeners(){try{const e=document.getElementById("messageInput"),t=document.getElementById("sendButton"),a=document.getElementById("searchAvatars"),r=document.getElementById("filterPersonality");e&&t&&(t.addEventListener("click",()=>this.sendMessage()),e.addEventListener("keypress",n=>{n.key==="Enter"&&this.sendMessage()})),a&&a.addEventListener("input",()=>this.filterAvatars()),r&&r.addEventListener("change",()=>this.filterAvatars());const o=document.getElementById("voiceButton");o&&o.addEventListener("click",()=>{alert("🎤 Voice input feature coming soon! For now, please type your messages.")}),console.log("✅ Event listeners set up successfully")}catch(e){console.error("❌ Error setting up event listeners:",e)}}renderAvatarGrid(){if(console.log("🎭 Rendering avatar grid..."),!this.avatarGrid){console.error("❌ Avatar grid element not found");return}if(this.avatarGrid.innerHTML="",this.avatarConfigs.length===0){this.avatarGrid.innerHTML='<div class="error-message">No avatars available</div>';return}this.avatarConfigs.forEach((e,t)=>{try{const a=document.createElement("div");a.className="avatar-card",a.setAttribute("data-id",e.id.toString()),a.setAttribute("data-personality",e.personality),a.innerHTML=`
          <div class="avatar-preview" style="background: linear-gradient(45deg, ${e.color}, ${e.color}80);">
            <div class="avatar-status idle" id="status-${e.id}"></div>
            <div class="avatar-mini" id="mini-${e.id}">
              <div class="avatar-icon">🤖</div>
            </div>
          </div>
          <div class="avatar-info">
            <h3>${e.name}</h3>
            <p class="personality">${e.personality}</p>
            <p class="model">${e.modelType.split("_")[1]||"AI Model"}</p>
          </div>
        `,a.addEventListener("click",()=>{console.log(`🎯 Avatar ${e.id} selected: ${e.name}`),this.selectAvatar(e.id)}),this.avatarGrid.appendChild(a),(t+1)%20===0&&console.log(`📊 Rendered ${t+1}/${this.avatarConfigs.length} avatars`)}catch(a){console.error(`❌ Error rendering avatar ${e.id}:`,a)}}),this.updateStats(),console.log(`✅ Successfully rendered ${this.avatarConfigs.length} avatars`)}selectAvatar(e){console.log(`🎯 Selecting avatar ${e}...`),this.selectedAvatarId=e;const t=this.avatarConfigs.find(u=>u.id===e);if(!t){console.error(`❌ Avatar ${e} not found`);return}document.querySelectorAll(".avatar-card").forEach(u=>{u.classList.remove("selected")});const a=document.querySelector(`[data-id="${e}"]`);a&&(a.classList.add("selected"),a.scrollIntoView({behavior:"smooth",block:"center"}));const r=document.getElementById("messageInput"),o=document.getElementById("sendButton"),n=document.getElementById("voiceButton");r&&(r.disabled=!1,r.placeholder=`Chat with ${t.name} (${t.personality})...`,r.focus()),o&&(o.disabled=!1),n&&(n.disabled=!1),this.displaySelectedAvatar(t);const s=document.querySelector(".welcome-chat");s&&s.remove(),console.log(`✅ Avatar ${t.name} selected successfully`)}displaySelectedAvatar(e){const t=document.getElementById("avatarDisplay"),a=document.getElementById("selectedAvatarInfo");a.innerHTML=`
      <div class="selected-avatar-details">
        <h2>${e.name} 🤖</h2>
        <div class="avatar-badges">
          <span class="badge personality">${e.personality}</span>
          <span class="badge model">${e.modelType.split("_")[1]||"AI Model"}</span>
        </div>
        <p class="avatar-description">This avatar has a <strong>${e.personality}</strong> personality and will respond to your messages accordingly.</p>
      </div>
    `,t.innerHTML=`
      <div class="main-avatar-container" id="mainAvatar">
        <div class="main-avatar-display" style="background: linear-gradient(135deg, ${e.color}, ${e.color}40);">
          <div class="avatar-face">🤖</div>
          <div class="avatar-name">${e.name}</div>
          <div class="avatar-personality">${e.personality.toUpperCase()}</div>
          <div class="avatar-status-text" id="mainStatus">Ready to chat!</div>
        </div>
      </div>
    `,this.loadMainAvatar(e)}loadMainAvatar(e){const t=document.getElementById("mainAvatar");if(t)try{const a=new E(t,e.assetPath,{width:400,height:400,autoStart:!0});this.avatars.set(`main-${e.id}`,a),console.log(`✅ Enhanced avatar loaded for ${e.name}`)}catch(a){console.warn(`⚠️ Enhanced avatar failed for ${e.name}, using fallback:`,a)}}sendMessage(){if(!this.selectedAvatarId){alert("Please select an avatar first!");return}const e=document.getElementById("messageInput"),t=e.value.trim();if(!t){alert("Please enter a message!");return}const a=this.avatarConfigs.find(o=>o.id===this.selectedAvatarId);if(!a)return;console.log(`💬 Sending message to ${a.name}: "${t}"`);const r={avatarId:this.selectedAvatarId,avatarName:"You",message:t,timestamp:new Date().toISOString(),messageId:`user-${Date.now()}`,isUser:!0};this.addChatMessage(r),e.value="",this.simulateAvatarResponse(a,t)}simulateAvatarResponse(e,t){console.log(`🤖 ${e.name} is responding to: "${t}"`),this.updateAvatarState(e.id,"Listening"),setTimeout(()=>{this.updateAvatarState(e.id,"Thinking"),setTimeout(()=>{this.updateAvatarState(e.id,"Responding");const a=this.generateResponse(t,e.personality),r={avatarId:e.id,avatarName:e.name,message:a,timestamp:new Date().toISOString(),messageId:`avatar-${Date.now()}`};this.addChatMessage(r),setTimeout(()=>{this.updateAvatarState(e.id,"Idle")},2e3)},1e3+Math.random()*2e3)},300)}generateResponse(e,t){const r={friendly:[`Hi there! I love what you said: "${e}". That's really interesting! How can I help you today?`,`Hey! "${e}" - that's so cool to hear! I'm excited to chat with you more about this!`,`What a wonderful message: "${e}"! I'm here to help and would love to know more about what you're thinking.`],professional:[`Thank you for your message: "${e}". I'm here to assist you with any questions you may have.`,`I appreciate your input regarding "${e}". Let me provide you with a comprehensive response.`,`Your point about "${e}" is well taken. I'm prepared to offer professional guidance on this matter.`],creative:[`Wow, "${e}" - that sparks so many creative ideas! Let me think of something amazing to share with you.`,`"${e}" - now that's inspiring! It makes me think of art, innovation, and endless possibilities!`,`Your words "${e}" just lit up my creative circuits! I'm seeing colors, patterns, and new ideas everywhere!`],analytical:[`I've processed your input: "${e}". Based on my analysis, here are some insights I can provide.`,`Analyzing "${e}"... I see several interesting patterns and logical connections here.`,`Your statement "${e}" presents fascinating data points. Let me break this down systematically.`],empathetic:[`I understand you mentioned "${e}". I can sense this might be important to you. I'm here to listen.`,`Thank you for sharing "${e}" with me. I want you to know that I hear you and I care about what you're feeling.`,`Your words "${e}" really resonate with me. I can feel the emotion behind them, and I'm here to support you.`],humorous:[`Haha, "${e}" - you know what? That reminds me of something funny! Let me brighten your day.`,`"${e}" - now that's comedy gold! 😄 You've got quite the sense of humor! This is going to be fun!`,`Oh my, "${e}" - that just made me chuckle! You know what they say... laughter is the best medicine!`],serious:[`Regarding your statement "${e}", I want to provide you with a thoughtful and comprehensive response.`,`"${e}" - this is indeed a serious matter that deserves careful consideration and respect.`,`I take your message "${e}" very seriously and want to give you the attention and response it deserves.`],optimistic:[`"${e}" - what a wonderful thing to share! I'm excited to explore this topic with you further.`,`Your message "${e}" just filled me with positive energy! The future looks bright when we think about this!`,`I love your perspective on "${e}"! It's amazing how every challenge can become an opportunity!`],curious:[`"${e}" - now that's fascinating! I have so many questions about this. Tell me more!`,`Wow, "${e}" really makes me wonder... there's so much to explore here! What else can you tell me?`,`Your point about "${e}" is intriguing! I'm curious to dive deeper - what led you to think about this?`],supportive:[`I appreciate you sharing "${e}" with me. I want you to know that I'm here to support you.`,`Thank you for trusting me with "${e}". Whatever you're going through, you don't have to face it alone.`,`Your message "${e}" shows real courage. I believe in you and I'm here to help however I can.`]}[t];return r&&r.length>0?r[Math.floor(Math.random()*r.length)]:`Thank you for saying "${e}". I'm here to chat with you!`}updateAvatarState(e,t){const a=document.getElementById(`status-${e}`);a&&(a.className=`avatar-status ${t.toLowerCase()}`);const r=document.getElementById("mainStatus");if(r&&this.selectedAvatarId===e){const n={Idle:"Ready to chat!",Listening:"👂 Listening...",Thinking:"🤔 Thinking...",Responding:"💭 Responding..."};r.textContent=n[t]||t}const o=this.avatars.get(`main-${e}`);o&&this.selectedAvatarId===e&&o.setState(t)}addChatMessage(e){this.chatMessages.push(e);const t=document.createElement("div");t.className=`chat-message ${e.isUser?"user-message":"avatar-message"}`,t.innerHTML=`
      <div class="message-header">
        <span class="sender">${e.avatarName}</span>
        <span class="timestamp">${new Date(e.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${e.message}</div>
    `,this.chatContainer.appendChild(t),this.chatContainer.scrollTop=this.chatContainer.scrollHeight,e.isUser||(t.classList.add("typing"),setTimeout(()=>{t.classList.remove("typing")},1e3))}filterAvatars(){var r,o;const e=((r=document.getElementById("searchAvatars"))==null?void 0:r.value.toLowerCase())||"",t=((o=document.getElementById("filterPersonality"))==null?void 0:o.value)||"";let a=0;document.querySelectorAll(".avatar-card").forEach(n=>{const s=n,u=parseInt(s.getAttribute("data-id")),l=this.avatarConfigs.find(c=>c.id===u);if(!l)return;const p=l.name.toLowerCase().includes(e)||l.personality.toLowerCase().includes(e)||l.modelType.toLowerCase().includes(e),v=!t||l.personality===t,f=p&&v;s.style.display=f?"block":"none",f&&a++}),console.log(`🔍 Filtered: ${a}/${this.avatarConfigs.length} avatars visible`)}updateStats(){const e=document.getElementById("activeAvatars");e&&(e.textContent=`${this.avatarConfigs.length} Avatars Ready!`)}addStyles(){if(document.querySelector("#avatar-styles"))return;const e=document.createElement("style");e.id="avatar-styles",e.textContent=`
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
    `,document.head.appendChild(e),console.log("✅ Styles added successfully")}start(){console.log("🚀 Avatar Manager started - 100 AI Avatars ready!"),console.log("📊 Avatar configurations loaded:",this.avatarConfigs.length),console.log("🎨 UI initialized successfully"),console.log("✨ Ready for user interaction!"),typeof window<"u"&&window.hideLoadingScreen&&setTimeout(()=>{window.hideLoadingScreen()},500)}}window.addEventListener("error",i=>{console.error("Global error:",i.error)});window.addEventListener("unhandledrejection",i=>{console.error("Unhandled promise rejection:",i.reason)});function g(){console.log("🚀 Initializing 100 AI Avatars application...");const i=document.getElementById("LAM_WebRender");if(!i){console.error('❌ Container element "LAM_WebRender" not found!'),w();return}try{console.log("✅ Container found, creating AvatarManager..."),new y(i).start(),console.log("🎉 Application initialized successfully!")}catch(e){console.error("❌ Error initializing application:",e),S(i,e)}}function w(){document.body.innerHTML=`
    <div id="LAM_WebRender" style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h1 style="margin-bottom: 1rem;">🤖 100 AI Avatars</h1>
      <p>Initializing application...</p>
      <button onclick="location.reload()" style="
        margin-top: 2rem;
        padding: 1rem 2rem;
        background: #00ff88;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
      ">
        Reload Application
      </button>
    </div>
  `,setTimeout(()=>{const i=document.getElementById("LAM_WebRender");if(i)try{new y(i).start()}catch(e){console.error("Fallback initialization failed:",e)}},1e3)}function S(i,e){i.innerHTML=`
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h1 style="margin-bottom: 1rem;">🤖 100 AI Avatars</h1>
      <p style="margin-bottom: 1rem;">Application failed to load properly.</p>
      <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 2rem;">Error: ${e.message}</p>
      <button onclick="location.reload()" style="
        padding: 1rem 2rem;
        background: #00ff88;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        margin-bottom: 1rem;
      ">
        Reload Page
      </button>
      <button onclick="console.clear(); window.initializeApp()" style="
        padding: 1rem 2rem;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
      ">
        Retry Initialization
      </button>
    </div>
  `}window.initializeApp=g;window.AvatarManager=y;document.readyState==="loading"?(console.log("📄 Document loading, waiting for DOMContentLoaded..."),document.addEventListener("DOMContentLoaded",g)):(console.log("📄 Document already loaded, initializing immediately..."),g());setTimeout(()=>{const i=document.getElementById("LAM_WebRender");i&&!i.hasChildNodes()&&(console.log("🔄 Running fallback initialization..."),g())},2e3);setTimeout(()=>{const i=document.getElementById("LAM_WebRender");i&&(!i.innerHTML||i.innerHTML.trim()==="")&&(console.log("🚨 Emergency fallback initialization..."),w())},5e3);
