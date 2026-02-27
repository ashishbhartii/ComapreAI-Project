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

  private requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

        // ===============================
      // DAILY USAGE STORE
      // ===============================

      private usageStore = new Map<
        string,
        {
          tokensToday: number;
          costToday: number;
          resetTime: number;
        }
      >();

                // ===============================
        // DAILY LIMIT CONFIG
        // ===============================

        private get DAILY_TOKEN_LIMIT(): number {
          return parseInt(process.env.DAILY_TOKEN_LIMIT || '10000');
        }

        private get DAILY_COST_LIMIT(): number {
          return parseFloat(process.env.DAILY_COST_LIMIT || '0.05');
        }

  constructor(private readonly aiService: AiService) {

    // 🔹 Clean expired IP entries every 60s
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of this.requestCounts.entries()) {
        if (now > entry.resetTime) {
          this.requestCounts.delete(ip);
        }
      }
    }, 60_000);

  }

  /* =====================================================
     STREAM ENDPOINT — FULLY FIXED PRODUCTION VERSION
     ===================================================== */

@Post('query-stream')
  async stream(
    @Body('prompt') prompt: string,
    @Body('model') model: string,
    @Res() res: Response
  ): Promise<void> {

  /* ==============================
     🔒 INPUT VALIDATION SECTION
     ============================== */

  // 1️⃣ Prompt validation
  if (!prompt || prompt.length > 4000) {
    res.status(400).json({
      error: "Prompt too long or empty"
    });
    return;
  }

  // 2️⃣ Model validation
  const allowedModels = [
    "groq",
    "aurora",
    "glm",
    "minimax",
    "gemini",
    "openai"
  ];

  if (!allowedModels.includes(model)) {
    res.status(400).json({
      error: "Invalid model"
    });
    return;
  }
  // ==============================
// 🚨 MANUAL RATE LIMIT
// ==============================

const ip =
  (res.req.headers['x-forwarded-for'] as string) ||
  res.req.socket.remoteAddress ||
  'unknown';

const now = Date.now();
const ttl = parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000;
const limit = parseInt(process.env.RATE_LIMIT_LIMIT || '10');

let entry = this.requestCounts.get(ip);

if (!entry || now > entry.resetTime) {
  entry = {
    count: 1,
    resetTime: now + ttl,
  };
} else {
  entry.count += 1;
}

this.requestCounts.set(ip, entry);

if (entry.count > limit) {
  res.setHeader('Retry-After', process.env.RATE_LIMIT_TTL || '60');
  res.status(429).json({
    error: 'Too many requests',
  });
  return;
}

          // ===============================
      // DAILY USAGE CHECK
      // ===============================

      const usageNow = Date.now();
      const dailyWindow = 24 * 60 * 60 * 1000; // 24h

      let usage = this.usageStore.get(ip);

      if (!usage || usageNow > usage.resetTime) {
        usage = {
          tokensToday: 0,
          costToday: 0,
          resetTime: usageNow + dailyWindow
        };
      }

      if (
        usage.tokensToday >= this.DAILY_TOKEN_LIMIT ||
        usage.costToday >= this.DAILY_COST_LIMIT
      ) {
        res.setHeader('Retry-After', '86400');
        res.status(429).json({
          error: 'Daily usage limit reached'
        });
        return;
      }

      this.usageStore.set(ip, usage);

  /* ==============================
     HEADERS (your existing code)
     ============================== */
    res.status(200);
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
  /* ================= NEW COMPARE ENDPOINT ================= */

@Post('compare')
async compare(
  @Body('prompt') prompt: string,
  @Body('models') models: string[],
  @Res() res: Response
): Promise<void> {

  // ---- VALIDATION ----

  if (!prompt || prompt.length > 4000) {
    res.status(400).json({ error: "Invalid prompt" });
    return;
  }

  if (!Array.isArray(models) || models.length === 0) {
    res.status(400).json({ error: "No models selected" });
    return;
  }

  // ---- RATE LIMIT (ONCE PER COMPARE) ----

  const ip =
    (res.req.headers['x-forwarded-for'] as string) ||
    res.req.socket.remoteAddress ||
    'unknown';

  const now = Date.now();
  const ttl = parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000;
  const limit = parseInt(process.env.RATE_LIMIT_LIMIT || '10');

  let entry = this.requestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + ttl };
  } else {
    entry.count += 1;
  }

  this.requestCounts.set(ip, entry);

  if (entry.count > limit) {
  res.setHeader('Retry-After', process.env.RATE_LIMIT_TTL || '60');
  res.status(429).json({ error: 'Too many requests' });
  return;
}

  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  const send = (data: any) => {
    res.write(JSON.stringify(data) + "\n");
  };

  send({ type: "compare-start", models });

  try {

    await Promise.allSettled(
      models.map(async (model) => {

        let fullText = "";
        const startTime = Date.now();
        let firstTokenTime: number | null = null;

        send({ type: "model-start", model });

        await this.aiService.streamModel(
          prompt,
          model,
          (token: string) => {

            if (!firstTokenTime) {
              firstTokenTime = Date.now();
            }

            fullText += token;

            send({
              type: "model-token",
              model,
              token
            });

          }
        );

        const success =
          firstTokenTime !== null &&
          fullText.trim().length > 0;

        const latency =
          success && firstTokenTime
            ? firstTokenTime - startTime
            : null;

        let accuracy = 0;

        if (success) {
          accuracy = await this.aiService.judgeAccuracy(prompt, fullText);
        }

        const length = fullText.length;
        
                // ===============================
        // TOKEN ESTIMATION
        // ===============================

        const inputTokens = Math.ceil(prompt.length / 4);
        const outputTokens = Math.ceil(fullText.length / 4);
        const totalTokens = inputTokens + outputTokens;

        // ===============================
        // COST ESTIMATION TABLE
        // ===============================

        const costPerToken: Record<string, number> = {
          groq: 0.000002,
          aurora: 0.0000015,
          glm: 0.0000025,
          minimax: 0.000003,
          gemini: 0,
          openai: 0
        };

        const estimatedCost =
          totalTokens *
          (costPerToken[model] || 0);

// ===============================
// ACCUMULATE DAILY USAGE
// ===============================

const currentUsage = this.usageStore.get(ip);

if (currentUsage) {
  currentUsage.tokensToday += totalTokens;
  currentUsage.costToday += estimatedCost;
  this.usageStore.set(ip, currentUsage);
}


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

        let speedTier = "failed";

        if (success && latency !== null) {
          if (latency < 400) speedTier = "fastest";
          else if (latency < 1000) speedTier = "fast";
          else if (latency < 2000) speedTier = "average";
          else if (latency < 3500) speedTier = "slow";
          else speedTier = "slowest";
        }

        send({
          type: "model-complete",
          model,
          success,
          latency,
          accuracy,
          overallScore,
          speedTier,
          length,
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost: Number(estimatedCost.toFixed(6))
        });

      })
    );

    send({ type: "compare-complete" });
    const finalUsage = this.usageStore.get(ip);

    if (finalUsage) {
      send({
        type: "usage-update",
        tokensToday: finalUsage.tokensToday,
        costToday: Number(finalUsage.costToday.toFixed(6)),
        resetTime: finalUsage.resetTime
      });
    }

    res.end();

  } catch {
    send({ type: "compare-error" });
  }
}


}
