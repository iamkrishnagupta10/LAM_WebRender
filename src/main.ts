import { avatarManager } from './avatarManager.js';

console.log('🚀 LAM WebRender starting...');

// Make avatar manager globally accessible for onclick handlers
(window as any).avatarManager = avatarManager;

// Hide loading screen once everything is initialized
window.addEventListener('load', () => {
  console.log('✅ LAM WebRender loaded successfully');
  
  // Give the avatar manager a moment to finish initialization
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, 1000);
});

console.log('✅ LAM WebRender initialized with 100 avatars');
