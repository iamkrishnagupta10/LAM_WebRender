<template>
  <div id="app" class="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header -->
    <header class="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 class="text-white text-xl font-bold">Avatar Chat</h1>
            <p class="text-gray-300 text-sm">Talk to your beautiful live avatar</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button 
            @click="showAvatarGallery = true"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <UserIcon class="w-5 h-5" />
            <span>Choose Avatar</span>
          </button>
          <div class="flex items-center space-x-2 text-white">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm">{{ currentAvatar.state }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-80px)]">
      <!-- Avatar Display Area -->
      <div class="flex-1 relative">
        <div id="LAM_WebRender" class="w-full h-full relative">
          <!-- Avatar placeholder/loading -->
          <div v-if="!avatarLoaded" class="absolute inset-0 flex items-center justify-center bg-black/50">
            <div class="text-center text-white">
              <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p class="text-xl mb-2">Loading {{ selectedAvatar.name }}...</p>
              <p class="text-gray-300">{{ selectedAvatar.description }}</p>
            </div>
          </div>
          
          <!-- Avatar Info Overlay -->
          <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
            <h3 class="font-semibold">{{ selectedAvatar.name }}</h3>
            <p class="text-sm text-gray-300">{{ selectedAvatar.type }}</p>
            <div class="flex items-center mt-2 space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs">Live</span>
            </div>
          </div>

          <!-- Avatar Controls -->
          <div class="absolute bottom-4 left-4 flex space-x-2">
            <button 
              @click="toggleAvatarState"
              class="bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <PlayIcon v-if="currentAvatar.state === 'Idle'" class="w-5 h-5" />
              <PauseIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="w-96 bg-black/20 backdrop-blur-lg border-l border-white/10 flex flex-col">
        <!-- Chat Header -->
        <div class="p-4 border-b border-white/10">
          <h2 class="text-white text-lg font-semibold mb-1">Chat with {{ selectedAvatar.name }}</h2>
          <p class="text-gray-300 text-sm">{{ messages.length }} messages</p>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="flex"
            :class="message.isUser ? 'justify-end' : 'justify-start'"
          >
            <div 
              class="max-w-[80%] rounded-lg p-3"
              :class="message.isUser 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-white border border-white/20'"
            >
              <p class="text-sm">{{ message.text }}</p>
              <p class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</p>
            </div>
          </div>
          
          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white/10 border border-white/20 rounded-lg p-3">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t border-white/10">
          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message..."
              class="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              :disabled="isTyping"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || isTyping"
              class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors duration-200"
            >
              <PaperAirplaneIcon class="w-5 h-5" />
            </button>
          </form>
          
          <!-- Quick Actions -->
          <div class="flex space-x-2 mt-3">
            <button 
              v-for="action in quickActions"
              :key="action"
              @click="sendQuickMessage(action)"
              class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
            >
              {{ action }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Gallery Modal -->
    <div 
      v-if="showAvatarGallery" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showAvatarGallery = false"
    >
      <div 
        class="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-white text-2xl font-bold">Choose Your Avatar</h2>
          <button 
            @click="showAvatarGallery = false"
            class="text-gray-400 hover:text-white"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Avatar Categories -->
        <div class="flex space-x-4 mb-6">
          <button
            v-for="category in avatarCategories"
            :key="category"
            @click="selectedCategory = category"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedCategory === category 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ category }}
          </button>
        </div>

        <!-- Avatar Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="avatar in filteredAvatars"
            :key="avatar.id"
            @click="selectAvatar(avatar)"
            class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border-2"
            :class="selectedAvatar.id === avatar.id ? 'border-purple-500' : 'border-transparent'"
          >
            <div class="aspect-square rounded-lg mb-3 overflow-hidden">
              <img 
                :src="avatar.thumbnail" 
                :alt="avatar.name"
                class="w-full h-full object-cover"
                @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
              />
              <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center" style="display: none;">
                <span class="text-white text-2xl font-bold">{{ avatar.name.charAt(0) }}</span>
              </div>
            </div>
            <h3 class="text-white font-semibold mb-1">{{ avatar.name }}</h3>
            <p class="text-gray-400 text-sm mb-2">{{ avatar.type }}</p>
            <div class="flex justify-between items-center">
              <span class="text-purple-400 text-xs">{{ avatar.category }}</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue'
import { GaussianAvatar } from './gaussianAvatar'
import { modelScopeAvatars, AVATAR_CATEGORIES, DEFAULT_AVATAR } from './modelScopeAvatars.js'
import { 
  UserIcon, 
  PaperAirplaneIcon, 
  PlayIcon, 
  PauseIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'App',
  components: {
    UserIcon,
    PaperAirplaneIcon,
    PlayIcon,
    PauseIcon,
    XMarkIcon
  },
  setup() {
    // State
    const messages = ref([])
    const newMessage = ref('')
    const isTyping = ref(false)
    const avatarLoaded = ref(false)
    const showAvatarGallery = ref(false)
    const selectedCategory = ref('All')
    const messagesContainer = ref(null)
    
    // Avatar state
    const currentAvatar = ref({
      state: 'Idle',
      instance: null
    })
    
    const selectedAvatar = ref(DEFAULT_AVATAR)

    // Avatar categories and data
    const avatarCategories = ref(AVATAR_CATEGORIES)
    
    // Avatar gallery loaded from ModelScope
    const avatarGallery = ref([])

    // Quick action messages
    const quickActions = ref(['Hello!', 'How are you?', 'Tell me a joke', 'Sing a song'])

    // Computed
    const filteredAvatars = computed(() => {
      if (selectedCategory.value === 'All') {
        return avatarGallery.value
      }
      return avatarGallery.value.filter(avatar => avatar.category === selectedCategory.value)
    })

    // Methods
    const initializeAvatar = async () => {
      try {
        const div = document.getElementById('LAM_WebRender')
        if (div && selectedAvatar.value.modelPath) {
          currentAvatar.value.instance = new GaussianAvatar(div, selectedAvatar.value.modelPath)
          await currentAvatar.value.instance.start()
          avatarLoaded.value = true
          
          // Add welcome message
          addMessage('Hello! I\'m ' + selectedAvatar.value.name + '. How can I help you today?', false)
        }
      } catch (error) {
        console.error('Failed to initialize avatar:', error)
        addMessage('Sorry, I\'m having trouble loading. Please try refreshing the page.', false)
      }
    }

    const addMessage = (text, isUser = false) => {
      const message = {
        id: uuidv4(),
        text,
        isUser,
        timestamp: new Date()
      }
      messages.value.push(message)
      nextTick(() => {
        scrollToBottom()
      })
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return
      
      const userMessage = newMessage.value.trim()
      addMessage(userMessage, true)
      newMessage.value = ''
      
      // Show typing indicator
      isTyping.value = true
      currentAvatar.value.state = 'Listening'
      
      // Simulate avatar response
      setTimeout(() => {
        currentAvatar.value.state = 'Thinking'
      }, 1000)
      
      setTimeout(() => {
        currentAvatar.value.state = 'Responding'
        const response = generateAvatarResponse(userMessage)
        addMessage(response, false)
        isTyping.value = false
        
        setTimeout(() => {
          currentAvatar.value.state = 'Idle'
        }, 2000)
      }, 2000 + Math.random() * 2000)
    }

    const sendQuickMessage = (message) => {
      newMessage.value = message
      sendMessage()
    }

    const generateAvatarResponse = (userMessage) => {
      const responses = [
        "That's interesting! Tell me more about that.",
        "I understand what you're saying. How can I help with that?",
        "Thanks for sharing that with me!",
        "That sounds fascinating. What would you like to know?",
        "I'm here to help! What else can I do for you?",
        "Great question! Let me think about that for a moment.",
        "I appreciate you talking with me. What's on your mind?",
        "That's a wonderful perspective! I'd love to discuss this further."
      ]
      
      // Simple keyword-based responses
      const lowerMessage = userMessage.toLowerCase()
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello there! It's wonderful to meet you! How are you doing today?"
      }
      if (lowerMessage.includes('joke')) {
        return "Why don't scientists trust atoms? Because they make up everything! 😄"
      }
      if (lowerMessage.includes('sing')) {
        return "🎵 I'm just a virtual avatar, living in a digital world... 🎵"
      }
      if (lowerMessage.includes('how are you')) {
        return "I'm doing great! Thanks for asking. I'm excited to chat with you!"
      }
      
      return responses[Math.floor(Math.random() * responses.length)]
    }

    const selectAvatar = (avatar) => {
      selectedAvatar.value = avatar
      avatarLoaded.value = false
      showAvatarGallery.value = false
      
      // Add system message about avatar change
      addMessage(`Switching to ${avatar.name}... Please wait a moment.`, false)
      
      // Reinitialize avatar
      setTimeout(() => {
        initializeAvatar()
      }, 1000)
    }

    const toggleAvatarState = () => {
      if (currentAvatar.value.state === 'Idle') {
        currentAvatar.value.state = 'Listening'
      } else {
        currentAvatar.value.state = 'Idle'
      }
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Load avatars from ModelScope
    const loadAvatars = async () => {
      try {
        const loadedAvatars = await modelScopeAvatars.initialize()
        avatarGallery.value = loadedAvatars
        console.log('Loaded', loadedAvatars.length, 'avatars from ModelScope')
      } catch (error) {
        console.error('Failed to load ModelScope avatars:', error)
        // Use fallback avatars
        avatarGallery.value = modelScopeAvatars.getDefaultAvatars()
      }
    }

    // Lifecycle
    onMounted(async () => {
      await loadAvatars()
      await initializeAvatar()
    })

    return {
      // State
      messages,
      newMessage,
      isTyping,
      avatarLoaded,
      showAvatarGallery,
      selectedCategory,
      messagesContainer,
      currentAvatar,
      selectedAvatar,
      avatarCategories,
      avatarGallery,
      quickActions,
      
      // Computed
      filteredAvatars,
      
      // Methods
      sendMessage,
      sendQuickMessage,
      selectAvatar,
      toggleAvatarState,
      formatTime
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.8);
}
</style>