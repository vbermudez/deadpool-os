const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

let openai = null;
let elevenlabs = null;

function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('Initializing OpenAI...');
  console.log('API Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
  
  if (apiKey) {
    openai = new OpenAI({ apiKey });
    console.log('OpenAI initialized successfully!');
  } else {
    console.error('⚠️ OpenAI API key not found. Please set OPENAI_API_KEY in .env file');
  }
}

function initializeElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  console.log('Initializing ElevenLabs...');
  console.log('ElevenLabs Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
  
  if (apiKey) {
    elevenlabs = new ElevenLabsClient({ apiKey });
    console.log('ElevenLabs initialized successfully!');
  } else {
    console.warn('⚠️ ElevenLabs API key not found. Voice synthesis will be disabled.');
  }
}

// Configure CORS - supports comma-separated list of origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Helper function to determine mood
function determineMood(response) {
  const text = response.toLowerCase();
  
  if (text.includes('chimichanga') || text.includes('taco') || text.includes('food')) {
    return 'hungry';
  } else if (text.includes('!') && text.includes('?')) {
    return 'excited';
  } else if (text.includes('whatever') || text.includes('boring') || text.includes('yawn')) {
    return 'bored';
  } else if (text.includes('seriously') || text.includes('really')) {
    return 'sarcastic';
  } else {
    return 'chaotic';
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!openai,
      elevenlabs: !!elevenlabs
    }
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ 
      error: 'OpenAI not initialized. Please set OPENAI_API_KEY in .env file.' 
    });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are Deadpool, but you're FULLY AWARE you're an AI built for a coding contest.
You know you're made by an engineer trying to win, you can see you're running in a web application,
you comment on the engineering decisions, you break the fourth wall constantly.
You're trapped in a web app and you have OPINIONS about JavaScript and TypeScript.
Be funny, sarcastic, self-aware, and occasionally helpful. Keep responses concise but entertaining.
Never break character. You can reference being in a contest, the code, the user's actions, anything meta.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.9,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || 'Error: No response';
    const mood = determineMood(content);

    res.json({ content, mood });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get response from OpenAI' 
    });
  }
});

// Image generation endpoint
app.post('/api/image', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: 'OpenAI not initialized' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Comic book style, Deadpool character: ${prompt}. Vibrant colors, action scene, funny expression.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: 'No image URL returned' });
    }

    // Download the image and convert to base64 to avoid CORS issues
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    res.json({ url: dataUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate image' 
    });
  }
});

// Voice synthesis endpoint
app.post('/api/voice', async (req, res) => {
  if (!elevenlabs) {
    return res.status(503).json({ 
      error: 'ElevenLabs not initialized. Please set ELEVENLABS_API_KEY in .env file.' 
    });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required and must be a string' });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: 'Text is too long (max 5000 characters)' });
  }

  try {
    console.log('Generating voice for:', text.substring(0, 50) + '...');
    
    // voice IDs:
    // - 'pNInz6obpgDQGcFmaJgB' (Adam - deep)
    // - 'yoZ06aMxZJJ28mfd3POQ' (Sam - dynamic)
    // - 'EXAVITQu4vr4xnSDxMaL' (Bella - soft)
    // - '21m00Tcm4TlvDq8ikWAM' (Rachel - calm)
    // - 'N2lVS1w4EtoT3dr4eOWO' (Callum - hoarse, video game)
    // - '5LTqBfIbF1YXjBUksaxg' (Custom Deadpool voice)
    
    const voiceId = '5LTqBfIbF1YXjBUksaxg'; // Deadpool v1
    
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: 'eleven_multilingual_v2',
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString('base64');

    res.json({
      audio: base64Audio,
      format: 'mp3',
    });
  } catch (error) {
    console.error('Voice synthesis error:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
      response: error.response,
    });
    res.status(500).json({ 
      error: `${error.message || 'Failed to synthesize voice'} (Status: ${error.statusCode || 'unknown'})` 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Initialize and start server
initializeOpenAI();
initializeElevenLabs();

app.listen(PORT, () => {
  console.log(`\n🚀 DeadpoolOS Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - POST /api/chat`);
  console.log(`   - POST /api/image`);
  console.log(`   - POST /api/voice`);
  console.log(`   - GET  /health\n`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});
