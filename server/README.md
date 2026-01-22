# DeadpoolOS Backend Server

Backend API server for the DeadpoolOS web application.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
ELEVENLABS_API_KEY=sk_your-elevenlabs-api-key-here
PORT=3000
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in .env)

## API Endpoints

### POST /api/chat
Generate chat responses with GPT-4.

**Request:**
```json
{
  "message": "Hello Deadpool!"
}
```

**Response:**
```json
{
  "content": "Response from Deadpool",
  "mood": "chaotic"
}
```

### POST /api/image
Generate images with DALL-E 3.

**Request:**
```json
{
  "prompt": "Deadpool eating a chimichanga"
}
```

**Response:**
```json
{
  "url": "data:image/png;base64,..."
}
```

### POST /api/voice
Synthesize voice with ElevenLabs.

**Request:**
```json
{
  "text": "Hello from Deadpool!"
}
```

**Response:**
```json
{
  "audio": "base64-encoded-mp3-data",
  "format": "mp3"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T12:00:00.000Z",
  "services": {
    "openai": true,
    "elevenlabs": true
  }
}
```

## Features

- **CORS enabled** for local development (port 5173)
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Error handling** with detailed logs
- **Input validation** on all endpoints
- **Base64 image encoding** to avoid CORS issues
- **Graceful shutdown** handling

## Connecting Frontend

Update your frontend to use these endpoints instead of Electron IPC:

```typescript
// Before (Electron):
const response = await window.electronAPI.sendMessage(message);

// After (Web):
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
});
const data = await response.json();
```

## Security Notes

For production deployment:
1. Update CORS origins in `index.js`
2. Use environment variables for all sensitive data
3. Enable HTTPS
4. Consider adding authentication
5. Adjust rate limits based on usage
6. Use a reverse proxy (nginx/Apache)
7. Set `NODE_ENV=production`

## Deployment

This server can be deployed to:
- Railway
- Render
- Heroku
- Digital Ocean
- AWS/Azure/GCP
- Any Node.js hosting platform

Make sure to set environment variables on your hosting platform!
