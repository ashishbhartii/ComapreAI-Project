Known Limitations

Milestone-02 successfully introduces real-time streaming, scoring, ranking, and winner detection. However, certain limitations remain due to the current architecture, external provider dependencies, and scope boundaries of this milestone.

These limitations do not affect core functionality but represent areas planned for improvement in future milestones.

Infrastructure Limitations
Local Deployment Only

The system is currently deployed in a local development environment.

Frontend:

http://localhost:5173

Backend:

http://localhost:3001

Limitations:

• Not accessible publicly
• No production deployment yet
• No cloud scaling

Future milestone will include cloud deployment.

No Load Balancing

The backend currently runs as a single instance.

Limitations:

• No horizontal scaling
• No load balancer support
• Not optimized for high concurrent users

Future versions will support distributed deployment.

Provider Dependency Limitations

CompareAI relies on third-party AI provider APIs.

Provider-related risks include:

• API downtime
• Rate limits
• Quota exhaustion
• Network latency variability

These factors are outside system control.

Failure handling mitigates these risks safely.

Judge Model Limitations

The accuracy scoring system relies on an AI judge model.

Judge model used:

Groq LLaMA-3.1-8B

Limitations:

• Accuracy score may not be perfectly objective
• Judge model may introduce slight evaluation variance
• Judge model adds additional latency overhead

Despite these limitations, judge evaluation provides consistent automated scoring.

Future milestones may introduce multi-judge evaluation.

No Persistent Storage

Milestone-02 does not include database integration.

Limitations:

• No response history saved
• No ranking history saved
• No performance analytics stored
• No historical reliability tracking

All evaluation occurs in real time only.

Future milestone will introduce database storage.

No User Authentication

The system currently has no authentication layer.

Limitations:

• No user accounts
• No personalized history
• No usage tracking per user

Authentication will be added in future milestones.

No Request Cancellation Support

Once a request begins streaming, it cannot currently be cancelled.

Limitations:

• Backend continues processing even if frontend abandons request
• Unnecessary provider usage possible

Future milestone will introduce cancellation support using AbortController.

Limited Model Coverage

Currently active models:

Groq LLaMA-3.1
DeepSeek Chat
GLM-5
MiniMax M2.5

Inactive placeholder models:

Google Gemini
OpenAI GPT

Limitations:

• Gemini streaming not yet enabled
• OpenAI streaming not yet enabled

Architecture supports easy activation when API access is available.

No Reliability Tracking System

Milestone-02 scoring evaluates only current response.

Limitations:

• No historical reliability score
• No long-term performance tracking
• No consistency evaluation across multiple prompts

Future milestone will include reliability scoring system.

No Advanced Tie-Breaker Logic

Current ranking uses:

overallScore

Tie-breaker logic based on accuracy, latency, or length is not yet implemented.

This rarely affects ranking due to floating-point score precision.

Future milestone will include deterministic tie-breaker hierarchy.

No Token-Level Performance Metrics

Milestone-02 measures latency but does not yet measure:

• Tokens per second
• Throughput rate
• Generation speed consistency

Future milestone will include token throughput metrics.

No Distributed Streaming Architecture

Current streaming architecture is single-backend.

Limitations:

• No distributed streaming nodes
• No streaming queue system

Future architecture may introduce message queues.

Frontend Limitations
No Mobile Optimization

UI is optimized primarily for desktop usage.

Limitations:

• Mobile layout not fully optimized
• Limited small-screen usability

Future milestone will include responsive mobile optimization.

No User-Configurable Model Selection

All models run automatically.

Users cannot yet:

• Enable/disable specific models
• Select preferred models

Future milestone will add model selection controls.

Animation System Limitations

Animation system is optimized for current model count.

Limitations:

• Large number of models may increase rendering load

Future milestone will optimize scaling performance.

No Analytics System

Milestone-02 does not include analytics tracking.

Limitations:

• No usage analytics
• No model performance analytics
• No benchmarking dashboard

Future milestone will introduce analytics system.

Security Limitations

API keys are currently stored in backend environment variables.

Limitations:

• No key rotation system
• No secrets manager integration

Future deployment will integrate secure secrets management.

Summary of Limitations

Milestone-02 limitations are primarily related to production deployment, persistence, and scalability — not core functionality.

Core systems that are fully functional and stable:

• Streaming system
• Latency measurement
• Accuracy scoring
• Ranking system
• Winner detection
• Animation system
• Failure handling

These limitations do not affect real-time comparison capability.

Resolution Plan

These limitations will be addressed in Milestone-03 and later milestones.

Planned improvements include:

• Database integration
• Authentication system
• Production deployment
• Reliability scoring
• Request cancellation
• Expanded provider support
• Analytics dashboard

System Status Summary

Milestone-02 platform status:

Core functionality: Production Stable
Deployment: Local Development
Persistence: Not implemented
Authentication: Not implemented
Scalability: Single instance

Milestone-02 successfully delivers a complete real-time AI comparison and evaluation platform.