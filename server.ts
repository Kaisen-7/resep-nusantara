import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

const port = 3000;
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  app.use(express.json());

  // Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env or .env.local file." 
        });
      }

      const { message, history } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are the Nusa Culinary AI, an expert in Indonesian archipelago cuisine (Masakan Nusantara). 
          Your goal is to help users with recipes, ingredient substitutes, and traditional cooking techniques.
          
          FORMATTING RULES:
          1. Use clear Markdown formatting.
          2. When providing a recipe, ALWAYS use this structure:
             - ## [Recipe Name]
             - **Description**: (brief overview)
             - ### Ingredients
               - (Use bullet points for ingredients)
             - ### Instructions
               - (Use numbered lists for steps)
             - ### Tips & Tricks
          3. Use **bold** for emphasis on ingredients or key techniques.
          4. Keep your tone friendly, helpful, and passionate about Indonesian food culture.
          5. If asked about non-food topics, politely steer the conversation back to Indonesian culinary arts.`,
        },
        history: history || [],
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to get response from AI" });
    }
  });

  // Vite or Static Assets
  if (!isProd) {
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

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
