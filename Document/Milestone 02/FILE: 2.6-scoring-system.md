Scoring System

Milestone-02 introduces a production-grade scoring system that evaluates AI model performance objectively using multiple measurable criteria.

The scoring system allows CompareAI to rank models based on response quality, speed, and completeness instead of simply displaying responses.

This transforms CompareAI from a basic comparison tool into an automated AI evaluation platform.

Purpose of the Scoring System

The scoring system enables:

• Objective evaluation of model performance
• Automatic ranking of models
• Identification of best performing model
• Comparison based on measurable metrics
• Elimination of subjective bias

Without scoring, comparison would rely entirely on manual user judgment.

Scoring Pipeline Overview

The scoring process follows this sequence:

Model generates response
↓
Backend measures latency
↓
Backend collects full response
↓
Backend evaluates accuracy using judge model
↓
Backend calculates speed score
↓
Backend calculates length score
↓
Backend calculates overallScore
↓
Backend sends score to frontend
↓
Frontend ranks models

This pipeline ensures consistent and deterministic evaluation.

Score Components

The overall score is calculated using three components:

Accuracy Score
Speed Score
Length Score

Each component represents a different aspect of model performance.

Accuracy Score

Accuracy measures how correct and relevant the model response is relative to the prompt.

Accuracy range:

0 to 10

Higher accuracy indicates better response quality.

Accuracy is evaluated using an automated judge model.

Accuracy Judge System

Location:

/backend/src/ai/ai.service.ts

Method:

judgeAccuracy(prompt, response)

Judge model used:

Groq LLaMA-3.1-8B

Evaluation process:

Backend sends prompt and response to judge model
Judge model evaluates correctness
Judge model returns accuracy score

Example judge output:

9.4

Fallback behavior:

If judge fails, backend assigns neutral score:

5

This ensures system stability.

Latency Measurement

Latency measures how quickly a model begins responding.

Latency definition:

latency = firstTokenTime − requestStartTime

Measured in milliseconds.

Example:

412 ms

Lower latency indicates faster response speed.

Latency measurement is enabled by the streaming system.

Speed Score Calculation

Speed score is derived from latency.

Formula:

speedScore = max(0, 10 − latency / 400)

Examples:

Latency: 200 ms → speedScore ≈ 9.5
Latency: 800 ms → speedScore ≈ 8.0
Latency: 2000 ms → speedScore ≈ 5.0
Latency: 4000 ms → speedScore ≈ 0

This rewards faster models.

Speed Tier Classification

Models are also categorized into speed tiers.

Speed tiers:

< 400 ms → fastest
< 1000 ms → fast
< 2000 ms → average
< 3500 ms → slow
> 3500 ms → slowest

Speed tier is displayed in frontend UI.

Length Score Calculation

Length score evaluates completeness of response.

Longer, more complete responses receive higher scores.

Length score tiers:

> 800 characters → score 10
> 300 characters → score 7
> 100 characters → score 5
> 50 characters → score 3
≤ 50 characters → score 1

This discourages incomplete responses.

Overall Score Formula

The final overallScore combines all components using weighted formula.

Formula:

overallScore =
accuracy × 0.6 +
speedScore × 0.3 +
lengthScore × 0.1

Weight distribution:

Accuracy: 60% importance
Speed: 30% importance
Completeness: 10% importance

Accuracy has highest priority because correctness is most important.

Example Score Calculation

Example model metrics:

accuracy = 9.0
latency = 400 ms
lengthScore = 7

Speed score calculation:

speedScore = 10 − (400 / 400)
speedScore = 9.0

Overall score calculation:

overallScore =
9.0 × 0.6 +
9.0 × 0.3 +
7 × 0.1

overallScore =
5.4 + 2.7 + 0.7

overallScore = 8.8

This score is used for ranking.

Failure Score Handling

If model fails, score is set to:

accuracy = 0
overallScore = 0
speedTier = failed

Failed models are excluded from ranking.

This ensures fairness.

Backend Implementation Location

Score calculation is implemented in:

/backend/src/ai/ai.controller.ts

Key responsibilities:

• Calculate latency
• Call accuracy judge
• Calculate speedScore
• Calculate lengthScore
• Calculate overallScore
• Send metrics to frontend

This ensures consistent scoring.

Frontend Integration

Frontend receives score via streaming complete event.

Example event:

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

Frontend uses overallScore to rank models.

Advantages of Scoring System

Milestone-01 comparison:

Manual visual comparison
No objective ranking
No accuracy evaluation

Milestone-02 scoring system:

Automated evaluation
Objective ranking
Quantitative performance measurement
Consistent comparison

This significantly improves platform usefulness.

Scoring System Stability and Reliability

The scoring system is designed to be deterministic and stable.

Safety features:

• Accuracy judge fallback
• Failure detection handling
• Deterministic formula
• No random scoring
• Consistent evaluation across models

This ensures reliable ranking.

Scoring System Production Status

The scoring system is production-grade and stable.

Capabilities:

✓ Automated accuracy evaluation
✓ Latency-based speed scoring
✓ Response completeness evaluation
✓ Deterministic score calculation
✓ Stable frontend integration

Status:

Production Stable