require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Multer for file uploads (images, PDFs, text files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "text/plain", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

// ─── Helper: call Gemini API ────────────────────────────────────────────────
async function callGemini(model, contents, systemInstruction = null) {
  const body = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Chat with history
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages provided" });

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const reply = await callGemini("gemini-1.5-flash", contents, systemPrompt || null);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summarize text
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, style } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const styleMap = {
      brief: "in 2-3 sentences",
      bullets: "as a bullet-point list",
      detailed: "in a detailed paragraph",
    };
    const instruction = `Summarize the following text ${styleMap[style] || "concisely"}:\n\n${text}`;
    const contents = [{ role: "user", parts: [{ text: instruction }] }];
    const reply = await callGemini("gemini-1.5-flash", contents);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Code generation / explanation
app.post("/api/code", async (req, res) => {
  try {
    const { prompt, mode, language } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    let instruction;
    if (mode === "explain") {
      instruction = `Explain the following code clearly:\n\n${prompt}`;
    } else if (mode === "fix") {
      instruction = `Find and fix bugs in the following code. Show the corrected version with explanation:\n\n${prompt}`;
    } else {
      instruction = `Write ${language || "code"} for the following: ${prompt}. Include comments.`;
    }

    const contents = [{ role: "user", parts: [{ text: instruction }] }];
    const reply = await callGemini("gemini-1.5-flash", contents);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image analysis
app.post("/api/vision", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const imageData = fs.readFileSync(req.file.path);
    const base64 = imageData.toString("base64");
    const mimeType = req.file.mimetype;

    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt || "Describe this image in detail." },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ];

    const reply = await callGemini("gemini-1.5-flash", contents);
    fs.unlinkSync(req.file.path); // Clean up
    res.json({ reply });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Translate text
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) return res.status(400).json({ error: "Missing text or target language" });

    const contents = [
      {
        role: "user",
        parts: [{ text: `Translate the following text to ${targetLanguage}. Only return the translation:\n\n${text}` }],
      },
    ];
    const reply = await callGemini("gemini-1.5-flash", contents);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", model: "gemini-1.5-flash" }));

// Catch-all → serve frontend
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`🚀 Gemini AI Assistant running on http://localhost:${PORT}`));
