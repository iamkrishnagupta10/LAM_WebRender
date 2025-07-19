var p=Object.defineProperty;var g=(n,e,a)=>e in n?p(n,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):n[e]=a;var i=(n,e,a)=>g(n,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=a(t);fetch(t.href,r)}})();class u{constructor(e){i(this,"selectedAvatarId",null);i(this,"chatMessages",[]);this.container=e,console.log("Creating avatar manager..."),this.createApp()}createApp(){this.container.innerHTML=`
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
    `,this.setupEventListeners(),console.log("✅ 100 avatars created and ready!")}generateAvatarHTML(){const e=["friendly","professional","creative","analytical","empathetic","humorous","serious","optimistic","curious","supportive"],a=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9"];let o="";for(let t=1;t<=100;t++){const r=e[Math.floor(Math.random()*e.length)],s=a[Math.floor(Math.random()*a.length)];o+=`
        <div class="avatar-card" data-id="${t}" onclick="window.avatarManager.selectAvatar(${t}, '${r}')" 
             style="
               background: ${s}; 
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
          <div style="font-size: 12px;">Avatar ${t}</div>
          <div style="font-size: 10px; opacity: 0.8;">${r}</div>
        </div>
      `}return o}setupEventListeners(){const e=document.getElementById("messageInput");e&&e.addEventListener("keypress",a=>{a.key==="Enter"&&this.sendMessage()})}selectAvatar(e,a){console.log(`Selected Avatar ${e} with personality: ${a}`),this.selectedAvatarId=e;const o=document.getElementById("avatarInfo");o&&(o.innerHTML=`
        <h3>🤖 Avatar ${e}</h3>
        <p>Personality: <strong>${a}</strong></p>
        <p style="color: #666; font-size: 14px;">This avatar will respond based on their ${a} personality</p>
      `);const t=document.getElementById("chatArea");t&&(t.innerHTML=`
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <strong>Avatar ${e}:</strong> Hello! I'm Avatar ${e} and I have a ${a} personality. How can I help you today?
        </div>
      `);const r=document.getElementById("messageInput"),s=document.getElementById("sendButton");r&&(r.disabled=!1,r.placeholder=`Chat with Avatar ${e}...`,r.focus()),s&&(s.disabled=!1),document.querySelectorAll(".avatar-card").forEach(c=>{c.style.border="none"});const d=document.querySelector(`[data-id="${e}"]`);d&&(d.style.border="3px solid #00ff88")}sendMessage(){if(!this.selectedAvatarId)return;const e=document.getElementById("messageInput"),a=e.value.trim();a&&(console.log(`Sending message to Avatar ${this.selectedAvatarId}: "${a}"`),this.addMessageToChat("You",a,!0),e.value="",setTimeout(()=>{const o=this.generateResponse(a,this.selectedAvatarId);this.addMessageToChat(`Avatar ${this.selectedAvatarId}`,o,!1)},500))}addMessageToChat(e,a,o){const t=document.getElementById("chatArea");if(!t)return;const r=document.createElement("div");r.style.cssText=`
      background: ${o?"#00ff88":"#e3f2fd"};
      color: ${o?"white":"black"};
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      margin-left: ${o?"20%":"0"};
      margin-right: ${o?"0":"20%"};
    `,r.innerHTML=`<strong>${e}:</strong> ${a}`,t.appendChild(r),t.scrollTop=t.scrollHeight}generateResponse(e,a){const o=[`That's interesting! You said "${e}". Let me think about that...`,`I understand your point about "${e}". Here's what I think...`,`"${e}" - that's a great topic! I'd love to discuss this further.`,`Thanks for sharing "${e}" with me. I appreciate your perspective.`,`Your message "${e}" really made me think. Here's my response...`];return o[Math.floor(Math.random()*o.length)]}start(){console.log("🚀 Avatar Manager started - 100 AI Avatars ready!");const e=document.getElementById("loadingScreen");e&&setTimeout(()=>{e.style.display="none"},500)}}console.log("🚀 Starting 100 AI Avatars...");function l(){const n=document.getElementById("LAM_WebRender");if(!n){console.error("Container not found!");return}console.log("Container found, creating avatars...");try{const e=new u(n);window.avatarManager=e,e.start();const a=document.getElementById("loadingScreen");a&&setTimeout(()=>{a.style.display="none"},1e3),console.log("✅ 100 AI Avatars loaded successfully!")}catch(e){console.error("❌ Error loading avatars:",e),n.innerHTML=`
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; padding: 2rem;">
        <h1>🤖 100 AI Avatars</h1>
        <p style="margin: 1rem 0;">Error loading application: ${e.message}</p>
        <button onclick="location.reload()" style="padding: 1rem 2rem; background: #00ff88; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l();
