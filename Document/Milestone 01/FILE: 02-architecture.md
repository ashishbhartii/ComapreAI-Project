System Architecture

Flow:

Browser
↓
Frontend (React)
↓
Backend (NestJS)
↓
AI Provider APIs

Frontend runs on:
http://localhost:5173

Backend runs on:
http://localhost:3000

Communication pattern:

Frontend → HTTP → Backend → HTTP → AI Providers

Backend responsibilities:

• Route prompt to correct model
• Handle API authentication
• Format response
• Return structured response

Frontend responsibilities:

• Send prompt
• Display results
• Maintain UI state
