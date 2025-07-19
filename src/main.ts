import { AvatarManager } from './avatarManager';

// Global error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Initialize the app
function initializeApp() {
  console.log('🚀 Initializing 100 AI Avatars application...');
  
  const container = document.getElementById('LAM_WebRender');
  
  if (!container) {
    console.error('❌ Container element "LAM_WebRender" not found!');
    createFallbackUI();
    return;
  }

  try {
    console.log('✅ Container found, creating AvatarManager...');
    const avatarManager = new AvatarManager(container);
    avatarManager.start();
    console.log('🎉 Application initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing application:', error);
    createErrorUI(container, error);
  }
}

function createFallbackUI() {
  document.body.innerHTML = `
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
  `;
  
  // Try to initialize again
  setTimeout(() => {
    const container = document.getElementById('LAM_WebRender');
    if (container) {
      try {
        const avatarManager = new AvatarManager(container);
        avatarManager.start();
      } catch (error) {
        console.error('Fallback initialization failed:', error);
      }
    }
  }, 1000);
}

function createErrorUI(container: HTMLElement, error: any) {
  container.innerHTML = `
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
      <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 2rem;">Error: ${error.message}</p>
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
  `;
}

// Make functions globally available for debugging
(window as any).initializeApp = initializeApp;
(window as any).AvatarManager = AvatarManager;

// Multiple initialization attempts
if (document.readyState === 'loading') {
  console.log('📄 Document loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('📄 Document already loaded, initializing immediately...');
  initializeApp();
}

// Fallback initialization after 2 seconds
setTimeout(() => {
  const container = document.getElementById('LAM_WebRender');
  if (container && !container.hasChildNodes()) {
    console.log('🔄 Running fallback initialization...');
    initializeApp();
  }
}, 2000);

// Additional safety net after 5 seconds
setTimeout(() => {
  const container = document.getElementById('LAM_WebRender');
  if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
    console.log('🚨 Emergency fallback initialization...');
    createFallbackUI();
  }
}, 5000);
