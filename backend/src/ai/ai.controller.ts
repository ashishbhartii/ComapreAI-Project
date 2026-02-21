import {
  Controller,
  Get,
  Post,
  Res,
  Body
} from '@nestjs/common';

import type { Response } from 'express';

import { AiService } from './ai.service';


/* ================= STREAM EVENT TYPE ================= */

type StreamEvent =
  | { type: "start"; model: string }
  | { type: "token"; token: string }
  | {
      type: "complete";
      model: string;
      success: boolean;
      latency: number | null;
      accuracy: number;
      overallScore: number;
      speedTier: string;
      length: number;
    }
  | {
      type: "error";
      model: string;
      message: string;
    };


@Controller('ai')
export class AiController {

  constructor(
    private readonly aiService: AiService
  ) {}


  /* =====================================================
     STREAM ENDPOINT — FULLY FIXED PRODUCTION VERSION
     ===================================================== */

  @Post('query-stream')
  async stream(
    @Body('prompt') prompt: string,
    @Body('model') model: string,
    @Res() res: Response
  ): Promise<void> {

    /* HEADERS */

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');


    const startTime = Date.now();

    let firstTokenTime: number | null = null;
    let fullText = "";
    let success = false;


    /* SAFE SEND */

    const send = (event: StreamEvent) => {

      res.write(JSON.stringify(event) + "\n");

      const anyRes = res as any;
      if (anyRes.flush) {
        anyRes.flush();
      }

    };


    try {

      /* START */

      send({
        type: "start",
        model
      });


      /* STREAM TOKENS */

      await this.aiService.streamModel(
        prompt,
        model,
        (token: string) => {

          if (!firstTokenTime) {
            firstTokenTime = Date.now();
          }

          fullText += token;

          send({
            type: "token",
            token
          });

        }
      );


      /* ===============================
         PRODUCTION-GRADE SUCCESS CHECK
         =============================== */

      success =
  firstTokenTime !== null &&
  fullText.trim().length > 0 &&
  !this.isFailureResponse(fullText);





      /* ===============================
         LATENCY
         =============================== */

      const latency =
        success && firstTokenTime
          ? firstTokenTime - startTime
          : null;


      /* ===============================
         ACCURACY (ONLY IF SUCCESS)
         =============================== */

      let accuracy = 0;

      if (success) {

        try {

          accuracy =
            await this.aiService.judgeAccuracy(
              prompt,
              fullText
            );

        }
        catch (err) {

          console.error("Judge failed:", err);

          accuracy = 0;

        }

      }


      /* ===============================
         SCORE CALCULATION
         =============================== */

      const length = fullText.length;

      const speedScore =
        latency !== null
          ? Math.max(0, 10 - latency / 400)
          : 0;

      const lengthScore =
        length > 800 ? 10 :
        length > 300 ? 7 :
        length > 100 ? 5 :
        length > 50 ? 3 :
        1;

      const overallScore =
        success
          ? Number(
              (
                accuracy * 0.6 +
                speedScore * 0.3 +
                lengthScore * 0.1
              ).toFixed(2)
            )
          : 0;


      /* ===============================
         SPEED TIER
         =============================== */

      let speedTier = "failed";

      if (success && latency !== null) {

        if (latency < 400) speedTier = "fastest";
        else if (latency < 1000) speedTier = "fast";
        else if (latency < 2000) speedTier = "average";
        else if (latency < 3500) speedTier = "slow";
        else speedTier = "slowest";

      }


      /* DEBUG */

      console.log("STREAM RESULT:", {
        model,
        success,
        latency,
        accuracy,
        overallScore,
        speedTier
      });


      /* FINAL EVENT */

      send({

        type: "complete",

        model,

        success,

        latency,

        accuracy,

        overallScore,

        speedTier,

        length

      });

    }
    catch (error) {

      console.error("Stream error:", error);

      send({
        type: "error",
        model,
        message: "stream failed"
      });

    }

    res.end();

  }


  /* =====================================================
     JUDGE TEST ENDPOINT
     ===================================================== */

  @Get("judge-test")
  async judgeTest() {

    const score =
      await this.aiService.judgeAccuracy(
        "What is capital of France?",
        "Paris is the capital of France."
      );

    console.log("TEST JUDGE SCORE:", score);

    return {
      score
    };

  }


  /* =====================================================
     FAILURE DETECTION
     ===================================================== */

  private isFailureResponse(text: string): boolean {

    if (!text || text.length < 20)
      return true;

    const t = text.toLowerCase().trim();

    const hardFailures = [

      "model not enabled",
      "api key invalid",
      "invalid api key",
      "quota exceeded",
      "rate limit exceeded",
      "unauthorized",
      "access denied",
      "error:",
      "failed"

    ];

    return hardFailures.some(f => t.includes(f));

  }


  /* =====================================================
     PLACEHOLDER DETECTION (CRITICAL FIX)
     ===================================================== */

  private isPlaceholder(text: string): boolean {

    const t = text.toLowerCase().trim();

    const placeholders = [

      "streaming not enabled",
      "not active",
      "not available",
      "coming soon",
      "not implemented",
      "invalid model"

    ];

    return placeholders.some(p => t.includes(p));

  }

}
