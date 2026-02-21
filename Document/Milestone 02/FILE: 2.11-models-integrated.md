Models Integrated

Milestone-02 integrates multiple AI providers into CompareAI using a unified streaming and evaluation architecture.

Each model is connected through the backend orchestration layer and supports real-time streaming, latency measurement, accuracy evaluation, and ranking.

The integration architecture is designed to be extensible, allowing additional models to be added easily in future milestones.

Integration Architecture

All models are integrated through the backend routing system.

Location:

/backend/src/ai/ai.service.ts

Routing method:

streamModel(prompt, model, onToken)

This method routes the request to the correct provider streaming handler.

Each model streams independently.

This ensures fair and parallel comparison.

Model Categories

Models are divided into two categories:

Primary Models
Secondary Models

Primary models are fully active and participate in streaming, scoring, and ranking.

Secondary models are placeholders and do not participate in streaming or ranking.

Primary Models (Active)

These models are fully integrated and production active.

They support:

• Real-time streaming
• Latency measurement
• Accuracy evaluation
• Score calculation
• Ranking
• Winner detection

1. Groq LLaMA-3.1

Provider:

Groq

Website:

https://console.groq.com

API Endpoint:

https://api.groq.com/openai/v1/chat/completions

Model used:

llama-3.1-8b-instant

Integration method:

streamGroq()

Capabilities:

Real-time streaming supported
Accuracy judge model also uses Groq

Groq is used as both primary model and judge model.

2. DeepSeek Chat (via OpenRouter)

Provider:

OpenRouter

Website:

https://openrouter.ai

API Endpoint:

https://openrouter.ai/api/v1/chat/completions

Model used:

deepseek/deepseek-chat

Integration method:

streamOpenRouter()

DeepSeek replaces Aurora Alpha used in Milestone-01.

Capabilities:

Streaming supported
Full scoring and ranking supported

3. GLM-5

Provider:

OpenRouter

Website:

https://openrouter.ai

Model used:

z-ai/glm-5

Integration method:

streamOpenRouter()

Capabilities:

Streaming supported
Full scoring supported

4. MiniMax M2.5

Provider:

OpenRouter

Website:

https://openrouter.ai

Model used:

minimax/minimax-m2.5

Integration method:

streamOpenRouter()

Capabilities:

Streaming supported
Full scoring supported

Secondary Models (Inactive Placeholders)

These models are integrated structurally but currently inactive.

They appear in UI but do not participate in streaming or ranking.

This allows easy activation in future milestones.

5. Google Gemini

Provider:

Google AI Studio

Website:

https://ai.google.dev

Status:

Inactive (placeholder)

Streaming:

Not enabled

Integration method:

Placeholder routing implemented.

6. OpenAI GPT

Provider:

OpenAI

Website:

https://platform.openai.com

Status:

Inactive (placeholder)

Streaming:

Not enabled

Integration method:

Placeholder routing implemented.

Judge Model Integration

Milestone-02 introduces a dedicated judge model for accuracy evaluation.

Judge model:

Groq LLaMA-3.1-8B

Location:

/backend/src/ai/ai.service.ts → judgeAccuracy()

Purpose:

Evaluate response accuracy objectively.

Judge model does not appear in frontend comparison.

It operates internally.

Model Streaming Architecture

Streaming pipeline:

Frontend sends request
↓
Backend routes to provider
↓
Provider streams tokens
↓
Backend forwards tokens to frontend
↓
Backend evaluates accuracy
↓
Backend calculates score

This process occurs independently for each model.

Model Isolation and Parallel Execution

Each model operates independently.

Benefits:

Failure of one model does not affect others
Streaming occurs in parallel
Ranking updates dynamically

This ensures fair comparison.

Model Configuration Location

Frontend model configuration:

/frontend/src/App.tsx

Backend model routing configuration:

/backend/src/ai/ai.service.ts

This separation ensures maintainability.

Improvements from Milestone-01

Milestone-01:

Static response fetching
No streaming
No scoring
Aurora Alpha used

Milestone-02:

Real-time streaming enabled
Scoring system enabled
Ranking system enabled
DeepSeek Chat replaces Aurora Alpha
Judge model added

This significantly enhances comparison capability.

Model Integration Production Status

Primary models:

Groq → Active
DeepSeek → Active
GLM-5 → Active
MiniMax → Active

Secondary models:

Gemini → Placeholder
OpenAI → Placeholder

Judge model:

Groq LLaMA → Active
Integration Capability Summary

Milestone-02 supports:

✓ Multi-provider streaming
✓ Independent model execution
✓ Accuracy evaluation
✓ Score calculation
✓ Dynamic ranking
✓ Failure isolation

Status:

Production Stable