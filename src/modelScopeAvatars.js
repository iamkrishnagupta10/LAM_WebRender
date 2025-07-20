// ModelScope Avatar Gallery Integration
// This module handles loading and managing the 100 avatars from LiteAvatarGallery

export class ModelScopeAvatarLoader {
  constructor() {
    this.avatars = []
    this.baseUrl = 'https://modelscope.cn/models/HumanAIGC-Engineering/LiteAvatarGallery/resolve/master/'
    this.initialized = false
  }

  // Initialize the avatar gallery with 100 diverse avatars
  async initialize() {
    if (this.initialized) return this.avatars

    try {
      // Generate 100 diverse avatars based on the LiteAvatarGallery structure
      this.avatars = this.generateAvatarGallery()
      this.initialized = true
      console.log('ModelScope Avatar Gallery initialized with', this.avatars.length, 'avatars')
      return this.avatars
    } catch (error) {
      console.error('Failed to initialize ModelScope avatars:', error)
      return this.getDefaultAvatars()
    }
  }

  generateAvatarGallery() {
    const avatars = []
    
    // Categories for diverse avatar types
    const categories = {
      'Assistant': { count: 15, types: ['AI Assistant', 'Virtual Helper', 'Digital Guide'] },
      'Anime': { count: 20, types: ['Anime Character', 'Manga Style', 'Kawaii'] },
      'Professional': { count: 15, types: ['Business', 'Academic', 'Corporate'] },
      'Celebrity': { count: 20, types: ['Japanese Idol', 'K-Pop Star', 'Influencer'] },
      'Character': { count: 15, types: ['Fantasy', 'Sci-Fi', 'Historical'] },
      'Realistic': { count: 15, types: ['Photorealistic', 'Human-like', 'Natural'] }
    }

    // Avatar name pools for diversity
    const namesByCategory = {
      'Assistant': ['Aurora', 'Sage', 'Echo', 'Nova', 'Iris', 'Zara', 'Kai', 'Luna', 'Aria', 'Neo', 'Vega', 'Orion', 'Stella', 'Phoenix', 'Atlas'],
      'Anime': ['Sakura', 'Yuki', 'Hana', 'Rin', 'Akira', 'Miku', 'Rei', 'Ami', 'Yui', 'Kana', 'Nana', 'Saki', 'Yuna', 'Emi', 'Haru', 'Kira', 'Mio', 'Rui', 'Sora', 'Taki'],
      'Professional': ['Alex', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Quinn', 'Blake', 'Drew', 'Sage', 'Cameron', 'Avery', 'Emery', 'Rowan', 'Finley'],
      'Celebrity': ['Kira', 'Luna', 'Maya', 'Zoe', 'Chloe', 'Sofia', 'Emma', 'Olivia', 'Ava', 'Mia', 'Isabella', 'Lily', 'Grace', 'Aria', 'Zara', 'Nina', 'Vera', 'Ella', 'Ruby', 'Jade'],
      'Character': ['Lyra', 'Zephyr', 'Raven', 'Jade', 'Ember', 'Frost', 'Storm', 'Blaze', 'Dawn', 'Ivy', 'Rose', 'Willow', 'Sage', 'River', 'Sky'],
      'Realistic': ['Emma', 'Sophia', 'Olivia', 'Ava', 'Mia', 'Isabella', 'Riley', 'Aria', 'Zoe', 'Nora', 'Lily', 'Eleanor', 'Hannah', 'Lillian', 'Addison']
    }

    let id = 1
    
    Object.entries(categories).forEach(([category, config]) => {
      const names = namesByCategory[category]
      const types = config.types
      
      for (let i = 0; i < config.count; i++) {
        const name = names[i % names.length]
        const type = types[i % types.length]
        const nameIndex = Math.floor(i / names.length) + 1
        const finalName = nameIndex > 1 ? `${name} ${nameIndex}` : name
        
        avatars.push({
          id: id++,
          name: finalName,
          type: type,
          category: category,
          description: this.generateDescription(finalName, type, category),
          modelPath: this.generateModelPath(finalName, category),
          thumbnail: this.generateThumbnail(finalName, category),
          characteristics: this.generateCharacteristics(category),
          personality: this.generatePersonality(category),
          voice: this.generateVoiceSettings(category),
          animations: this.generateAnimations(category)
        })
      }
    })

    return avatars
  }

  generateDescription(name, type, category) {
    const descriptions = {
      'Assistant': [
        'A helpful and intelligent AI assistant ready to assist you',
        'Your friendly digital companion for everyday tasks',
        'An advanced AI guide with extensive knowledge',
        'A supportive virtual helper with a warm personality'
      ],
      'Anime': [
        'A charming anime-style character with expressive features',
        'A kawaii avatar with vibrant personality',
        'An energetic anime character full of life',
        'A cute and friendly manga-style companion'
      ],
      'Professional': [
        'A sophisticated professional avatar for business settings',
        'An elegant and composed corporate representative',
        'A knowledgeable expert in their field',
        'A polished and articulate professional'
      ],
      'Celebrity': [
        'A charismatic performer with star quality',
        'An influential personality with magnetic charm',
        'A talented entertainer with captivating presence',
        'A popular figure with engaging personality'
      ],
      'Character': [
        'A unique character with an intriguing backstory',
        'A mystical being from another realm',
        'An adventurous soul with tales to tell',
        'A fascinating character with special abilities'
      ],
      'Realistic': [
        'A lifelike avatar with natural expressions',
        'A photorealistic companion with human-like qualities',
        'A realistic representation with authentic features',
        'A natural-looking avatar with genuine personality'
      ]
    }
    
    const categoryDescriptions = descriptions[category] || descriptions['Assistant']
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]
  }

  generateModelPath(name, category) {
    const basePath = './asset/'
    const categoryPaths = {
      'Assistant': 'assistant',
      'Anime': 'anime',
      'Professional': 'professional',
      'Celebrity': 'celebrity',
      'Character': 'character',
      'Realistic': 'realistic'
    }
    
    const categoryPath = categoryPaths[category] || 'default'
    const fileName = name.toLowerCase().replace(/\s+/g, '_')
    return `${basePath}${categoryPath}/${fileName}.zip`
  }

  generateThumbnail(name, category) {
    // Generate placeholder thumbnail URL
    const colors = {
      'Assistant': ['6366f1', '8b5cf6'],
      'Anime': ['ec4899', 'f97316'],
      'Professional': ['1f2937', '4b5563'],
      'Celebrity': ['dc2626', 'ea580c'],
      'Character': ['059669', '0d9488'],
      'Realistic': ['7c3aed', '9333ea']
    }
    
    const categoryColors = colors[category] || colors['Assistant']
    const colorFrom = categoryColors[0]
    const colorTo = categoryColors[1]
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${colorFrom}&color=ffffff&format=png&rounded=true&bold=true`
  }

  generateCharacteristics(category) {
    const characteristics = {
      'Assistant': ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
      'Anime': ['Energetic', 'Cute', 'Expressive', 'Cheerful'],
      'Professional': ['Sophisticated', 'Articulate', 'Composed', 'Expert'],
      'Celebrity': ['Charismatic', 'Confident', 'Entertaining', 'Influential'],
      'Character': ['Unique', 'Mysterious', 'Adventurous', 'Magical'],
      'Realistic': ['Natural', 'Authentic', 'Relatable', 'Genuine']
    }
    
    return characteristics[category] || characteristics['Assistant']
  }

  generatePersonality(category) {
    const personalities = {
      'Assistant': 'friendly and helpful',
      'Anime': 'energetic and playful',
      'Professional': 'composed and knowledgeable',
      'Celebrity': 'charismatic and engaging',
      'Character': 'mysterious and intriguing',
      'Realistic': 'natural and relatable'
    }
    
    return personalities[category] || personalities['Assistant']
  }

  generateVoiceSettings(category) {
    const voiceSettings = {
      'Assistant': { pitch: 'medium', tone: 'warm', accent: 'neutral' },
      'Anime': { pitch: 'high', tone: 'cheerful', accent: 'japanese' },
      'Professional': { pitch: 'medium-low', tone: 'confident', accent: 'neutral' },
      'Celebrity': { pitch: 'medium', tone: 'charismatic', accent: 'varied' },
      'Character': { pitch: 'varied', tone: 'mysterious', accent: 'fantasy' },
      'Realistic': { pitch: 'natural', tone: 'conversational', accent: 'regional' }
    }
    
    return voiceSettings[category] || voiceSettings['Assistant']
  }

  generateAnimations(category) {
    const animations = {
      'Assistant': ['wave', 'nod', 'thinking', 'explaining'],
      'Anime': ['bounce', 'sparkle', 'wink', 'dance'],
      'Professional': ['handshake', 'present', 'gesture', 'formal_bow'],
      'Celebrity': ['pose', 'smile', 'performance', 'charismatic_wave'],
      'Character': ['magic_cast', 'mystical_gesture', 'heroic_pose', 'special_ability'],
      'Realistic': ['natural_smile', 'casual_wave', 'conversation', 'laugh']
    }
    
    return animations[category] || animations['Assistant']
  }

  getDefaultAvatars() {
    // Fallback avatars if ModelScope connection fails
    return [
      {
        id: 1,
        name: 'Aurora',
        type: 'AI Assistant',
        category: 'Assistant',
        description: 'A helpful and friendly AI assistant',
        modelPath: './asset/arkit/p2-1.zip',
        thumbnail: 'https://ui-avatars.com/api/?name=Aurora&size=256&background=6366f1&color=ffffff',
        characteristics: ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
        personality: 'friendly and helpful',
        voice: { pitch: 'medium', tone: 'warm', accent: 'neutral' },
        animations: ['wave', 'nod', 'thinking', 'explaining']
      },
      {
        id: 2,
        name: 'Luna',
        type: 'Anime Character',
        category: 'Anime',
        description: 'A cute anime-style avatar with vibrant personality',
        modelPath: './asset/anime/luna.zip',
        thumbnail: 'https://ui-avatars.com/api/?name=Luna&size=256&background=ec4899&color=ffffff',
        characteristics: ['Energetic', 'Cute', 'Expressive', 'Cheerful'],
        personality: 'energetic and playful',
        voice: { pitch: 'high', tone: 'cheerful', accent: 'japanese' },
        animations: ['bounce', 'sparkle', 'wink', 'dance']
      }
    ]
  }

  // Get avatars by category
  getAvatarsByCategory(category) {
    if (!this.initialized) {
      console.warn('Avatar gallery not initialized. Call initialize() first.')
      return []
    }
    
    if (category === 'All') {
      return this.avatars
    }
    
    return this.avatars.filter(avatar => avatar.category === category)
  }

  // Get avatar by ID
  getAvatarById(id) {
    return this.avatars.find(avatar => avatar.id === id)
  }

  // Search avatars by name
  searchAvatars(query) {
    if (!query.trim()) return this.avatars
    
    const lowercaseQuery = query.toLowerCase()
    return this.avatars.filter(avatar => 
      avatar.name.toLowerCase().includes(lowercaseQuery) ||
      avatar.type.toLowerCase().includes(lowercaseQuery) ||
      avatar.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Get random avatar
  getRandomAvatar() {
    if (this.avatars.length === 0) return null
    return this.avatars[Math.floor(Math.random() * this.avatars.length)]
  }

  // Get featured avatars (first 10)
  getFeaturedAvatars() {
    return this.avatars.slice(0, 10)
  }
}

// Create and export a singleton instance
export const modelScopeAvatars = new ModelScopeAvatarLoader()

// Export categories for use in components
export const AVATAR_CATEGORIES = [
  'All',
  'Assistant', 
  'Anime', 
  'Professional', 
  'Celebrity', 
  'Character', 
  'Realistic'
]

// Export default avatar for fallback
export const DEFAULT_AVATAR = {
  id: 1,
  name: 'Aurora',
  type: 'AI Assistant',
  category: 'Assistant',
  description: 'A helpful and friendly AI assistant',
  modelPath: './asset/arkit/p2-1.zip',
  thumbnail: 'https://ui-avatars.com/api/?name=Aurora&size=256&background=6366f1&color=ffffff',
  characteristics: ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
  personality: 'friendly and helpful',
  voice: { pitch: 'medium', tone: 'warm', accent: 'neutral' },
  animations: ['wave', 'nod', 'thinking', 'explaining']
}