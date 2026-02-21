import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  /**
   * ROOT ENDPOINT
   * Used for basic service verification
   * Accessible at: /
   */
  @Get()
  root(): object {

    return {
      status: "ok",
      service: "CompareAI Backend",
      version: "2.0.0",
      environment: process.env.NODE_ENV || "development",
      streaming: true,
      scoring: true,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };

  }


  /**
   * HEALTH ENDPOINT
   * Used by Render, load balancers, uptime monitors
   * Accessible at: /health
   */
  @Get('health')
  health(): object {

    return {
      status: "healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

  }


  /**
   * READY ENDPOINT
   * Used to verify system readiness and provider integration
   * Accessible at: /ready
   */
  @Get('ready')
  ready(): object {

    return {
      status: "ready",
      services: {
        streamingEngine: true,
        scoringEngine: true,
        rankingEngine: true,
        accuracyJudge: true
      },
      providers: {
        groq: !!process.env.GROQ_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY,
        gemini: false,
        openai: false
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    };

  }


  /**
   * VERSION ENDPOINT
   * Useful for debugging and production validation
   * Accessible at: /version
   */
  @Get('version')
  version(): object {

    return {
      name: "CompareAI Backend",
      version: "2.0.0",
      milestone: "Milestone 02",
      features: [
        "Streaming",
        "Latency Measurement",
        "Accuracy Scoring",
        "Ranking System",
        "Winner Detection",
        "Failure Handling"
      ],
      timestamp: new Date().toISOString()
    };

  }

}