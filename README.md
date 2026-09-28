# PathPilot – Career Exploration Website

A full-stack starter website inspired by the supplied PathPilot prototype.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Storage: JSON file (`server/data.json`) for easy local setup
- Icons: lucide-react
- API integration: placeholder endpoint ready for your AI API key

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run

### 1. Install frontend dependencies
Open a terminal in `client`:
```bash
cd client
npm install
```

### 2. Install backend dependencies
Open another terminal:
```bash
cd server
npm install
```

### 3. Start backend
```bash
npm run dev
```

Backend runs on http://localhost:5000

### 4. Start frontend
In the `client` terminal:
```bash
npm run dev
```

Open the URL Vite prints, normally http://localhost:5173

## API key
Do NOT paste your API key into source code.

Create:
`server/.env`

Example:
```env
PORT=5000
AI_API_KEY=PASTE_YOUR_KEY_HERE
```

The exact AI provider/model can be connected in `server/src/routes/ai.js`.

## Implemented
- Sidebar navigation
- Dashboard matching the supplied layout
- Search/filter careers
- Career detail pages
- Simulation list
- Start simulation flow
- Progress tracking
- Skill report
- Resources
- Profile menu
- Notifications
- Backend APIs
- Persistent local progress in JSON
- Responsive layout
- AI-ready backend route

## Note
The supplied image defines the visual reference for the dashboard. Where behavior was not visible in the image, practical demo behavior has been implemented so the project works end-to-end.
