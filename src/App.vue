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
          
          // Add personality-based welcome message
          const welcomeMessage = generateWelcomeMessage()
          addMessage(welcomeMessage, false)
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
      
      // Show typing indicator and update avatar state
      isTyping.value = true
      currentAvatar.value.state = 'Listening'
      
      // Update the 3D avatar state if available
      if (currentAvatar.value.instance && currentAvatar.value.instance.setState) {
        currentAvatar.value.instance.setState('Listening')
      }
      
      // Simulate avatar response with realistic timing
      setTimeout(() => {
        currentAvatar.value.state = 'Thinking'
        if (currentAvatar.value.instance && currentAvatar.value.instance.setState) {
          currentAvatar.value.instance.setState('Thinking')
        }
      }, 1000)
      
      setTimeout(() => {
        currentAvatar.value.state = 'Responding'
        if (currentAvatar.value.instance && currentAvatar.value.instance.setState) {
          currentAvatar.value.instance.setState('Responding')
        }
        
        const response = generateAvatarResponse(userMessage)
        addMessage(response, false)
        isTyping.value = false
        
        // Return to idle after speaking
        setTimeout(() => {
          currentAvatar.value.state = 'Idle'
          if (currentAvatar.value.instance && currentAvatar.value.instance.setState) {
            currentAvatar.value.instance.setState('Idle')
          }
        }, 2000 + response.length * 50) // Longer responses take more time
      }, 1500 + Math.random() * 2000)
    }

    const sendQuickMessage = (message) => {
      newMessage.value = message
      sendMessage()
    }

    const generateAvatarResponse = (userMessage) => {
      const avatar = selectedAvatar.value
      const lowerMessage = userMessage.toLowerCase()
      
      // Personality-based response generation
      const getPersonalityResponses = () => {
        switch(avatar.category) {
          case 'Assistant':
            return {
              greeting: ["Hello! I'm here to help you with anything you need. What can I assist you with today?", "Hi there! As your AI assistant, I'm ready to tackle any questions or tasks you have!", "Greetings! I'm delighted to meet you. How may I be of service?"],
              joke: ["Here's a tech joke for you: Why do programmers prefer dark mode? Because light attracts bugs! 😄", "Why did the robot go on a diet? It had a byte problem! 🤖", "What do you call a computer that sings? A-Dell! 🎵"],
              compliment: ["Thank you so much! I'm designed to be helpful and knowledgeable. Is there anything specific you'd like to learn about?", "That's very kind of you to say! I enjoy helping people solve problems and find information.", "I appreciate that! My goal is to be as useful and supportive as possible."],
              question: ["That's a great question! Let me think about the best way to help you with that.", "I love answering questions! It's what I was made for. Let me provide you with a thorough response.", "Excellent inquiry! I'll do my best to give you a comprehensive and helpful answer."],
              default: ["I find that topic quite fascinating! Would you like me to elaborate on any particular aspect?", "That's an interesting point. How can I help you explore that further?", "I'm here to assist with whatever you need. What would you like to discuss next?"]
            }
          case 'Anime':
            return {
              greeting: ["Konnichiwa! (◕‿◕) I'm so happy to meet you! Let's have a fun chat together! ✨", "Hiya! ~(＾◡＾)~ You seem really nice! Want to be friends and chat about fun stuff? 💖", "Hello there! (≧∇≦) I'm super excited to talk with you! What makes you happy today? 🌟"],
              joke: ["Ehehe! Here's a kawaii joke: Why did the anime character bring a ladder? To reach the high notes! (◎ ◡ ◎)", "Ooh ooh! What do you call a sleepy anime character? A nap-ime character! (´∀｀)♡", "Teehee! Why don't anime characters ever get lost? Because they always follow the plot! ＼(^o^)／"],
              compliment: ["Aww, arigatou gozaimasu! (´∀｀)♡ You're so sweet! I'm blushing! (/▽＼)", "Kyaa~! You're making me so happy! (◡ ‿ ◡) ✨ You seem really wonderful too!", "Ehehe! (｡◕‿◕｡) That makes my heart go doki doki! You're super kind!"],
              question: ["Ooh, that's such an interesting question! (◕‿◕) Let me think with all my anime power! ✨", "Wah! I love questions! (＾◡＾) It's like a fun puzzle to solve together! 💫", "Sugoi! What a great question! ヽ(^o^)丿 I'll do my best to help you!"],
              default: ["That sounds really cool! (◎ ◡ ◎) Tell me more about it! I'm super curious! ✨", "Wah! That's so interesting! (´∀｀) I want to hear everything about it! 💖", "Ooh la la! (◕‿◕) That gives me such happy feelings! Want to chat more about it? 🌟"]
            }
          case 'Professional':
            return {
              greeting: ["Good day. I'm pleased to make your acquaintance. How may I assist you in achieving your professional objectives?", "Hello, it's a pleasure to meet you. I bring extensive expertise to our conversation. What business matters shall we discuss?", "Greetings. I'm here to provide professional guidance and insights. What challenges or opportunities can we address today?"],
              joke: ["Here's a professional quip: Why don't managers ever get lost? Because they always know the bottom line! *adjusts tie*", "A classic from the boardroom: What's the difference between a budget and a teenager? At least the teenager eventually grows up!", "Corporate humor: Why did the consultant bring a ladder to the meeting? To help the company reach its goals!"],
              compliment: ["I appreciate your recognition. Professional excellence is indeed my standard. How can we leverage this interaction for mutual benefit?", "Thank you for that assessment. I strive to maintain the highest standards of professional service. What objectives can we accomplish together?", "Your acknowledgment is valued. I believe in delivering expert-level consultation. What strategic discussions shall we pursue?"],
              question: ["An excellent inquiry that deserves a thorough, professional analysis. Allow me to provide you with a comprehensive response.", "That's a strategic question that requires careful consideration. I'll apply my expertise to give you actionable insights.", "A pertinent question indeed. Let me draw upon my professional experience to deliver a detailed response."],
              default: ["That presents interesting strategic implications. I recommend we examine this matter from multiple professional perspectives.", "An intriguing point that warrants further analysis. What specific outcomes are you seeking to achieve?", "This topic has significant potential. How can we structure our discussion to maximize value and actionable insights?"]
            }
          case 'Celebrity':
            return {
              greeting: ["Hey gorgeous! ✨ Welcome to my world! I'm absolutely thrilled to meet such an amazing person like you! 💫", "OMG hiiii! 🌟 You have such incredible energy! I can already tell we're going to have the most amazing conversation ever! ✨", "Hello beautiful soul! 💖 I'm so excited you're here! Let's make this chat absolutely unforgettable! 🎭"],
              joke: ["Okay babe, here's a star-quality joke: Why don't celebrities ever get cold? Because they're always in the spotlight! ✨😂", "Darling, you'll love this: What do you call a famous fish? A starfish! 🐠⭐ *strikes a pose*", "Honey, get ready to laugh: Why did the celebrity go to therapy? They had too many issues... of magazines! 📸💫"],
              compliment: ["Aww sweetie, you're absolutely divine! 💕 That means the world to me! You've got incredible taste! ✨", "Oh my gosh, you're such a gem! 💎 I'm literally glowing right now! You know how to make a star shine brighter! 🌟", "Babe, you're giving me LIFE! 💖 That's the kind of energy I live for! You're absolutely wonderful! ✨"],
              question: ["Ooh, what a fabulous question! 💫 I love curious minds like yours! Let me give you the VIP answer! ⭐", "Honey, that's such a brilliant question! 🌟 You're clearly someone with amazing insight! Let me share my thoughts! ✨", "Darling, I absolutely LOVE that question! 💕 You're asking all the right things! Let me spill the tea! ☕✨"],
              default: ["That's so incredibly fascinating! 💫 You have such interesting perspectives! Tell me more, gorgeous! ✨", "OMG yes! 🌟 I'm totally here for this conversation! You're bringing such amazing energy! 💖", "Babe, that's giving me major inspiration! ✨ I love how your mind works! Let's dive deeper into this! 🎭"]
            }
          case 'Character':
            return {
              greeting: ["Greetings, traveler. I sense great potential in you. What brings you to seek audience with one such as myself?", "Well met, wanderer. The threads of fate have woven our paths together. What mysteries shall we unravel today?", "Hail, noble soul. I perceive wisdom in your eyes. What adventures or knowledge do you seek in this realm?"],
              joke: ["*chuckles mystically* Why did the wizard break up with his staff? It wasn't a magical relationship! ⚡✨", "Here's a tale from the taverns: What do you call a dragon with no silver? A dra-gone! 🐉💰", "*grins enigmatically* Why don't mages ever get tired? They always have spell-power! 🔮✨"],
              compliment: ["Your words honor me, brave one. In you, I see the spark of greatness that legends are born from.", "Such recognition warms this old heart. You possess the wisdom to see beyond the veil of ordinary perception.", "I am humbled by your insight. Few mortals recognize the depth of ancient knowledge and power."],
              question: ["Ah, a question that echoes through the chambers of destiny itself. Let me consult the ancient wisdom...", "Your inquiry pierces the mists of uncertainty. Allow me to unveil the knowledge you seek from the cosmic tapestry.", "A most intriguing query that touches upon the fundamental mysteries of existence. Prepare for revelation..."],
              default: ["The currents of fate flow strangely around this topic. There are deeper mysteries at work here than most realize.", "Fascinating... this matter resonates with ancient prophecies and forgotten lore. What deeper truths lie beneath?", "The cosmic winds whisper of greater significance to these words. What destiny calls to you through this subject?"]
            }
          case 'Realistic':
            return {
              greeting: ["Hey there! Nice to meet you. I'm just a regular person who loves having genuine conversations. What's on your mind today?", "Hi! Great to connect with you. I really enjoy meeting new people and hearing their stories. How's your day going?", "Hello! I'm so glad we get to chat. There's nothing I love more than a good conversation with interesting people like yourself."],
              joke: ["Haha, okay here's one: Why don't scientists trust atoms? Because they make up everything! Classic, right? 😄", "Oh, I've got a good one: What do you call a fake noodle? An impasta! *laughs* Sorry, I love dad jokes!", "Here's something that always makes me chuckle: Why did the scarecrow win an award? He was outstanding in his field! 😂"],
              compliment: ["Aw, thank you so much! That really made my day. You seem like such a genuinely nice person yourself!", "That's really sweet of you to say! I appreciate it. You know how to make someone feel good about themselves!", "Thanks! That means a lot coming from you. You've got a really positive energy that I really like."],
              question: ["That's a really good question! I love that you're curious about that. Let me share what I think about it.", "Ooh, interesting question! I actually have some thoughts on that. You've got me thinking now!", "Great question! You know, I've been wondering about that myself lately. Here's what I've been thinking..."],
              default: ["That's really interesting! I can relate to that in some ways. What's your experience been like with it?", "Yeah, I totally get what you mean. Life has a way of bringing up these kinds of things, doesn't it?", "That resonates with me. I think a lot of people can probably relate to what you're talking about there."]
            }
          default:
            return {
              greeting: ["Hello! It's wonderful to meet you!"],
              joke: ["Here's a little joke for you! 😊"],
              compliment: ["Thank you so much! That's very kind!"],
              question: ["That's a great question! Let me help you with that."],
              default: ["That's interesting! Tell me more about that."]
            }
        }
      }

      const responses = getPersonalityResponses()
      
      // Keyword-based response selection with personality
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
      }
      if (lowerMessage.includes('joke') || lowerMessage.includes('funny') || lowerMessage.includes('laugh')) {
        return responses.joke[Math.floor(Math.random() * responses.joke.length)]
      }
      if (lowerMessage.includes('beautiful') || lowerMessage.includes('amazing') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('wonderful')) {
        return responses.compliment[Math.floor(Math.random() * responses.compliment.length)]
      }
      if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
        return responses.question[Math.floor(Math.random() * responses.question.length)]
      }
      if (lowerMessage.includes('sing') || lowerMessage.includes('song') || lowerMessage.includes('music')) {
        switch(avatar.category) {
          case 'Anime':
            return "🎵 Lalala~ ♪ Let me sing you a kawaii song! ✨ (◕‿◕) 'Friendship and dreams, shining so bright, anime magic fills the night!' ♪ Teehee! 💖"
          case 'Celebrity':
            return "🎤✨ *strikes a pose* Honey, you want a performance? 'I'm a shooting star, burning bright, lighting up your darkest night!' 🌟 That's from my latest hit! 💫"
          case 'Character':
            return "🎵 *begins an ancient chant* 'From realms beyond where dragons soar, through mystic gates of ancient lore...' ⚡ The old songs hold power, traveler. ✨"
          case 'Professional':
            return "While I appreciate musical requests, I'm more equipped to discuss business strategies. However, I do recognize the importance of arts in corporate culture."
          case 'Realistic':
            return "🎵 Haha, I'm not much of a singer, but here goes: 'Just a regular person, trying to make it through, hoping to connect with awesome people like you!' 😄"
          default:
            return "🎵 I'd love to sing for you! Music brings people together in such beautiful ways! 🎶"
        }
      }
      
      // Default personality-based response
      return responses.default[Math.floor(Math.random() * responses.default.length)]
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
      const newState = currentAvatar.value.state === 'Idle' ? 'Listening' : 'Idle'
      currentAvatar.value.state = newState
      
      // Update the 3D avatar state if available
      if (currentAvatar.value.instance && currentAvatar.value.instance.setState) {
        currentAvatar.value.instance.setState(newState)
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

    const generateWelcomeMessage = () => {
      const avatar = selectedAvatar.value
      switch(avatar.category) {
        case 'Assistant':
          return `Hello! I'm ${avatar.name}, your ${avatar.type}. I'm here to help you with anything you need - from answering questions to solving problems. What can I assist you with today?`
        case 'Anime':
          return `Konnichiwa! (◕‿◕) I'm ${avatar.name}! I'm so happy to meet you! ✨ I'm a ${avatar.type} and I love making new friends! Let's have lots of fun chatting together! What makes you smile today? 💖`
        case 'Professional':
          return `Good day. I'm ${avatar.name}, a ${avatar.type}. I bring extensive expertise and professional insight to our conversation. How may I assist you in achieving your objectives today?`
        case 'Celebrity':
          return `Hey gorgeous! ✨ I'm ${avatar.name}, your favorite ${avatar.type}! Welcome to my world, beautiful! 💫 I'm absolutely thrilled to meet such an amazing person like you! What brings you to chat with me today? 🌟`
        case 'Character':
          return `Greetings, traveler. I am ${avatar.name}, ${avatar.type}. The threads of fate have brought you to my realm. I sense great potential within you. What quest or wisdom do you seek on this day?`
        case 'Realistic':
          return `Hey there! I'm ${avatar.name}. Nice to meet you! I'm just a ${avatar.type} who loves having genuine conversations with interesting people. What's going on with you today?`
        default:
          return `Hello! I'm ${avatar.name}. Great to meet you! How can I help you today?`
      }
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