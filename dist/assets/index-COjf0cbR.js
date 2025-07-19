var y=Object.defineProperty;var w=(o,e,t)=>e in o?y(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var l=(o,e,t)=>w(o,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const b="modulepreload",x=function(o,e){return new URL(o,e).href},f={},L=function(e,t,a){let i=Promise.resolve();if(t&&t.length>0){const s=document.getElementsByTagName("link"),n=document.querySelector("meta[property=csp-nonce]"),u=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));i=Promise.allSettled(t.map(d=>{if(d=x(d,a),d in f)return;f[d]=!0;const g=d.endsWith(".css"),m=g?'[rel="stylesheet"]':"";if(!!a)for(let p=s.length-1;p>=0;p--){const v=s[p];if(v.href===d&&(!g||v.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${m}`))return;const c=document.createElement("link");if(c.rel=g?"stylesheet":b,g||(c.as="script"),c.crossOrigin="",c.href=d,u&&c.setAttribute("nonce",u),document.head.appendChild(c),g)return new Promise((p,v)=>{c.addEventListener("load",p),c.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${d}`)))})}))}function r(s){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=s,window.dispatchEvent(n),!n.defaultPrevented)throw s}return i.then(s=>{for(const n of s||[])n.status==="rejected"&&r(n.reason);return e().catch(r)})};let h=null;try{h=require("gaussian-splat-renderer-for-lam")}catch{try{L(()=>import("./gaussian-splat-renderer-for-lam.module-hPBUDvpJ.js"),[],import.meta.url).then(e=>{h=e}).catch(()=>{console.warn("⚠️ gaussian-splat-renderer-for-lam not available, using fallback renderer")})}catch{console.warn("⚠️ gaussian-splat-renderer-for-lam not available, using fallback renderer")}}class A{constructor(e,t,a={}){l(this,"container");l(this,"assetPath");l(this,"curState","Idle");l(this,"options");l(this,"startTime",0);l(this,"expressionData",{});l(this,"renderer",null);l(this,"scene",null);l(this,"viewer",null);this.container=e,this.assetPath=t,this.options={width:400,height:400,autoStart:!1,backgroundColor:"#000000",...a},this.init(),this.options.autoStart&&this.start()}init(){if(!this.container)throw new Error("Container element is required");this.options.width&&(this.container.style.width=`${this.options.width}px`),this.options.height&&(this.container.style.height=`${this.options.height}px`),this.container.style.position="relative",this.container.style.background=this.options.backgroundColor||"#000",this.container.style.borderRadius="8px",this.container.style.overflow="hidden"}async start(){try{await this.initializeGaussianRenderer()}catch(e){console.error("Failed to initialize Gaussian renderer:",e),this.showSimpleRenderer()}}async initializeGaussianRenderer(){try{if(console.log("🚀 Initializing LAM Gaussian Splat Renderer..."),this.showLoading(),!h)throw new Error("Gaussian Splat Renderer not available");const e=h.DropboxViewer||h.Viewer||h.GaussianSplatViewer||h.default||h;if(typeof e=="function"){this.viewer=new e({container:this.container,width:this.options.width||120,height:this.options.height||120,backgroundColor:this.options.backgroundColor||"#000000"});const t=this.assetPath||"./asset/test_expression_1s.json";this.viewer.loadGaussianSplat?await this.viewer.loadGaussianSplat(t):this.viewer.loadAsset&&await this.viewer.loadAsset(t),console.log("✅ LAM Gaussian Splat Renderer initialized successfully"),this.hideLoading(),this.startRenderLoop()}else throw new Error("No suitable viewer class found in Gaussian Splat Renderer")}catch(e){console.error("Failed to initialize Gaussian renderer:",e),this.showSimpleRenderer()}}showSimpleRenderer(){console.log("🎭 Using simple 3D avatar renderer..."),this.container.innerHTML=`
      <div class="avatar-container" style="width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; overflow: hidden;">
        <canvas id="avatar-canvas-${Math.random().toString(36).substr(2,9)}" width="${this.options.width}" height="${this.options.height}" style="width: 100%; height: 100%; display: block;"></canvas>
        <div class="avatar-info" style="position: absolute; bottom: 10px; left: 10px; color: white; font-size: 12px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 15px;">
          <div>AI Avatar #${Math.floor(Math.random()*100)+1}</div>
          <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">${this.curState}</div>
        </div>
      </div>
    `,this.initSimple3D()}initSimple3D(){const e=this.container.querySelector("canvas");if(!e)return;const t=e.getContext("2d");if(!t)return;let a=0;const i=()=>{t.clearRect(0,0,e.width,e.height);const r=e.width/2,s=e.height/2,n=a*.05;t.beginPath(),t.arc(r,s-40+Math.sin(n)*2,30,0,Math.PI*2),t.fillStyle=`rgba(255, 255, 255, ${.8+Math.sin(n*2)*.1})`,t.fill(),t.beginPath(),t.ellipse(r,s+20,25,40,0,0,Math.PI*2),t.fillStyle="rgba(255, 255, 255, 0.6)",t.fill(),t.beginPath(),t.arc(r-35,s+Math.sin(n*1.5)*5,8,0,Math.PI*2),t.arc(r+35,s+Math.sin(n*1.5+Math.PI)*5,8,0,Math.PI*2),t.fill(),a++,requestAnimationFrame(i)};i()}startRenderLoop(){if(!this.viewer)return;const e=()=>{this.viewer&&this.viewer.render&&this.viewer.render(),requestAnimationFrame(e)};e()}showLoading(){this.container.innerHTML=`
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
        <div style="text-align: center; font-size: 12px;">
          <div>Loading LAM Avatar...</div>
          <div style="margin-top: 5px; font-size: 10px; opacity: 0.8;">Initializing Renderer</div>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `}hideLoading(){console.log("Loading complete")}getChatState(){return this.curState}setState(e){this.curState=e;const t=this.container.querySelector(".avatar-info");if(t){const a=t.querySelector("div:last-child");a&&(a.textContent=e)}this.updateVisualState(e)}updateVisualState(e){const a={Idle:"#667eea",Listening:"#00ff88",Thinking:"#ffa500",Responding:"#ff6b6b"}[e]||"#667eea";this.container.style.background.includes("linear-gradient")&&(this.container.style.background=`linear-gradient(135deg, ${a} 0%, #764ba2 100%)`)}getExpressionData(){return this.expressionData}setExpressionData(e){this.expressionData=e,this.viewer&&this.viewer.setExpression&&this.viewer.setExpression(e)}destroy(){this.viewer&&this.viewer.destroy&&this.viewer.destroy(),this.container.innerHTML=""}}class S{constructor(){l(this,"avatars",[]);l(this,"mainContainer");l(this,"chatContainer",null);l(this,"currentChatAvatar",null);this.mainContainer=document.getElementById("LAM_WebRender")||document.body,this.initialize()}async initialize(){console.log("🚀 Initializing LAM Avatar Manager..."),this.createMainLayout(),await this.createAvatars(),this.hideLoadingScreen(),console.log("✅ LAM Avatar Manager initialized with 100 avatars")}createMainLayout(){this.mainContainer.innerHTML=`
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
    `,this.setupChatInterface()}async createAvatars(){const e=document.getElementById("avatar-grid");if(!e)return;const t=["Friendly","Professional","Creative","Analytical","Enthusiastic","Calm","Energetic","Wise","Playful","Mysterious"],a=["LAM-Base-v1","LAM-Enhanced-v2","LAM-Creative-v1","LAM-Pro-v2"];for(let i=0;i<100;i++){const r=t[i%t.length],s=a[i%a.length],n={id:i+1,name:`Avatar ${i+1}`,personality:r,model:s,state:"Idle",container:document.createElement("div"),avatar:null};n.container.style.cssText=`
        width: 120px;
        height: 120px;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
        overflow: hidden;
      `,n.container.addEventListener("mouseenter",()=>{n.container.style.transform="scale(1.05)"}),n.container.addEventListener("mouseleave",()=>{n.container.style.transform="scale(1)"}),n.container.addEventListener("click",()=>{this.openChat(n)});const u=document.createElement("div");u.style.cssText=`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px;
        font-size: 10px;
        text-align: center;
      `,u.innerHTML=`
        <div>${n.name}</div>
        <div style="opacity: 0.8;">${r}</div>
      `,n.container.appendChild(u);try{n.avatar=new A(n.container,`./asset/avatar_${i+1}.json`,{width:120,height:120,backgroundColor:"#000",autoStart:!0}),console.log(`✅ Avatar ${i+1} initialized`)}catch(d){console.warn(`⚠️ Failed to initialize Avatar ${i+1}:`,d)}this.avatars.push(n),e.appendChild(n.container),i%10===9&&await new Promise(d=>setTimeout(d,50))}}setupChatInterface(){const e=document.getElementById("close-chat"),t=document.getElementById("send-message"),a=document.getElementById("chat-input");e==null||e.addEventListener("click",()=>this.closeChat()),t==null||t.addEventListener("click",()=>this.sendMessage()),a==null||a.addEventListener("keypress",i=>{i.key==="Enter"&&this.sendMessage()})}openChat(e){this.currentChatAvatar=e;const t=document.getElementById("chat-interface"),a=document.getElementById("chat-title"),i=document.getElementById("chat-messages");t&&a&&i&&(a.textContent=`Chat with ${e.name}`,i.innerHTML=`
        <div style="text-align: center; padding: 20px; opacity: 0.7;">
          <div>🤖 ${e.name}</div>
          <div style="margin-top: 5px; font-size: 12px;">Personality: ${e.personality}</div>
          <div style="margin-top: 5px; font-size: 12px;">Model: ${e.model}</div>
          <div style="margin-top: 15px;">Start chatting!</div>
        </div>
      `,t.style.display="flex",e.avatar&&e.avatar.setState("Listening"))}closeChat(){const e=document.getElementById("chat-interface");e&&(e.style.display="none"),this.currentChatAvatar&&this.currentChatAvatar.avatar&&this.currentChatAvatar.avatar.setState("Idle"),this.currentChatAvatar=null}async sendMessage(){const e=document.getElementById("chat-input"),t=document.getElementById("chat-messages");if(!e||!t||!this.currentChatAvatar)return;const a=e.value.trim();a&&(this.addChatMessage("user",a),e.value="",this.currentChatAvatar.avatar&&this.currentChatAvatar.avatar.setState("Thinking"),setTimeout(()=>{this.generateAvatarResponse(a)},1e3+Math.random()*2e3))}generateAvatarResponse(e){if(!this.currentChatAvatar)return;const t=this.currentChatAvatar,a={Friendly:["That's a great question! I love talking about that.","I'm so glad you asked! Let me share my thoughts...","You seem really thoughtful! Here's what I think..."],Professional:["Based on my analysis, I would recommend...","That's an excellent point. Let me provide some insights...","From a professional perspective, I believe..."],Creative:["Oh, that sparks so many creative ideas! What if...","I see this from an artistic angle. Have you considered...","That's fascinating! It reminds me of..."],Analytical:["Let me break this down systematically...","The data suggests that...","If we analyze this step by step..."],Enthusiastic:["WOW! That's amazing! I think...","I'm SO excited to discuss this with you!","This is fantastic! Here's my take..."]},i=a[t.personality]||a.Friendly,r=i[Math.floor(Math.random()*i.length)];t.avatar&&t.avatar.setState("Responding"),this.addChatMessage("avatar",r),setTimeout(()=>{t.avatar&&t.avatar.setState("Listening")},3e3)}addChatMessage(e,t){var r;const a=document.getElementById("chat-messages");if(!a)return;const i=document.createElement("div");i.style.cssText=`
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 10px;
      ${e==="user"?"background: #667eea; margin-left: 20%; text-align: right;":"background: rgba(255, 255, 255, 0.1); margin-right: 20%;"}
    `,i.innerHTML=`
      <div style="font-size: 11px; opacity: 0.7; margin-bottom: 5px;">
        ${e==="user"?"You":((r=this.currentChatAvatar)==null?void 0:r.name)||"Avatar"}
      </div>
      <div>${t}</div>
    `,a.appendChild(i),a.scrollTop=a.scrollHeight}hideLoadingScreen(){const e=document.getElementById("loadingScreen");e&&(e.style.display="none"),typeof window.hideLoadingScreen=="function"&&window.hideLoadingScreen()}getAvatars(){return this.avatars}getAvatarById(e){return this.avatars.find(t=>t.id===e)}setAvatarState(e,t){const a=this.getAvatarById(e);a&&a.avatar&&a.avatar.setState(t)}}const M=new S;console.log("🚀 LAM WebRender starting...");window.avatarManager=M;window.addEventListener("load",()=>{console.log("✅ LAM WebRender loaded successfully"),setTimeout(()=>{const o=document.getElementById("loadingScreen");o&&(o.style.display="none")},1e3)});console.log("✅ LAM WebRender initialized with 100 avatars");
