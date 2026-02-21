System Architecture

Architecture Type: Distributed Multi-Provider Real-Time Streaming and Evaluation Platform

Milestone-02 introduces a production-grade streaming architecture that enables real-time token delivery, latency measurement, automated scoring, and dynamic model ranking.

The system consists of three primary layers:

• Frontend (React + TypeScript)
• Backend (NestJS orchestration and evaluation layer)
• AI Provider APIs (Groq, OpenRouter, and others)

Each layer has clearly defined responsibilities and communicates using HTTP streaming protocols.

High-Level Architecture Flow

The overall system flow in Milestone-02 is as follows:

Browser (User Interface)
↓
Frontend (React Application)
↓
Backend (NestJS Streaming and Evaluation Layer)
↓
AI Provider APIs
↓
Backend receives streaming tokens
↓
Backend evaluates accuracy and calculates score
↓
Backend streams structured events to frontend
↓
Frontend renders responses and ranks models in real time

This architecture allows simultaneous streaming, evaluation, and comparison of multiple AI models.

System Components Overview

The system consists of three main components.

1. Frontend Layer

Location:

/frontend

Framework:

React + TypeScript + Vite

Responsibilities:

• Accept user prompt input
• Send streaming requests to backend
• Receive streaming tokens from backend
• Render responses in real time
• Display latency and performance metrics
• Rank models dynamically
• Detect and highlight best performing model

The frontend maintains UI state and provides visualization of model performance.

2. Backend Layer

Location:

/backend

Framework:

NestJS + TypeScript

The backend acts as the orchestration and evaluation layer.

Responsibilities:

• Receive prompt requests from frontend
• Route prompt to appropriate AI provider
• Establish streaming connection with provider
• Receive streaming tokens from provider
• Forward tokens to frontend in real time
• Measure response latency
• Evaluate response accuracy using judge model
• Calculate overall performance score
• Send structured events to frontend
• Detect failures and handle errors safely

The backend enables real-time evaluation and comparison.

3. AI Provider Layer

External AI providers generate responses.

Integrated providers:

Primary providers:

• Groq API
• OpenRouter DeepSeek Chat
• OpenRouter GLM-5
• OpenRouter MiniMax M2.5

Secondary providers:

• Google Gemini (placeholder)
• OpenAI GPT (placeholder)

These providers stream tokens back to the backend.

Streaming Architecture Flow

Milestone-02 introduces real-time streaming between providers, backend, and frontend.

Streaming flow:

User enters prompt
↓
Frontend sends POST request to backend streaming endpoint

POST /ai/query-stream

↓
Backend connects to AI provider using streaming API
↓
Provider streams tokens to backend
↓
Backend forwards tokens to frontend immediately
↓
Frontend displays tokens live
↓
Backend collects full response
↓
Backend evaluates accuracy
↓
Backend calculates performance score
↓
Backend sends completion event
↓
Frontend updates ranking and winner

This enables live response comparison.

Streaming Event Pipeline

Backend sends structured events to frontend.

Event sequence:

Start Event
Indicates model processing has started

Token Event
Contains individual tokens from model response

Complete Event
Contains latency, accuracy, score, and metadata

Error Event
Indicates model failure

This structured protocol allows frontend to update UI incrementally.

Latency Measurement Architecture

Latency is measured at the backend using first token timing.

Measurement method:

Request sent to provider
↓
Backend waits for first token
↓
Backend records timestamp of first token
↓
Latency calculated as:

latency = firstTokenTime − requestStartTime

Latency is used to calculate speedScore and speedTier.

This provides objective speed comparison.

Accuracy Evaluation Architecture

Milestone-02 introduces an automated evaluation layer.

Evaluation flow:

Backend receives full response
↓
Backend sends prompt and response to judge model
↓
Judge model evaluates accuracy
↓
Judge returns accuracy score from 0 to 10
↓
Backend uses score in overall performance calculation

Judge model used:

Groq LLaMA-3.1-8B

This enables objective quality evaluation.

Score Calculation Pipeline

Backend calculates overall model performance score.

Score components:

Accuracy score
Speed score
Length score

Formula:

overallScore =
accuracy × 0.6 +
speedScore × 0.3 +
lengthScore × 0.1

This score determines model ranking.

Real-Time Ranking Architecture

Frontend receives score and metrics from backend.

Frontend performs:

• Metrics animation smoothing
• Dynamic ranking calculation
• Stable display ordering
• Winner detection

Ranking updates automatically as responses complete.

Failure Handling Architecture

Backend detects failure conditions.

Examples:

• Empty response
• Provider API error
• Invalid API key
• Rate limit exceeded

Backend sends failure event.

Frontend marks model as failed and excludes it from ranking.

This ensures stable and accurate comparison.

Communication Protocol

Frontend communicates with backend using HTTP.

Request protocol:

POST /ai/query-stream
Content-Type: application/json

Response protocol:

HTTP chunked transfer encoding
JSON event per line

Backend communicates with providers using provider-specific streaming APIs.

Deployment Architecture (Local Environment)

Current deployment configuration:

Frontend:

http://localhost:5173

Backend:

http://localhost:3001

Communication:

Frontend → Backend → AI Providers

Architectural Improvements from Milestone-01

Milestone-01 architecture:

Frontend → Backend → Provider → Full Response → Frontend

Milestone-02 architecture:

Frontend → Backend → Provider
Provider → Backend → Token Stream → Frontend
Backend → Judge Model → Score Calculation
Frontend → Ranking Engine → Winner Detection

Major improvements introduced:

• Real-time streaming pipeline
• Accuracy evaluation layer
• Scoring and ranking system
• Failure detection layer
• Deterministic comparison pipeline

This significantly enhances system capability.

Architecture Stability and Production Readiness

Milestone-02 architecture is designed for stability and extensibility.

Key architectural strengths:

• Stateless backend request handling
• Independent streaming per model
• Deterministic scoring pipeline
• Clear separation of frontend and backend responsibilities
• Extensible provider integration architecture
• Safe failure handling and recovery

System status:

Production-grade architecture (local deployment)