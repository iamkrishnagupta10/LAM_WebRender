import { createApp } from 'vue'
import App from './App.vue'
import { modelScopeAvatars } from './modelScopeAvatars.js'
import './style.css'

// Initialize the ModelScope avatar gallery
async function initializeApp() {
  try {
    // Load the 100 avatars from ModelScope
    await modelScopeAvatars.initialize()
    console.log('Avatar gallery loaded successfully!')
    
    // Create and mount the Vue application
    const app = createApp(App)
    app.mount('#app')
    
    console.log('Avatar Chat Application started!')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    
    // Still mount the app with default avatars
    const app = createApp(App)
    app.mount('#app')
  }
}

// Start the application
initializeApp()
