import { AvatarManager } from './avatarManager';

console.log('🚀 Starting 100 AI Avatars...');

// Simple, direct initialization
function initApp() {
  const container = document.getElementById('LAM_WebRender');
  if (!container) {
    console.error('Container not found!');
    return;
  }

  console.log('Container found, creating avatars...');
  
  try {
    const avatarManager = new AvatarManager(container);
    
    // Make globally available for onclick handlers
    (window as any).avatarManager = avatarManager;
    
    avatarManager.start();
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 1000);
    }
    
    console.log('✅ 100 AI Avatars loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading avatars:', error);
    
    // Show error message
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; padding: 2rem;">
        <h1>🤖 100 AI Avatars</h1>
        <p style="margin: 1rem 0;">Error loading application: ${error.message}</p>
        <button onclick="location.reload()" style="padding: 1rem 2rem; background: #00ff88; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
