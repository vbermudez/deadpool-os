# DeadpoolOS

An AI that thinks it's Deadpool, trapped in your computer, and VERY aware of it.

## 🎭 About

DeadpoolOS is an interactive web application for a coding contest where Deadpool is:
- Self-aware he's an AI built for a contest
- Constantly breaking the fourth wall
- Judging your code and engineering decisions
- Playing games and generating memes
- Having OPINIONS about JavaScript

## ✨ Features

- **💬 Chat Interface** - Talk with Deadpool (powered by GPT-4) with voice synthesis
- **🎮 Mini-Games Collection**
  - 🌯 **Chimichanga Clicker** - Cookie-clicker style game with upgrades and milestones
  - ⚡ **Reflexes Test** - Catch falling objects (chimichangas, swords, unicorns)
  - 🐛 **Code Typo Hunter** - Find bugs in 5 different code challenges
- **🖼️ Meme Gallery** - Generate comic-style images with DALL-E 3
- **🎬 Video Compiler** - Turn your generated images into video montages
- **🏆 Achievement System** - 18 achievements to unlock (5 secret ones!)
- **🎲 Random Events** - Chaotic events that trigger automatically
- **🔊 Sound Effects** - Procedural audio using Web Audio API
- **🥚 Easter Eggs** - Konami code, secret triggers, and hidden achievements
- **🎭 Dynamic Mood System** - Deadpool's mood changes based on interactions
- **🌯 Chimichanga Counter** - Earn chimichangas through interactions

## 🚀 Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (with GPT-4 and DALL-E 3 access)
- ElevenLabs API key (optional, for voice synthesis)

### Installation

1. Clone the repository:
```bash
cd deadpool-os
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
copy .env.example .env
```

4. Edit `.env` and add your API keys:
```
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_ELEVENLABS_API_KEY=sk_your-elevenlabs-key-here
```

Note: ElevenLabs key is optional. Voice synthesis will be disabled if not provided.

### Running the App

**1. Start the backend server:**
```bash
cd server
npm install
cp .env.example .env
# Edit server/.env and add your API keys
npm run dev
```

**2. Start the frontend (in a separate terminal):**
```bash
npm run dev
```

**3. Open browser:**
Navigate to `http://localhost:5173`

**For detailed deployment instructions, see [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md)**

## 🎮 How to Use

### Navigation
The app has 6 tabs at the top:

1. **💬 Chat Tab** 
   - Talk with Deadpool - he's self-aware, meta, and judging your code
   - Click the speaker icon on any message to hear Deadpool's voice
   - Try asking about chimichangas for special reactions!

2. **🌯 Clicker Tab**
   - Click the giant chimichanga to earn points
   - Purchase upgrades to increase click power
   - Reach milestones (50, 100, 666) for achievements
   - Watch Deadpool's mood change as you play

3. **⚡ Reflexes Tab**
   - Catch falling objects (chimichangas, swords, unicorns)
   - You have 3 lives - don't let objects fall!
   - Score increases over time as difficulty ramps up
   - Get 50+ score to unlock an achievement

4. **🐛 Bug Hunter Tab**
   - Find bugs in 5 different code samples
   - Click on lines you think have bugs
   - Use hints (costs 2 chimichangas) if you're stuck
   - Complete all 5 challenges to unlock achievement

5. **🖼️ Gallery Tab**
   - Generate comic-style Deadpool images with DALL-E 3
   - Type a description and hit generate
   - Use suggested prompts or create your own
   - Images are saved for video compilation

6. **🎬 Video Tab**
   - Compile your generated images into a video montage
   - Requires at least 2 images from the Gallery
   - Each image shows for 2 seconds with captions
   - Download your video as WebM format

### Achievements & Secrets
- **🏆 Achievement Button** (top-right) - View your progress
- **🔊 Sound Toggle** - Enable/disable sound effects
- **Konami Code** - Try typing ↑↑↓↓←→←→BA on your keyboard
- **Avatar Clicks** - Click Deadpool's face 10 times in the header
- **Idle Time** - Leave the app open for 5 minutes
- **Random Events** - Watch for random chaotic events that happen automatically!

### Tips
- Earn chimichangas by chatting, clicking, and playing games
- Check your achievement progress regularly
- Enable sound for the full experience
- Generate multiple images to create longer videos

## 🛠️ Tech Stack

**Frontend:**
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management with persistence
- **Canvas API** - Video compilation with MediaRecorder
- **Web Audio API** - Procedural sound effects

**Backend:**
- **Express.js** - REST API server
- **Node.js** - Runtime environment
- **CORS & Rate Limiting** - Security middleware

**AI Services:**
- **OpenAI API** - GPT-4 Turbo (chat) + DALL-E 3 (images)
- **ElevenLabs API** - Text-to-speech voice synthesis

**Features:**
- Base64 image encoding (no CORS issues)
- Rate limiting (100 req/15min)
- Automatic environment detection

## 📁 Project Structure

```
deadpool-os/
├── server/            # Express backend
│   ├── index.js      # API server with chat/image/voice endpoints
│   ├── package.json  # Backend dependencies
│   └── .env.example  # Backend environment template
├── src/
│   ├── components/   # React components (Chat, Games, Gallery, Video)
│   ├── stores/       # Zustand stores (game, conversation, achievements, images)
│   ├── services/     # API service layer
│   ├── utils/        # Sound manager, easter eggs, random events
│   ├── types.ts      # TypeScript types
│   └── App.tsx       # Main app component
├── package.json
├── vite.config.ts    # Includes /api proxy configuration
├── README.md
└── WEB_DEPLOYMENT.md # Deployment guide
```

## 🎯 Contest Submission

**Character:** Deadpool  
**Type:** Web Game-Chatbot Hybrid  
**One-liner:** "An AI that knows it's Deadpool, knows it's in a contest, knows you're judging it, and won't shut up about any of it."

**Features:** 4 mini-games, 18 achievements, voice synthesis, video compilation, random events, easter eggs, and way too much meta-humor.

## 💰 API Costs

Estimated costs for development/demo:
- GPT-4 Turbo: ~$0.01-0.03 per conversation
- DALL-E 3: ~$0.04-0.08 per image
- ElevenLabs: ~$0.30 per 1000 characters (optional)

Budget-friendly for a contest project!

## ⚠️ Troubleshooting

**"OpenAI not initialized" error:**
- Make sure `.env` file exists in the root directory
- Check that `VITE_OPENAI_API_KEY` is set correctly
- Restart the app after adding the key

**App won't start:**
- Delete `node_modules` in both root and `server/` directories
- Run `npm install` in both directories
- Make sure you're using Node.js 18 or higher
- Check that ports 3000 (backend) and 5173 (frontend) are available
- Ensure backend server is running before starting frontend

**Images not generating:**
- Verify your OpenAI account has DALL-E 3 access
- Check your API usage limits
- Images take 10-30 seconds to generate (be patient!)

**Voice synthesis not working:**
- Make sure `VITE_ELEVENLABS_API_KEY` is set in `.env`
- Restart the app after adding the key
- Voice synthesis is optional - app works without it

**Video has 0 duration:**
- Make sure you have at least 2 images generated
- Clear browser cache and try again
- Video compilation requires a modern browser (Chrome/Edge recommended)

**Web mode - API 404 errors:**
- Make sure backend server is running (`cd server && npm run dev`)
- Backend should be on port 3000
- Check Vite proxy configuration in `vite.config.ts`
- Verify both `.env` (root) and `server/.env` have API keys

**CORS errors in web mode:**
- Backend CORS is configured for `http://localhost:5173`
- For production, update CORS origin in `server/index.js`


---

**Made with ☕ caffeine, 💀 Deadpool energy, and way too much TypeScript**
