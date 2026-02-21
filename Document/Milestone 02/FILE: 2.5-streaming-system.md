Streaming System

Milestone-02 introduces a real-time streaming system that enables CompareAI to display model responses token-by-token as they are generated.

This replaces the static response model used in Milestone-01 and allows users to observe response generation speed, compare model responsiveness, and evaluate models dynamically.

The streaming system is implemented across three layers:

• AI Provider → Backend
• Backend → Frontend
• Frontend → User Interface

This creates a continuous real-time response pipeline.

Purpose of Streaming System

The streaming system enables:

• Real-time display of model responses
• Accurate latency measurement
• Live comparison of response speed
• Immediate visual feedback
• Improved user experience
• Dynamic ranking and evaluation

Without streaming, responses would appear only after full completion, preventing real-time comparison.

Streaming Architecture Overview

Streaming flow sequence:

User enters prompt
↓
Frontend sends streaming request to backend
↓
Backend connects to AI provider streaming API
↓
Provider streams tokens to backend
↓
Backend forwards tokens to frontend immediately
↓
Frontend appends tokens to response display
↓
Backend completes evaluation and sends metrics
↓
Frontend updates ranking and winner

This pipeline ensures continuous data flow.

Backend Streaming Implementation

Streaming endpoint:

POST /ai/query-stream

Location:

/backend/src/ai/ai.controller.ts

The backend establishes a streaming connection with AI providers using their streaming APIs.

Backend streaming headers:

Content-Type: application/json
Transfer-Encoding: chunked
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no

These headers ensure immediate delivery of tokens without buffering.

Provider Streaming Integration

The backend integrates with provider streaming APIs.

Supported streaming providers:

Groq
DeepSeek Chat (OpenRouter)
GLM-5 (OpenRouter)
MiniMax M2.5 (OpenRouter)

Streaming methods implemented:

streamGroq()
streamOpenRouter()
streamModel()

These methods:

• Open streaming connection
• Receive token chunks
• Parse token data safely
• Forward tokens to controller

This enables real-time provider integration.

Streaming Event Protocol

The backend sends structured streaming events to the frontend.

Each event is sent as a JSON object followed by a newline.

Event sequence:

Start Event
Token Event
Complete Event
Error Event

This protocol ensures reliable communication.

Start Event

Sent when streaming begins.

Example:

{
  "type": "start",
  "model": "groq"
}

Purpose:

• Notify frontend that streaming has started
• Update UI loading state

Token Event

Sent for every generated token.

Example:

{
  "type": "token",
  "token": "Kubernetes"
}

Purpose:

• Deliver response content incrementally
• Enable real-time display

Frontend appends tokens to existing response.

Complete Event

Sent when model finishes generating response.

Example:

{
  "type": "complete",
  "model": "groq",
  "success": true,
  "latency": 412,
  "accuracy": 9.2,
  "overallScore": 8.84,
  "speedTier": "fast",
  "length": 842
}

Purpose:

• Provide evaluation metrics
• Enable ranking and winner detection

This event signals completion of streaming.

Error Event

Sent when streaming fails.

Example:

{
  "type": "error",
  "model": "groq",
  "message": "stream failed"
}

Purpose:

• Notify frontend of failure
• Prevent UI instability

Frontend marks model as failed.

Frontend Streaming Implementation

Location:

/frontend/src/App.tsx

Frontend uses Fetch ReadableStream API to receive streaming data.

Streaming logic:

Frontend sends request
↓
Backend streams response
↓
Frontend reads chunks
↓
Frontend parses JSON events
↓
Frontend updates UI incrementally

This enables real-time rendering.

Token Rendering Process

Frontend rendering flow:

Token received
↓
Token appended to response state
↓
React re-renders component
↓
Updated response displayed

This creates live typing effect.

Example:

Before streaming:

Response: ""

During streaming:

Response: "Kubernetes is a container orchestration..."

After completion:

Response: Full response displayed
Independent Streaming per Model

Each model streams independently.

This allows:

Fast models to complete early
Slow models to continue streaming
Ranking updates dynamically

No model blocks another model.

This ensures fair comparison.

Latency Measurement Integration

Streaming enables accurate latency measurement.

Latency is measured at backend:

latency = firstTokenTime − requestStartTime

Streaming makes this measurement possible.

Without streaming, latency measurement would be inaccurate.

Streaming Safety and Reliability

The streaming system includes safety features.

Backend safety:

• Structured event protocol
• Safe token parsing
• Error detection
• Stream termination handling

Frontend safety:

• Incremental parsing
• Failure handling
• State isolation per model

This prevents UI corruption.

Advantages Over Static Response System

Milestone-01 system:

Static response returned after completion
No real-time updates
No latency measurement
Limited comparison capability

Milestone-02 streaming system:

Real-time response display
Accurate latency measurement
Live comparison capability
Immediate user feedback
Dynamic ranking integration

Streaming significantly enhances platform capability.

Streaming System Production Status

Streaming system is production-grade and stable.

Capabilities:

✓ Real-time token streaming
✓ Multi-provider streaming integration
✓ Structured streaming protocol
✓ Safe streaming error handling
✓ Independent model streaming
✓ Stable frontend rendering

Status:

Production Stable