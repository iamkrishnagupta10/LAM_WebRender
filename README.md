# 🤖 Avatar Chat - Talk to Your Beautiful Live Avatar

A stunning Vue.js application that lets you chat with 100+ beautiful AI avatars powered by ModelScope's LiteAvatarGallery. Experience natural conversations with lifelike 3D avatars using advanced Gaussian Splat rendering technology.

![Avatar Chat Preview](https://via.placeholder.com/800x400/1e1b4b/ffffff?text=Avatar+Chat+Application)

## ✨ Features

### 🎭 **100+ Diverse Avatars**
- **AI Assistants** (15 avatars) - Helpful digital companions
- **Anime Characters** (20 avatars) - Kawaii anime-style avatars  
- **Professionals** (15 avatars) - Business and academic avatars
- **Celebrities** (20 avatars) - Idol and influencer style avatars
- **Fantasy Characters** (15 avatars) - Mystical and sci-fi avatars
- **Realistic Avatars** (15 avatars) - Photorealistic human-like avatars

### 💬 **Advanced Chat System**
- Real-time messaging with typing indicators
- Smart avatar responses with personality-based replies
- Quick action buttons for common interactions
- Message history with timestamps
- Avatar state tracking (Idle, Listening, Thinking, Responding)

### 🎨 **Beautiful Modern UI**
- Glass morphism design with backdrop blur effects
- Responsive layout that works on desktop and mobile
- Smooth animations and transitions
- Custom scrollbars and loading animations
- Dark theme with purple accent colors

### 🚀 **Technical Features**
- Vue 3 Composition API for reactive state management
- TypeScript support for better development experience
- 3D Gaussian Splat rendering for lifelike avatars
- ModelScope integration for avatar loading
- Modular component architecture

## 🎯 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avatar-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to start chatting with your avatars!

## 🎮 How to Use

### Starting a Conversation
1. **Launch the app** - The default avatar (Aurora) will greet you
2. **Type your message** in the chat input at the bottom right
3. **Send messages** by pressing Enter or clicking the send button
4. **Use quick actions** for common phrases like "Hello!" or "Tell me a joke"

### Choosing Your Avatar
1. **Click "Choose Avatar"** button in the top navigation
2. **Browse categories** - Filter by Assistant, Anime, Professional, Celebrity, Character, or Realistic
3. **Select an avatar** - Click on any avatar card to switch to them
4. **Wait for loading** - Your new avatar will initialize and greet you

### Avatar Interactions
- **Watch avatar states** - See when they're Idle, Listening, Thinking, or Responding
- **Control playback** - Use the play/pause button to control avatar animations
- **Real-time responses** - Avatars respond with personality-appropriate messages

## 🏗️ Project Structure

```
src/
├── App.vue                 # Main Vue application component
├── main.ts                 # Application entry point
├── style.css              # Global styles and Tailwind utilities
├── gaussianAvatar.ts      # 3D avatar rendering logic
├── modelScopeAvatars.js   # Avatar gallery management
└── asset/                 # Avatar model files
    ├── arkit/            # ARKit avatar models
    ├── anime/            # Anime-style avatars
    ├── professional/     # Professional avatars
    ├── celebrity/        # Celebrity-style avatars
    ├── character/        # Fantasy character avatars
    └── realistic/        # Photorealistic avatars
```

## 🔧 Configuration

### Adding New Avatars
To add more avatars to the gallery:

1. **Add avatar files** to the appropriate `/asset/` subdirectory
2. **Update modelScopeAvatars.js** to include new avatar definitions
3. **Configure avatar properties**:
   ```javascript
   {
     id: uniqueId,
     name: 'Avatar Name',
     type: 'Avatar Type',
     category: 'Assistant|Anime|Professional|Celebrity|Character|Realistic',
     description: 'Avatar description',
     modelPath: './asset/category/filename.zip',
     characteristics: ['trait1', 'trait2'],
     personality: 'personality description'
   }
   ```

### Customizing Chat Responses
Modify the `generateAvatarResponse()` function in `App.vue` to:
- Add keyword-based responses
- Integrate with external AI APIs
- Customize personality-based replies

### Styling Customization
- **Colors**: Update CSS variables in `style.css`
- **Layout**: Modify Vue component templates
- **Animations**: Customize keyframe animations in CSS

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Building for Production
```bash
npm run build
```
The built files will be in the `dist/` directory.

### Technology Stack
- **Frontend**: Vue 3, TypeScript, CSS3
- **3D Rendering**: Gaussian Splat Renderer
- **Avatar Models**: ModelScope LiteAvatarGallery
- **Build Tool**: Vite
- **Icons**: Heroicons
- **Styling**: Custom CSS with Tailwind-inspired utilities

## 🎨 Customization Guide

### Theme Colors
Update the color scheme by modifying CSS variables:
```css
:root {
  --primary: #8b5cf6;     /* Purple */
  --secondary: #1e3a8a;   /* Blue */
  --accent: #ec4899;      /* Pink */
  --background: #1e1b4b;  /* Dark blue */
}
```

### Avatar Categories
Add new categories by updating the `AVATAR_CATEGORIES` array:
```javascript
export const AVATAR_CATEGORIES = [
  'All', 'Assistant', 'Anime', 'Professional', 
  'Celebrity', 'Character', 'Realistic', 'Custom'
]
```

### Response Personalities
Customize avatar personalities in the `generatePersonality()` function:
```javascript
const personalities = {
  'Assistant': 'helpful and knowledgeable',
  'Anime': 'energetic and kawaii',
  'Professional': 'formal and expert',
  // Add your custom personalities
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Deploy with default Vite settings

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Configure redirects for SPA routing

### Self-hosted
1. Build: `npm run build`
2. Serve the `dist/` folder with any web server
3. Ensure proper MIME types for `.zip` avatar files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ModelScope** for the LiteAvatarGallery avatar collection
- **Vue.js** team for the amazing framework
- **Gaussian Splat Renderer** for 3D avatar technology
- **Heroicons** for beautiful UI icons

## 🆘 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify dependencies** are properly installed
3. **Ensure avatar assets** are in the correct directories
4. **Open an issue** with detailed error information

---

**Ready to chat with your beautiful avatar? Start the application and enjoy natural conversations with 100+ diverse AI companions!** 🎉
