Backend Framework: NestJS

Location:
/backend

Core components:

ai.service.ts
Contains provider integration logic

ai.controller.ts
Contains API endpoints

ai.module.ts
Registers service and controller

API Endpoint:

GET /ai/query?prompt=...&model=...

Example:

http://localhost:3000/ai/query?prompt=hello&model=groq

Response:

{
  "response": "Hello! How can I help?"
}

Backend features implemented:

✓ Provider routing
✓ Error handling
✓ Response formatting
✓ Timeout safety
✓ Extensible provider structure
