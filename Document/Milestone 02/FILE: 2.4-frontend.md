Milestone-02 introduces a production-grade frontend capable of rendering streaming responses in real time, calculating live rankings, displaying performance metrics, and identifying the best performing AI model dynamically.

The frontend is responsible for user interaction, streaming visualization, ranking logic, and performance display.

Frontend Responsibilities

The frontend performs the following core functions:

• Accept user prompt input
• Send streaming requests to backend
• Receive streaming tokens in real time
• Render model responses live
• Display performance metrics (latency, score, accuracy)
• Rank models dynamically
• Detect and display best performing model
• Animate ranking transitions
• Handle model failures safely
• Maintain stable and deterministic UI state

This allows users to visually compare models in real time.

Entry Point

Location:

/frontend/src/App.tsx

This file contains the primary application logic, including:

• Streaming handling
• State management
• Ranking system
• Winner detection system
• Animation system
• UI rendering

It serves as the central controller of frontend behavior.

Frontend Component Architecture

The frontend is implemented as a single-page React application with state-driven rendering.

Core UI components:

Prompt Input Area
Allows user to enter prompt

Model Cards
Displays response from each model

Metrics Panel
Displays performance metrics

Winner Spotlight Overlay
Highlights best performing model

Ranking Badges
Displays rank position of each model

Each component updates automatically based on state changes.

State Management System

The frontend uses React useState and useRef hooks to manage application state.

Primary state variables include:

Prompt State

Stores user input prompt.

Example:

prompt

Response State

Stores streaming response text per model.

Structure:

responses[modelKey]

Each model updates independently.

Metrics State

Stores performance metrics per model.

Structure:

metrics[modelKey] = {
  latency,
  accuracy,
  overallScore,
  speedTier,
  length
}

These metrics are received from backend completion event.

Animated Metrics State

Stores animated values for smooth transitions.

Structure:

animatedMetrics[modelKey]

Used for smooth UI animations without abrupt changes.

Status State

Tracks model status.

Possible values:

idle
loading
success
failed

Used to control UI display and ranking logic.

Display Order State

Controls order of model cards.

Structure:

displayOrder = [model1, model2, model3]

Updated dynamically based on ranking.

Winner State

Tracks best performing model.

Variables:

winnerVisible
winnerGlow
winnerSpotlight
winnerLockRef

Used to ensure stable winner display.

Streaming Integration

Milestone-02 introduces real-time streaming support.

Frontend sends streaming request:

POST /ai/query-stream

Example:

http://localhost:3001/ai/query-stream

Frontend uses ReadableStream API to receive streaming tokens.

Streaming process:

Backend sends token events
Frontend receives token event
Frontend appends token to response
Frontend updates UI immediately

This creates live typing effect.

Streaming Event Handling

Frontend handles four event types.

Start Event

Updates model status to loading.

Token Event

Appends token to response text.

Complete Event

Updates metrics state and status.

Error Event

Marks model as failed.

This allows real-time response visualization.

Ranking System

Frontend ranks models based on overallScore.

Ranking calculation:

highest overallScore → rank 1
second highest → rank 2
third highest → rank 3

Ranking updates dynamically when metrics update.

Display priority:

Success models
Loading models
Failed models
Secondary models

This ensures stable and meaningful ranking.

Winner Detection System

Frontend automatically determines best performing model.

Winner selection criteria:

Model must have:

status = success
overallScore > 0

Highest overallScore becomes winner.

Winner lock system prevents unstable switching.

Winner is displayed using:

Crown indicator
Glow animation
Spotlight overlay

This provides clear visual feedback.

Animation System

Milestone-02 introduces advanced animation system.

Animation techniques used:

Spring Physics Animation

Smooth transition of metrics.

FLIP Animation

Smooth card reordering.

Winner Spotlight Animation

Highlights winning model.

Glow Animation

Visual emphasis on winner.

These animations improve visual clarity and user experience.

Metrics Display System

Frontend displays key performance metrics.

Displayed metrics include:

Latency

Time to first token.

Accuracy

Judge-evaluated score.

Overall Score

Final performance score.

Speed Tier

Speed classification.

These metrics help users evaluate model performance.

Failure Handling

Frontend detects model failures using backend events.

Failure handling behavior:

Model marked as failed
Ranking excludes failed model
UI updates safely

This prevents unstable or incorrect display.

UI Layout Structure

Frontend layout consists of:

Header Section

Displays application title.

Model Card Grid

Displays all model responses.

Metrics Panel

Displays performance table.

Search Input Panel

Allows prompt input.

Winner Spotlight Overlay

Highlights best model.

Layout is responsive and dynamically updated.

Frontend Improvements from Milestone-01

Milestone-01 frontend:

Static response display
No streaming
No ranking
No metrics system
Basic comparison UI

Milestone-02 frontend:

Real-time streaming display
Latency and score visualization
Dynamic ranking system
Winner detection system
Advanced animation system
Production-grade UI stability

This significantly improves usability and comparison accuracy.

Frontend Communication with Backend

Frontend communicates with backend using HTTP streaming.

Request:

POST /ai/query-stream

Response:

HTTP chunked streaming events

Frontend processes events incrementally.

This enables real-time UI updates.

Frontend Production Status

Frontend is production-grade and stable.

Capabilities:

✓ Real-time streaming rendering
✓ Dynamic ranking
✓ Winner detection
✓ Metrics visualization
✓ Stable UI state management
✓ Smooth animation system
✓ Failure handling

Status:

Production Stable