import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService
  ) {}

  /**
   * Root endpoint
   * Used for basic health check
   */
  @Get()
  getHello(): object {

    return {
      status: "ok",
      service: "CompareAI Backend",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

  }

  /**
   * Health endpoint
   * Used for load balancers, uptime monitoring
   */
  @Get('health')
  health(): object {

    return {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

  }

  /**
   * Ready endpoint
   * Used to verify system ready for benchmarking
   */
  @Get('ready')
  ready(): object {

    return {
      status: "ready",
      aiStreaming: true,
      judgeModel: true,
      providers: {
        groq: true,
        openrouter: true,
        gemini: false,     // adjust based on availability
        openai: false      // adjust based on availability
      },
      timestamp: new Date().toISOString()
    };

  }

}
