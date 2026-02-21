Ranking System

Milestone-02 introduces a real-time ranking system that automatically orders AI models based on their performance scores.

The ranking system ensures that the best performing model appears first, allowing users to immediately identify which model produced the highest quality and fastest response.

The ranking system operates dynamically and updates automatically as model responses complete.

Purpose of the Ranking System

The ranking system enables:

• Automatic ordering of models based on performance
• Objective comparison using calculated scores
• Real-time ranking updates
• Identification of best performing model
• Stable and deterministic display ordering

Without a ranking system, users would have to manually analyze each response.

Ranking Criteria

Models are ranked using the overallScore calculated by the backend scoring system.

Primary ranking factor:

overallScore

Higher overallScore results in higher ranking.

Example:

Model A overallScore = 9.2 → Rank 1
Model B overallScore = 8.8 → Rank 2
Model C overallScore = 7.4 → Rank 3
Model D overallScore = 6.1 → Rank 4

This ensures objective ranking.

Ranking Calculation Location

Frontend implementation:

/frontend/src/App.tsx

Ranking logic uses metrics received from backend complete events.

Ranking is calculated using animatedMetrics.overallScore to ensure smooth UI transitions.

Example logic:

Highest overallScore → Rank 1
Second highest overallScore → Rank 2
Third highest overallScore → Rank 3

Ranking updates automatically when metrics change.

Real-Time Ranking Behavior

Ranking updates dynamically as models complete their responses.

Example sequence:

Step 1 — All models loading

Groq      → loading
DeepSeek  → loading
GLM-5     → loading
MiniMax   → loading

No ranking assigned yet.

Step 2 — First model completes

Groq overallScore = 8.9 → Rank 1
Others still loading

Step 3 — Second model completes with higher score

DeepSeek overallScore = 9.3 → Rank 1
Groq overallScore = 8.9 → Rank 2
Others loading

Ranking updates immediately.

Display Order Priority System

The frontend uses a structured display priority system.

Models are grouped in the following order:

1. Successful models (sorted by overallScore)
2. Loading models
3. Failed models
4. Secondary models (inactive)

This ensures consistent and meaningful display order.

Example display order:

Rank 1 → DeepSeek (success)
Rank 2 → Groq (success)
Rank 3 → GLM-5 (loading)
Rank 4 → MiniMax (loading)
Rank 5 → Gemini (secondary)
Rank 6 → OpenAI (secondary)

This provides clear visual hierarchy.

Ranking State Management

Ranking state is stored in frontend displayOrder state.

Location:

/frontend/src/App.tsx

Structure:

displayOrder = [
  model1,
  model2,
  model3,
  model4
]

This state controls visual ordering of model cards.

Display order updates automatically when metrics or status changes.

Ranking Badge Display

Each model card displays its current rank using a rank badge.

Example:

#1 → Best performing model
#2 → Second best model
#3 → Third best model

This badge updates dynamically.

Example UI:

Groq        #2
DeepSeek    #1
GLM-5       #3
MiniMax     #4

This provides clear ranking visualization.

Ranking Stability System

Milestone-02 implements several mechanisms to ensure ranking stability.

Stability features include:

• Deterministic score calculation
• No random ranking
• Ranking updates only when metrics change
• Failed models excluded from ranking
• Loading models separated from completed models

This prevents ranking instability.

Animated Ranking Transitions

Ranking transitions are animated smoothly using the animation system.

Animation techniques used:

Spring animation
FLIP animation

This prevents sudden UI jumps.

Example transition:

Before:

Rank 1 → Groq
Rank 2 → DeepSeek

After DeepSeek finishes with higher score:

Rank 1 → DeepSeek
Rank 2 → Groq

Card movement is animated smoothly.

Ranking Integration with Streaming System

The ranking system integrates directly with the streaming and scoring systems.

Integration flow:

Model streams response
↓
Backend calculates overallScore
↓
Frontend receives complete event
↓
Frontend updates metrics state
↓
Frontend recalculates ranking
↓
Frontend updates display order

This ensures real-time ranking.

Failed Model Handling in Ranking

Failed models are handled safely.

Failure behavior:

status = failed
overallScore = 0

Failed models are placed below successful models.

Example:

Rank 1 → Groq (success)
Rank 2 → DeepSeek (success)
Rank 3 → GLM-5 (failed)
Rank 4 → MiniMax (failed)

Failed models do not interfere with ranking.

Secondary Model Handling

Secondary models (Gemini, OpenAI) are displayed separately.

Secondary models:

Gemini
OpenAI

These models appear below primary models and do not affect ranking.

This ensures ranking integrity.

Ranking System Improvements from Milestone-01

Milestone-01:

No ranking system
Static display order
Manual comparison required

Milestone-02:

Automatic ranking
Dynamic ranking updates
Objective performance comparison
Winner identification
Animated ranking transitions

This significantly improves usability.

Ranking System Determinism

The ranking system is fully deterministic.

Ranking depends only on:

overallScore
accuracy
latency
lengthScore

No randomness is involved.

This ensures consistent and reliable ranking.

Ranking System Production Status

The ranking system is production-grade and stable.

Capabilities:

✓ Real-time ranking
✓ Dynamic ranking updates
✓ Stable ranking logic
✓ Failed model handling
✓ Animated ranking transitions
✓ Winner integration

Status:

Production Stable