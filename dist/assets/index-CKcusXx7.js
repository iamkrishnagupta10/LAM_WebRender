var y=Object.defineProperty;var b=(d,e,t)=>e in d?y(d,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[e]=t;var o=(d,e,t)=>b(d,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=t(a);fetch(a.href,s)}})();const w="modulepreload",x=function(d,e){return new URL(d,e).href},g={},A=function(e,t,i){let a=Promise.resolve();if(t&&t.length>0){const r=document.getElementsByTagName("link"),n=document.querySelector("meta[property=csp-nonce]"),h=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));a=Promise.allSettled(t.map(l=>{if(l=x(l,i),l in g)return;g[l]=!0;const u=l.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(!!i)for(let p=r.length-1;p>=0;p--){const m=r[p];if(m.href===l&&(!u||m.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${f}`))return;const c=document.createElement("link");if(c.rel=u?"stylesheet":w,u||(c.as="script"),c.crossOrigin="",c.href=l,h&&c.setAttribute("nonce",h),document.head.appendChild(c),u)return new Promise((p,m)=>{c.addEventListener("load",p),c.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${l}`)))})}))}function s(r){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=r,window.dispatchEvent(n),!n.defaultPrevented)throw r}return a.then(r=>{for(const n of r||[])n.status==="rejected"&&s(n.reason);return e().catch(s)})};class I{constructor(e,t,i={}){o(this,"container");o(this,"assetPath");o(this,"curState","Idle");o(this,"options");o(this,"startTime",0);o(this,"expressionData",{});this.container=e,this.assetPath=t,this.options={width:400,height:400,autoStart:!1,backgroundColor:"#000000",...i},this.init(),this.options.autoStart&&this.start()}init(){if(!this.container)throw new Error("Container element is required");this.options.width&&(this.container.style.width=`${this.options.width}px`),this.options.height&&(this.container.style.height=`${this.options.height}px`),this.container.style.position="relative",this.container.style.background=this.options.backgroundColor||"#000",this.container.style.borderRadius="8px",this.container.style.overflow="hidden"}start(){this.render()}render(){try{this.startTime=performance.now()/1e3,this.container.innerHTML=`
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
      `,this.loadGaussianRenderer().catch(()=>{console.log("Using fallback avatar display")})}catch(e){console.error("Failed to render avatar:",e),this.showError()}}async loadGaussianRenderer(){try{const e=await A(()=>import("./gaussian-splat-renderer-for-lam.module-hPBUDvpJ.js"),[],import.meta.url);if(e&&e.GaussianSplatRenderer){const t=await e.GaussianSplatRenderer.getInstance(this.container,this.assetPath,{getChatState:this.options.getChatState||this.getChatState.bind(this),getExpressionData:this.options.getExpressionData||this.getExpressionData.bind(this),backgroundColor:this.options.backgroundColor||"#000000"});console.log("Gaussian renderer loaded successfully")}}catch(e){throw console.warn("Gaussian renderer not available, using fallback"),e}}showError(){this.container.innerHTML=`
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ff6b6b; text-align: center; font-size: 12px;">
        <div>
          <div>⚠️</div>
          <div style="margin-top: 8px;">Avatar Error</div>
        </div>
      </div>
    `}getChatState(){return this.curState}setState(e){this.curState=e;const t=this.container.querySelector("[data-status]");t&&(t.textContent=e),this.updateVisualState(e)}updateVisualState(e){const i={Idle:"#666",Listening:"#00ff88",Thinking:"#ffa500",Responding:"#ff4757"}[e]||"#666",a=this.container.querySelector('[style*="border"]');a&&(a.style.borderColor=i)}getExpressionData(){const e=(performance.now()/1e3-this.startTime)*2;return{eyeBlinkLeft:Math.sin(e*.1)*.1+.1,eyeBlinkRight:Math.sin(e*.1)*.1+.1,jawOpen:Math.sin(e*.05)*.05+.05,mouthSmileLeft:Math.sin(e*.02)*.3+.3,mouthSmileRight:Math.sin(e*.02)*.3+.3}}destroy(){this.container&&(this.container.innerHTML="")}updateExpressionData(e){this.expressionData=e}setAssetPath(e){this.assetPath=e}getState(){return this.curState}}class E{constructor(e){o(this,"avatars",new Map);o(this,"avatarConfigs",[]);o(this,"selectedAvatarId",null);o(this,"chatContainer");o(this,"avatarGrid");o(this,"chatMessages",[]);this.container=e,this.generateAvatars(),this.createUI()}generateAvatars(){const e=["friendly","professional","creative","analytical","empathetic","humorous","serious","optimistic","curious","supportive"],t=["nlp_xlmr_named-entity-recognition_viet-ecommerce-title","nlp_structbert_word-segmentation_chinese-base","nlp_convbert_text-classification_chinese-base","nlp_roberta_sentiment-classification_english-base"],i=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9"];this.avatarConfigs=Array.from({length:100},(a,s)=>({id:s+1,name:`Avatar_${s+1}`,personality:e[Math.floor(Math.random()*e.length)],modelType:t[Math.floor(Math.random()*t.length)],assetPath:`./asset/avatar_${s%10+1}.zip`,color:i[Math.floor(Math.random()*i.length)],position:{x:s%10*120,y:Math.floor(s/10)*120,z:0}}))}createUI(){this.container.innerHTML=`
      <div class="app-container">
        <div class="header">
          <h1>🤖 100 AI Avatars - Live Chat Room</h1>
          <div class="stats">
            <span id="connectedUsers">Demo Mode</span>
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
    `,this.avatarGrid=document.getElementById("avatarGrid"),this.chatContainer=document.getElementById("chatContainer"),this.setupEventListeners(),this.addStyles(),this.renderAvatarGrid()}setupEventListeners(){const e=document.getElementById("messageInput"),t=document.getElementById("sendButton"),i=document.getElementById("searchAvatars"),a=document.getElementById("filterPersonality");t.addEventListener("click",()=>this.sendMessage()),e.addEventListener("keypress",r=>{r.key==="Enter"&&this.sendMessage()}),i.addEventListener("input",()=>this.filterAvatars()),a.addEventListener("change",()=>this.filterAvatars());const s=document.getElementById("voiceButton");s==null||s.addEventListener("click",()=>{console.log("Voice input coming soon!")})}renderAvatarGrid(){this.avatarGrid.innerHTML="",this.avatarConfigs.forEach(e=>{const t=document.createElement("div");t.className="avatar-card",t.setAttribute("data-id",e.id.toString()),t.setAttribute("data-personality",e.personality),t.innerHTML=`
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
      `,t.addEventListener("click",()=>this.selectAvatar(e.id)),this.avatarGrid.appendChild(t)}),this.updateStats()}selectAvatar(e){this.selectedAvatarId=e;const t=this.avatarConfigs.find(n=>n.id===e);if(!t)return;document.querySelectorAll(".avatar-card").forEach(n=>{n.classList.remove("selected")});const i=document.querySelector(`[data-id="${e}"]`);i==null||i.classList.add("selected");const a=document.getElementById("messageInput"),s=document.getElementById("sendButton"),r=document.getElementById("voiceButton");a.disabled=!1,s.disabled=!1,r.disabled=!1,a.focus(),this.displaySelectedAvatar(t)}displaySelectedAvatar(e){const t=document.getElementById("avatarDisplay"),i=document.getElementById("selectedAvatarInfo");i.innerHTML=`
      <div class="selected-avatar-details">
        <h2>${e.name}</h2>
        <div class="avatar-badges">
          <span class="badge personality">${e.personality}</span>
          <span class="badge model">${e.modelType.split("_")[1]||"AI Model"}</span>
        </div>
      </div>
    `,t.innerHTML=`
      <div class="main-avatar-container" id="mainAvatar">
        <div class="main-avatar-display">
          <div class="avatar-face">🤖</div>
          <div class="avatar-name">${e.name}</div>
          <div class="avatar-status-text" id="mainStatus">Ready to chat</div>
        </div>
      </div>
    `,this.loadMainAvatar(e)}loadMainAvatar(e){const t=document.getElementById("mainAvatar");if(t)try{const i=new I(t,e.assetPath,{width:400,height:400,autoStart:!0});this.avatars.set(`main-${e.id}`,i)}catch(i){console.error(`Failed to load main avatar ${e.id}:`,i)}}sendMessage(){if(!this.selectedAvatarId)return;const e=document.getElementById("messageInput"),t=e.value.trim();if(!t)return;const i=this.avatarConfigs.find(s=>s.id===this.selectedAvatarId);if(!i)return;const a={avatarId:this.selectedAvatarId,avatarName:"You",message:t,timestamp:new Date().toISOString(),messageId:`user-${Date.now()}`,isUser:!0};this.addChatMessage(a),e.value="",this.simulateAvatarResponse(i,t)}simulateAvatarResponse(e,t){this.updateAvatarState(e.id,"Listening"),setTimeout(()=>{this.updateAvatarState(e.id,"Thinking"),setTimeout(()=>{this.updateAvatarState(e.id,"Responding");const i=this.generateResponse(t,e.personality),a={avatarId:e.id,avatarName:e.name,message:i,timestamp:new Date().toISOString(),messageId:`avatar-${Date.now()}`};this.addChatMessage(a),setTimeout(()=>{this.updateAvatarState(e.id,"Idle")},2e3)},1500)},500)}generateResponse(e,t){return{friendly:`Hi there! I heard you say "${e}". That's really interesting! How can I help you today?`,professional:`Thank you for your message: "${e}". I'm here to assist you with any questions you may have.`,creative:`Wow, "${e}" - that sparks so many creative ideas! Let me think of something amazing to share with you.`,analytical:`I've processed your input: "${e}". Based on my analysis, here are some insights I can provide.`,empathetic:`I understand you mentioned "${e}". I can sense this might be important to you. I'm here to listen.`,humorous:`Haha, "${e}" - you know what? That reminds me of something funny! Let me brighten your day.`,serious:`Regarding your statement "${e}", I want to provide you with a thoughtful and comprehensive response.`,optimistic:`"${e}" - what a wonderful thing to share! I'm excited to explore this topic with you further.`,curious:`"${e}" - now that's fascinating! I have so many questions about this. Tell me more!`,supportive:`I appreciate you sharing "${e}" with me. I want you to know that I'm here to support you.`}[t]||`Thank you for saying "${e}". I'm here to chat with you!`}updateAvatarState(e,t){const i=document.getElementById(`status-${e}`);i&&(i.className=`avatar-status ${t.toLowerCase()}`);const a=document.getElementById("mainStatus");a&&this.selectedAvatarId===e&&(a.textContent=t);const s=this.avatars.get(`main-${e}`);s&&this.selectedAvatarId===e&&s.setState(t)}addChatMessage(e){this.chatMessages.push(e);const t=document.createElement("div");t.className=`chat-message ${e.isUser?"user-message":"avatar-message"}`,t.innerHTML=`
      <div class="message-header">
        <span class="sender">${e.avatarName}</span>
        <span class="timestamp">${new Date(e.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${e.message}</div>
    `,this.chatContainer.appendChild(t),this.chatContainer.scrollTop=this.chatContainer.scrollHeight,e.isUser||(t.classList.add("typing"),setTimeout(()=>{t.classList.remove("typing")},1e3))}filterAvatars(){const e=document.getElementById("searchAvatars").value.toLowerCase(),t=document.getElementById("filterPersonality").value;document.querySelectorAll(".avatar-card").forEach(i=>{const a=i,s=parseInt(a.getAttribute("data-id")),r=this.avatarConfigs.find(l=>l.id===s);if(!r)return;const n=r.name.toLowerCase().includes(e)||r.personality.toLowerCase().includes(e)||r.modelType.toLowerCase().includes(e),h=!t||r.personality===t;a.style.display=n&&h?"block":"none"})}updateStats(){const e=this.avatarConfigs.length,t=document.getElementById("activeAvatars");t&&(t.textContent=`Total Avatars: ${e}`)}addStyles(){const e=document.createElement("style");e.textContent=`
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
      }

      .avatar-status.idle { background: #666; }
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
        font-size: 2rem;
      }

      .avatar-icon {
        font-size: 2rem;
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
        color: white;
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

      .main-avatar-display {
        text-align: center;
        color: white;
      }

      .avatar-face {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .avatar-name {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .avatar-status-text {
        font-size: 0.9rem;
        opacity: 0.8;
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
    `,document.head.appendChild(e)}start(){console.log("🚀 Avatar Manager started - 100 AI Avatars ready!")}}const v=document.getElementById("LAM_WebRender");v?(new E(v).start(),console.log("🚀 Starting 100 AI Avatars with ModelScope integration...")):console.error("Container element not found!");
