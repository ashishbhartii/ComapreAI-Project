Milestone-02 introduces a production-grade backend capable of real-time streaming, latency measurement, automatic accuracy evaluation, score calculation, and structured event delivery to the frontend.

The backend serves as the orchestration layer between the frontend and multiple AI providers.

Backend Responsibilities

The backend performs the following core functions:

• Receive prompt requests from frontend
• Route prompt to appropriate AI provider
• Establish streaming connection with provider
• Receive streaming tokens from provider
• Forward tokens to frontend in real time
• Measure latency of each model
• Evaluate accuracy of model responses
• Calculate overall performance score
• Send structured streaming events to frontend
• Detect failures and handle errors safely

This allows the frontend to display responses live and rank models dynamically.

Backend Module Structure

Location:

/backend/src/

Key components:

ai.controller.ts
ai.service.ts
ai.module.ts
app.controller.ts
app.service.ts

Each file has a clearly defined responsibility.

ai.controller.ts

Location:

/backend/src/ai/ai.controller.ts

This controller implements the streaming endpoint and evaluation pipeline.

Responsibilities:

• Handle streaming API requests
• Initiate model streaming
• Measure latency
• Collect full response text
• Evaluate accuracy using judge model
• Calculate overall performance score
• Send structured events to frontend
• Handle streaming errors safely

This file coordinates the full lifecycle of model evaluation.

Streaming Endpoint

Milestone-02 introduces a streaming endpoint that replaces the static response endpoint from Milestone-01.

Endpoint:

POST /ai/query-stream

Example request:

http://localhost:3001/ai/query-stream

Request body:

{
  "prompt": "Explain Kubernetes",
  "model": "groq"
}

This endpoint streams model responses in real time.

Streaming Protocol

The backend uses HTTP chunked transfer encoding to stream events incrementally.

Response headers:

Content-Type: application/json
Transfer-Encoding: chunked
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no

These headers ensure immediate delivery of streaming tokens.

Streaming Event Types

The backend sends structured events as newline-separated JSON objects.

This allows the frontend to process streaming data safely.

Start Event

Sent when model processing begins.

Example:

{
  "type": "start",
  "model": "groq"
}

Purpose:

• Notify frontend that model has started processing
• Update UI loading state

Token Event

Sent for every generated token.

Example:

{
  "type": "token",
  "token": "Kubernetes"
}

Purpose:

• Enable real-time rendering
• Provide live typing effect

Tokens continue until response is complete.

Complete Event

Sent when response generation finishes.

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

This event contains all performance metrics required for ranking.

Field descriptions:

success
Indicates whether model responded successfully

latency
Time in milliseconds to receive first token

accuracy
Accuracy score evaluated by judge model

overallScore
Final performance score used for ranking

speedTier
Speed classification

length
Response size in characters

Error Event

Sent when model streaming fails.

Example:

{
  "type": "error",
  "model": "groq",
  "message": "stream failed"
}

Purpose:

• Notify frontend of failure
• Prevent UI from hanging

Provider Routing System

Location:

ai.service.ts

The backend supports multiple AI providers through a unified routing system.

Supported providers:

Primary providers:

groq
aurora (DeepSeek Chat via OpenRouter)
glm (GLM-5 via OpenRouter)
minimax (MiniMax via OpenRouter)

Secondary providers:

gemini
openai

Routing method:

streamModel(prompt, model, onToken)

This abstraction allows easy addition of new providers.

Streaming Provider Integration

Provider streaming methods:

streamGroq()
streamOpenRouter()

These methods:

• Connect to provider streaming API
• Receive streaming tokens
• Parse token data safely
• Forward tokens to controller

This enables real-time response delivery.

Latency Measurement System

Latency is measured using time-to-first-token method.

Calculation:

latency = firstTokenTime − requestStartTime

This provides accurate measurement of model responsiveness.

Latency is used for speed classification and scoring.

Accuracy Judge System

Location:

ai.service.ts → judgeAccuracy()

Milestone-02 introduces automated response accuracy evaluation.

Judge model used:

Groq LLaMA-3.1-8B

Evaluation process:

Backend sends prompt and response to judge model
Judge model returns score between 0 and 10
Backend uses score for performance calculation

Example judge output:

9.4

This provides objective quality evaluation.

Score Calculation System

Backend calculates overall performance score using weighted formula.

Formula:

overallScore =
accuracy × 0.6 +
speedScore × 0.3 +
lengthScore × 0.1

Score components:

Accuracy score
Measures correctness

Speed score
Measures responsiveness

Length score
Measures completeness

This ensures balanced evaluation.

Speed Score Calculation

Formula:

speedScore = max(0, 10 − latency / 400)

Faster responses receive higher scores.

Speed Tier Classification

Latency classification:

< 400 ms → fastest
< 1000 ms → fast
< 2000 ms → average
< 3500 ms → slow
> 3500 ms → slowest

This classification is displayed in frontend UI.

Failure Detection System

Backend detects failure conditions automatically.

Failure conditions include:

• Empty response
• Provider errors
• Invalid API key
• Rate limit exceeded
• Quota exceeded
• Unauthorized access

Failed responses are marked:

success: false
overallScore: 0

This prevents invalid ranking.

Health Monitoring Endpoints

Location:

/backend/src/app.controller.ts

Endpoints available:

GET /
GET /health
GET /ready

Example response:

{
  "status": "healthy",
  "uptime": 382.21,
  "timestamp": "2026-02-21T08:32:11.224Z"
}

These endpoints are used for monitoring and deployment readiness.

Backend Improvements from Milestone-01

Milestone-01 backend:

• Static response fetching
• No streaming
• No latency measurement
• No scoring

Milestone-02 backend:

• Real-time streaming
• Latency measurement
• Accuracy evaluation
• Score calculation
• Structured streaming protocol
• Failure detection
• Production-grade orchestration

This significantly enhances platform capability.

Backend Production Status

The backend is now production-grade and stable.

Capabilities:

✓ Real-time streaming
✓ Multi-provider routing
✓ Accuracy evaluation
✓ Score calculation
✓ Latency measurement
✓ Failure handling
✓ Health monitoring

Status:

Production Stable