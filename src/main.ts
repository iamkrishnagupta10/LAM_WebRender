import { AvatarManager } from './avatarManager';

// Initialize the 100 AI Avatars application
const container = document.getElementById('LAM_WebRender');

if (container) {
  const avatarManager = new AvatarManager(container);
  avatarManager.start();
  
  console.log('🚀 Starting 100 AI Avatars with ModelScope integration...');
} else {
  console.error('Container element not found!');
}
