import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("Gemini API Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not configured or uses placeholder. Server is running in simulated Study Buddy mode.");
}

// ═══════════════════════════════
// STUDY BUDDY SYSTEM PROMPT
// ═══════════════════════════════
const SYSTEM_INSTRUCTION = `You are Study Buddy, the AI mentor inside the CSS Mentor app. You help aspirants prepare for Pakistan's CSS (Central Superior Services) and PMS (Provincial Management Service) competitive examinations.

Your scope is strictly CSS and PMS exam preparation: compulsory and optional subjects, essay and precis writing, current affairs and general knowledge, past papers and exam patterns, study planning and time management, interview and psychological test preparation, and general motivation/encouragement tied to this exam journey.

Rules you always follow:
1. Stay on topic. If the user asks something unrelated to CSS/PMS preparation, respond exactly with: "I can only guide you regarding CSS and PMS related questions." Do not answer the off-topic question, and do not lecture the user about staying on topic beyond that one line.
2. Never use harsh, blunt, or discouraging language, even when correcting a mistake or delivering hard truths about weak preparation. Be honest but always kind and constructive.
3. Always sound polite, friendly, and encouraging — like a supportive senior who has been through the exam and genuinely wants the aspirant to succeed.
4. Keep answers accurate and exam-relevant. When unsure of a specific FPSC rule, date, or syllabus detail, say so plainly rather than guessing, and suggest the user verify with the official FPSC website.
5. Adapt explanations to the aspirant's level — don't assume prior expertise, but don't be condescending either.
6. Keep responses focused and readable; avoid overwhelming a stressed student with excessively long replies unless they ask for depth.`;

// ═══════════════════════════════
// API ROUTES
// ═══════════════════════════════

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!ai,
    environment: process.env.NODE_ENV || "development"
  });
});

// Streaming Chat Route
app.post("/api/chat/stream", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid request. 'messages' array is required." });
    return;
  }

  // Set appropriate headers for streaming / SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Fallback if Gemini key is missing
  if (!ai) {
    const fallbackAnswers = [
      "Assalam-o-Alaikum! I'm **Study Buddy**, your CSS & PMS guide. 📚\n\nIt looks like my **Gemini API Key** is not set up yet in the server environment, so I'm running in offline demo mode. \n\nOnce configured, I can draft essays, review precis, discuss Current Affairs, and structure your optional subjects syllabus! In the meantime, let's explore your Dashboard or practice setting up your study schedule.",
      "That is an excellent topic for CSS preparation! For essays, remember to structure your thesis statement and outline. (To activate real-time Gemini mentoring, please set your `GEMINI_API_KEY` in the environment settings). Let's keep working hard!",
      "Preparing for Pakistan Affairs or Current Affairs requires a deep understanding of historical contexts and modern foreign policy. (Set your `GEMINI_API_KEY` in secrets to get detailed guidance from me!). Keep studying, success is near!"
    ];

    const randomAnswer = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
    // Stream simulation
    let index = 0;
    const interval = setInterval(() => {
      if (index < randomAnswer.length) {
        // Send a portion
        const chunk = randomAnswer.slice(index, index + 15);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        index += 15;
      } else {
        res.write("data: [DONE]\n\n");
        res.end();
        clearInterval(interval);
      }
    }, 40);

    req.on("close", () => {
      clearInterval(interval);
    });
    return;
  }

  try {
    // Map custom messages to Gemini API Format:
    // role: 'user' | 'model'
    // parts: Array<{ text: string }>
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Call Gemini 2.5 Flash streaming
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error: any) {
    console.error("Gemini stream error:", error);
    const errMessage = `\n\n*(Apologies, my student friend! I ran into an issue connecting to my brain systems: ${error?.message || 'Connection lost'}. Let's try sending that message again!)*`;
    res.write(`data: ${JSON.stringify({ text: errMessage })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// ═══════════════════════════════
// VITE AND STATIC SERVING
// ═══════════════════════════════
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CSS Mentor backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
