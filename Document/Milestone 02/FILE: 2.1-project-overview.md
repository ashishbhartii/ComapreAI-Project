Project Overview

Project Name: CompareAI

Milestone: Milestone 02
Status: Complete
Date: February 2026

Description

CompareAI is a full-stack web platform that allows users to compare responses from multiple AI models in real time.

The platform sends a single user prompt to multiple AI providers simultaneously and displays their responses side-by-side. Milestone-02 introduces real-time streaming, latency measurement, accuracy scoring, and automatic ranking to provide an objective and dynamic comparison experience.

Unlike Milestone-01, which displayed static responses after completion, Milestone-02 enables live streaming of responses, evaluates model quality automatically, and determines the best performing model using a structured scoring system.

Purpose

The purpose of CompareAI is to provide a unified platform for evaluating AI model performance based on multiple objective criteria.

Key evaluation dimensions include:

• Response accuracy
• Response speed (latency)
• Response completeness
• Overall performance score

This allows users to identify which model provides the best answer and which model responds the fastest.

Milestone-01 vs Milestone-02 Evolution

Milestone-01 provided the foundational comparison platform with multi-provider integration and parallel response fetching.

Milestone-02 introduces a production-grade real-time comparison system with automated evaluation and ranking.

Milestone-01 capabilities:

• Multi-provider integration
• Parallel response fetching
• Static response display
• Basic comparison UI
• Extensible backend architecture

Milestone-02 enhancements:

• Real-time streaming responses
• Latency measurement system
• Automatic accuracy evaluation
• Overall score calculation
• Live ranking system
• Winner detection system
• Animated metrics and UI updates
• Failure detection and timeout handling
• Production-grade stability and orchestration

This milestone transforms CompareAI from a static comparison tool into a dynamic AI evaluation platform.

Core Concept

The core workflow of CompareAI in Milestone-02 is as follows:

User enters prompt
↓
Frontend sends streaming request to backend
↓
Backend forwards prompt to multiple AI providers
↓
Providers stream tokens back to backend
↓
Backend forwards tokens to frontend in real time
↓
Frontend displays responses live
↓
Backend evaluates response accuracy
↓
Backend calculates overall performance score
↓
Frontend ranks models dynamically
↓
Frontend determines and displays the best performing model

This enables real-time comparison, ranking, and visualization.

Key Features Introduced in Milestone-02

Milestone-02 introduces several major backend and frontend systems.

Streaming System:

• Real-time token streaming from AI providers
• Independent streaming per model
• Live response rendering in frontend

Latency Measurement System:

• Measures time to first token
• Classifies models based on speed

Accuracy Judge System:

• Automatically evaluates response correctness
• Uses Groq LLaMA evaluator model
• Produces accuracy score from 0 to 10

Score Calculation System:

• Combines accuracy, speed, and completeness
• Produces overallScore used for ranking

Ranking System:

• Dynamically ranks models based on overallScore
• Updates ranking in real time

Winner Detection System:

• Automatically identifies best performing model
• Prevents unstable winner switching
• Displays winner using spotlight animation

Failure Handling System:

• Detects failed responses safely
• Prevents invalid ranking
• Ensures UI stability

Animation and UI System:

• Smooth ranking transitions
• Real-time metrics updates
• Production-grade visual feedback

Technology Stack

Frontend:

• React
• TypeScript
• Vite
• Fetch Streaming API
• ReactMarkdown

Backend:

• NestJS
• TypeScript
• Native Fetch API
• Groq API
• OpenRouter API

Architecture Type:

Distributed multi-provider real-time orchestration platform

Supported AI Providers

Primary providers (active streaming):

• Groq LLaMA-3.1
• DeepSeek Chat (OpenRouter)
• GLM-5 (OpenRouter)
• MiniMax M2.5 (OpenRouter)

Secondary providers (placeholders):

• Google Gemini
• OpenAI GPT

Platform Capabilities After Milestone-02

CompareAI is now capable of:

• Streaming responses in real time
• Measuring response latency
• Evaluating response accuracy automatically
• Calculating objective performance scores
• Ranking models dynamically
• Identifying best performing model
• Handling failures safely
• Maintaining stable and deterministic UI behavior

Production Readiness Status

Milestone-02 achieves production-grade comparison functionality.

Platform status:

Production Stable (Local Environment)

The system now provides a complete real-time AI comparison and evaluation pipeline and is ready for further enhancements in Milestone-03.