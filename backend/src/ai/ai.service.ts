import { Injectable } from "@nestjs/common";
import { httpClient } from "../common/http-client";

@Injectable()
export class AiService {

private get groqKey(): string {
  return process.env.GROQ_API_KEY || "";
}

private get openrouterKey(): string {
  return process.env.OPENROUTER_API_KEY || "";
}


  /* =========================================================
     FORMAT HELPER
     ========================================================= */

  private format(text?: string): string {

    if (!text) return "No response";

    return text.trim();

  }


  /* =========================================================
     UNIFIED QUERY ROUTER (NEW)
     Controller now calls THIS method
     ========================================================= */

  async queryModel(
    prompt: string,
    model: string
  ): Promise<string> {

    switch (model) {

      case "groq":
        return this.queryGroq(prompt);

      case "aurora":
        return this.queryAurora(prompt);

      case "glm":
        return this.queryGLM(prompt);

      case "minimax":
        return this.queryMiniMax(prompt);

      case "gemini":
        return this.queryGemini(prompt);

      case "openai":
        return this.queryOpenAI(prompt);

      default:
        return "Invalid model";

    }

  }


  /* =========================================================
     UNIFIED STREAM ROUTER (CRITICAL NEW METHOD)
     Controller now calls THIS method
     ========================================================= */

  async streamModel(
    prompt: string,
    model: string,
    onToken: (token: string) => void
  ): Promise<void> {

    switch (model) {

      case "groq":

        await this.streamGroq(
          prompt,
          onToken
        );

        break;


      case "aurora":

        await this.streamOpenRouter(
          prompt,
          "deepseek/deepseek-chat",
          onToken
        );

        break;


      case "glm":

        await this.streamOpenRouter(
          prompt,
          "z-ai/glm-5",
          onToken
        );

        break;


      case "minimax":

        await this.streamOpenRouter(
          prompt,
          "minimax/minimax-01",
          onToken
        );

        break;


      case "gemini":
      return;

      case "openai":
      return;




      default:

        onToken("Invalid model.");

    }

  }


  /* =========================================================
     GROQ QUERY
     ========================================================= */

  async queryGroq(prompt: string): Promise<string> {

    try {

      const res: any = await httpClient.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqKey}`
          }
        }
      );

      return this.format(
        res?.data?.choices?.[0]?.message?.content
      );

    }
    catch {

      return "Groq unavailable";

    }

  }


  /* =========================================================
     AURORA QUERY
     ========================================================= */

  async queryAurora(prompt: string): Promise<string> {

  try {

    const res: any = await httpClient.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 512
      },
      {
        headers: {
          Authorization: `Bearer ${this.openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5174",
          "X-Title": "CompareAI"
        }
      }
    );

    return this.format(
      res?.data?.choices?.[0]?.message?.content
    );

  }
  catch {

    return "DeepSeek unavailable";

  }

}



  /* =========================================================
     GLM QUERY
     ========================================================= */

  async queryGLM(prompt: string): Promise<string> {

    try {

      const res: any = await httpClient.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "z-ai/glm-5",
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 512
        },
        {
          headers: {
            Authorization: `Bearer ${this.openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5174",
            "X-Title": "CompareAI"
          }
        }
      );

      return this.format(
        res?.data?.choices?.[0]?.message?.content
      );

    }
    catch {

      return "GLM unavailable";

    }

  }


  /* =========================================================
     MINIMAX QUERY
     ========================================================= */

  async queryMiniMax(prompt: string): Promise<string> {

    try {

      const res: any = await httpClient.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "minimax/minimax-m2.5",
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 512
        },
        {
          headers: {
            Authorization: `Bearer ${this.openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5174",
            "X-Title": "CompareAI"
          }
        }
      );

      return this.format(
        res?.data?.choices?.[0]?.message?.content
      );

    }
    catch {

      return "MiniMax unavailable";

    }

  }


  /* =========================================================
     GEMINI
     ========================================================= */

  async queryGemini(prompt: string): Promise<string> {

    return "Gemini not active";

  }


  /* =========================================================
     OPENAI
     ========================================================= */

  async queryOpenAI(prompt: string): Promise<string> {

    return "OpenAI not active";

  }


  /* =========================================================
     GROQ STREAM
     ========================================================= */

  async streamGroq(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "user", content: prompt }
          ],
          stream: true
        })
      }
    );

    if (!response.body)
      return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {

      const { done, value } =
        await reader.read();

      if (done)
        break;

      const chunk =
        decoder.decode(value);

      const lines =
        chunk.split("\n");

      for (const line of lines) {

        if (!line.startsWith("data:"))
          continue;

        const json =
          line.replace("data:", "").trim();

        if (json === "[DONE]")
          return;

        try {

          const parsed =
            JSON.parse(json);

          const token =
            parsed?.choices?.[0]?.delta?.content;

          if (token)
            onToken(token);

        }
        catch {}

      }

    }

  }


  /* =========================================================
     OPENROUTER STREAM
     ========================================================= */

  async streamOpenRouter(
  prompt: string,
  model: string,
  onToken: (token: string) => void
): Promise<void> {
  // console.log("OPENROUTER KEY VALUE:", this.openrouterKey);
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5174",
        "X-Title": "CompareAI"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true,
        max_tokens: 512
      })
    }
  );

  /* ================= FIX 1: HANDLE HTTP ERRORS ================= */

  if (!response.ok) {

    const errorText = await response.text();

    console.error(
      "OpenRouter HTTP error:",
      response.status,
      errorText
    );

    return;

  }

  /* ================= FIX 2: HANDLE EMPTY BODY ================= */

  if (!response.body) {

    console.error("OpenRouter returned empty body");

    return;

  }

  const reader = response.body.getReader();

  const decoder = new TextDecoder();

  let fullChunk = "";

  while (true) {

    const { done, value } =
      await reader.read();

    if (done)
      break;

    fullChunk += decoder.decode(value);

    const lines =
      fullChunk.split("\n");

    /* keep last partial line */
    fullChunk = lines.pop() || "";

    for (const line of lines) {

      if (!line.startsWith("data:"))
        continue;

      const json =
        line.replace("data:", "").trim();

      if (json === "[DONE]")
        return;

      try {

        const parsed =
          JSON.parse(json);

        const token =
          parsed?.choices?.[0]?.delta?.content;

        if (token)
          onToken(token);

      }
      catch (err) {

        console.error(
          "OpenRouter parse error:",
          err
        );

      }

    }

  }

}


/* =========================================================
   ACCURACY JUDGE — GROQ (FREE, FAST, RELIABLE)
   ========================================================= */

async judgeAccuracy(
  prompt: string,
  response: string
): Promise<number> {

  try {

    const res: any =
      await httpClient.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",

          temperature: 0,

          max_tokens: 10,

          messages: [

            {
              role: "system",
              content:
                `You are an expert AI evaluator.

Score the response accuracy compared to the prompt.

Score from 0 to 10.

Rules:
- 10 = perfect, correct, complete
- 7-9 = mostly correct
- 4-6 = partially correct
- 1-3 = mostly wrong
- 0 = completely wrong

Return ONLY the number.
No explanation.
No text.`
            },

            {
              role: "user",
              content:
                `PROMPT:
${prompt}

RESPONSE:
${response}

ACCURACY SCORE:`
            }

          ]
        },

        {
          headers: {
            Authorization: `Bearer ${this.groqKey}`,
            "Content-Type": "application/json"
          }
        }
      );


    const raw =
      res?.data?.choices?.[0]?.message?.content
        ?.trim() || "";


    const match =
      raw.match(/[0-9]+(\.[0-9]+)?/);


    if (!match)
      return 5; // neutral fallback


    const score =
      parseFloat(match[0]);


    return Math.min(
      10,
      Math.max(0, score)
    );

  }

  catch (err) {

    console.error(
      "Groq judge failed:",
      err?.message
    );

    return 5; // safe neutral fallback

  }

}






}
