// ModelScope Avatar Gallery Integration
// This module handles loading and managing avatars with the available assets

export class ModelScopeAvatarLoader {
  constructor() {
    this.avatars = []
    this.baseUrl = 'https://modelscope.cn/models/HumanAIGC-Engineering/LiteAvatarGallery/resolve/master/'
    this.initialized = false
  }

  // Initialize the avatar gallery with available assets
  async initialize() {
    if (this.initialized) return this.avatars

    try {
      // Create avatars based on the available asset (p2-1.zip)
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
    
    // Create different personality variations of the same avatar model
    // Since we only have p2-1.zip, we'll create different "personas" using the same 3D model
    const avatarPersonas = [
      // Assistant Category
      { id: 1, name: 'Aurora', type: 'AI Assistant', category: 'Assistant', personality: 'helpful and knowledgeable', voice: 'warm' },
      { id: 2, name: 'Sage', type: 'Virtual Helper', category: 'Assistant', personality: 'wise and patient', voice: 'calm' },
      { id: 3, name: 'Echo', type: 'Digital Guide', category: 'Assistant', personality: 'friendly and supportive', voice: 'cheerful' },
      
      // Anime Category
      { id: 4, name: 'Sakura', type: 'Anime Character', category: 'Anime', personality: 'energetic and kawaii', voice: 'bright' },
      { id: 5, name: 'Yuki', type: 'Manga Style', category: 'Anime', personality: 'sweet and playful', voice: 'cute' },
      { id: 6, name: 'Hana', type: 'Kawaii', category: 'Anime', personality: 'bubbly and expressive', voice: 'animated' },
      
      // Professional Category
      { id: 7, name: 'Alex', type: 'Business Expert', category: 'Professional', personality: 'confident and articulate', voice: 'professional' },
      { id: 8, name: 'Morgan', type: 'Academic', category: 'Professional', personality: 'intellectual and precise', voice: 'scholarly' },
      { id: 9, name: 'Taylor', type: 'Corporate Leader', category: 'Professional', personality: 'authoritative and composed', voice: 'executive' },
      
      // Celebrity Category
      { id: 10, name: 'Luna', type: 'J-Pop Idol', category: 'Celebrity', personality: 'charismatic and entertaining', voice: 'melodic' },
      { id: 11, name: 'Kira', type: 'K-Pop Star', category: 'Celebrity', personality: 'glamorous and confident', voice: 'dynamic' },
      { id: 12, name: 'Zoe', type: 'Influencer', category: 'Celebrity', personality: 'trendy and engaging', voice: 'social' },
      
      // Character Category
      { id: 13, name: 'Lyra', type: 'Fantasy Mage', category: 'Character', personality: 'mystical and wise', voice: 'ethereal' },
      { id: 14, name: 'Nova', type: 'Sci-Fi Explorer', category: 'Character', personality: 'adventurous and curious', voice: 'futuristic' },
      { id: 15, name: 'Ember', type: 'Warrior', category: 'Character', personality: 'brave and determined', voice: 'strong' },
      
      // Realistic Category
      { id: 16, name: 'Emma', type: 'Natural Companion', category: 'Realistic', personality: 'genuine and relatable', voice: 'natural' },
      { id: 17, name: 'Sophia', type: 'Life-like Avatar', category: 'Realistic', personality: 'authentic and warm', voice: 'human-like' },
      { id: 18, name: 'Olivia', type: 'Photorealistic', category: 'Realistic', personality: 'conversational and friendly', voice: 'realistic' }
    ]

    avatarPersonas.forEach(persona => {
      avatars.push({
        id: persona.id,
        name: persona.name,
        type: persona.type,
        category: persona.category,
        description: this.generateDescription(persona.name, persona.type, persona.category, persona.personality),
        modelPath: './asset/arkit/p2-1.zip', // All use the same available model
        thumbnail: this.generateThumbnail(persona.name, persona.category),
        characteristics: this.generateCharacteristics(persona.category),
        personality: persona.personality,
        voice: this.generateVoiceSettings(persona.category, persona.voice),
        animations: this.generateAnimations(persona.category),
        conversationStyle: this.generateConversationStyle(persona.category, persona.personality),
        specialAbilities: this.generateSpecialAbilities(persona.category),
        backstory: this.generateBackstory(persona.name, persona.type, persona.category)
      })
    })

    return avatars
  }

  generateDescription(name, type, category, personality) {
    const descriptions = {
      'Assistant': [
        `${name} is a ${personality} AI assistant who loves helping with any questions or tasks you might have.`,
        `Meet ${name}, your dedicated virtual companion with a ${personality} approach to assistance.`,
        `${name} is here to support you with their ${personality} demeanor and extensive knowledge base.`
      ],
      'Anime': [
        `${name} is a ${personality} anime character who brings joy and energy to every conversation!`,
        `This ${personality} anime-style avatar loves to chat and share their vibrant personality.`,
        `${name} is a delightful ${personality} character straight out of your favorite anime series.`
      ],
      'Professional': [
        `${name} is a ${personality} professional who brings expertise and sophistication to every interaction.`,
        `Meet ${name}, a ${personality} expert ready to discuss business, academics, or professional topics.`,
        `${name} combines ${personality} communication with deep professional knowledge.`
      ],
      'Celebrity': [
        `${name} is a ${personality} performer who loves to entertain and connect with fans.`,
        `This ${personality} celebrity avatar brings star quality to every conversation.`,
        `${name} is a ${personality} entertainer who makes every chat feel like a VIP experience.`
      ],
      'Character': [
        `${name} is a ${personality} character from a realm of adventure and magic.`,
        `Meet ${name}, a ${personality} being with fascinating stories and unique perspectives.`,
        `${name} brings a ${personality} presence from their extraordinary world.`
      ],
      'Realistic': [
        `${name} is a ${personality} companion who feels incredibly natural and human-like.`,
        `This ${personality} avatar provides authentic, relatable conversations.`,
        `${name} offers ${personality} interactions that feel genuinely human.`
      ]
    }
    
    const categoryDescriptions = descriptions[category] || descriptions['Assistant']
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]
  }

  generateThumbnail(name, category) {
    const colors = {
      'Assistant': '6366f1',
      'Anime': 'ec4899', 
      'Professional': '1f2937',
      'Celebrity': 'dc2626',
      'Character': '059669',
      'Realistic': '7c3aed'
    }
    
    const color = colors[category] || '6366f1'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${color}&color=ffffff&format=png&rounded=true&bold=true`
  }

  generateCharacteristics(category) {
    const characteristics = {
      'Assistant': ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
      'Anime': ['Energetic', 'Expressive', 'Cheerful', 'Playful'],
      'Professional': ['Sophisticated', 'Articulate', 'Composed', 'Expert'],
      'Celebrity': ['Charismatic', 'Confident', 'Entertaining', 'Influential'],
      'Character': ['Unique', 'Mysterious', 'Adventurous', 'Magical'],
      'Realistic': ['Natural', 'Authentic', 'Relatable', 'Genuine']
    }
    
    return characteristics[category] || characteristics['Assistant']
  }

  generateVoiceSettings(category, voiceType) {
    const baseSettings = {
      'Assistant': { pitch: 'medium', tone: 'warm', accent: 'neutral' },
      'Anime': { pitch: 'high', tone: 'cheerful', accent: 'japanese' },
      'Professional': { pitch: 'medium-low', tone: 'confident', accent: 'neutral' },
      'Celebrity': { pitch: 'medium', tone: 'charismatic', accent: 'varied' },
      'Character': { pitch: 'varied', tone: 'mysterious', accent: 'fantasy' },
      'Realistic': { pitch: 'natural', tone: 'conversational', accent: 'regional' }
    }
    
    return { ...baseSettings[category], voiceType } || { ...baseSettings['Assistant'], voiceType }
  }

  generateAnimations(category) {
    const animations = {
      'Assistant': ['wave', 'nod', 'thinking', 'explaining', 'pointing', 'welcoming'],
      'Anime': ['bounce', 'sparkle', 'wink', 'dance', 'excited_jump', 'cute_pose'],
      'Professional': ['handshake', 'present', 'gesture', 'formal_bow', 'confident_stance', 'explaining'],
      'Celebrity': ['pose', 'smile', 'performance', 'charismatic_wave', 'spotlight_dance', 'bow'],
      'Character': ['magic_cast', 'mystical_gesture', 'heroic_pose', 'special_ability', 'battle_stance', 'meditation'],
      'Realistic': ['natural_smile', 'casual_wave', 'conversation', 'laugh', 'thoughtful_nod', 'friendly_gesture']
    }
    
    return animations[category] || animations['Assistant']
  }

  generateConversationStyle(category, personality) {
    const styles = {
      'Assistant': 'Uses helpful language, asks clarifying questions, provides structured answers',
      'Anime': 'Uses kawaii expressions, emoticons, exclamation points, and playful language',
      'Professional': 'Formal tone, industry terminology, structured responses, business etiquette',
      'Celebrity': 'Engaging, confident, uses trending phrases, interactive and entertaining',
      'Character': 'Mysterious references, unique perspective, storytelling elements, immersive roleplay',
      'Realistic': 'Natural conversation flow, colloquial expressions, relatable experiences'
    }
    
    return styles[category] || styles['Assistant']
  }

  generateSpecialAbilities(category) {
    const abilities = {
      'Assistant': ['Knowledge synthesis', 'Problem solving', 'Task planning', 'Information retrieval'],
      'Anime': ['Emotion expression', 'Cute reactions', 'Energy boosting', 'Entertainment'],
      'Professional': ['Expert analysis', 'Strategic thinking', 'Leadership guidance', 'Industry insights'],
      'Celebrity': ['Entertainment', 'Trend awareness', 'Social connection', 'Performance skills'],
      'Character': ['Storytelling', 'World building', 'Adventure planning', 'Mystical insights'],
      'Realistic': ['Empathy', 'Life advice', 'Relatable stories', 'Human connection']
    }
    
    return abilities[category] || abilities['Assistant']
  }

  generateBackstory(name, type, category) {
    const backstories = {
      'Assistant': `${name} was created to be the perfect digital companion, trained on vast knowledge bases and designed to be helpful, harmless, and honest.`,
      'Anime': `${name} comes from a vibrant anime world where friendship, adventure, and positivity reign supreme.`,
      'Professional': `${name} has years of experience in their field and enjoys sharing knowledge and helping others succeed.`,
      'Celebrity': `${name} rose to fame through their talent and charisma, and now enjoys connecting with fans from around the world.`,
      'Character': `${name} hails from a world of magic and adventure, bringing unique perspectives from their extraordinary experiences.`,
      'Realistic': `${name} is a relatable person who enjoys genuine conversations and making real connections with others.`
    }
    
    return backstories[category] || backstories['Assistant']
  }

  getDefaultAvatars() {
    // Fallback avatars if initialization fails
    return [
      {
        id: 1,
        name: 'Aurora',
        type: 'AI Assistant',
        category: 'Assistant',
        description: 'A helpful and friendly AI assistant ready to chat',
        modelPath: './asset/arkit/p2-1.zip',
        thumbnail: 'https://ui-avatars.com/api/?name=Aurora&size=256&background=6366f1&color=ffffff',
        characteristics: ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
        personality: 'helpful and knowledgeable',
        voice: { pitch: 'medium', tone: 'warm', accent: 'neutral', voiceType: 'warm' },
        animations: ['wave', 'nod', 'thinking', 'explaining'],
        conversationStyle: 'Uses helpful language and provides structured answers',
        specialAbilities: ['Knowledge synthesis', 'Problem solving', 'Task planning'],
        backstory: 'Aurora was created to be the perfect digital companion, designed to be helpful and honest.'
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

  // Get featured avatars (first 6)
  getFeaturedAvatars() {
    return this.avatars.slice(0, 6)
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
  description: 'A helpful and friendly AI assistant ready to chat with you',
  modelPath: './asset/arkit/p2-1.zip',
  thumbnail: 'https://ui-avatars.com/api/?name=Aurora&size=256&background=6366f1&color=ffffff',
  characteristics: ['Helpful', 'Knowledgeable', 'Patient', 'Reliable'],
  personality: 'helpful and knowledgeable',
  voice: { pitch: 'medium', tone: 'warm', accent: 'neutral', voiceType: 'warm' },
  animations: ['wave', 'nod', 'thinking', 'explaining'],
  conversationStyle: 'Uses helpful language, asks clarifying questions, and provides structured answers',
  specialAbilities: ['Knowledge synthesis', 'Problem solving', 'Task planning', 'Information retrieval'],
  backstory: 'Aurora was created to be the perfect digital companion, trained on vast knowledge bases and designed to be helpful, harmless, and honest.'
}