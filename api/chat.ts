import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

export default async function handler(req: any, res: any) {
  // Only allow POST request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your environment variables." 
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
    return res.status(200).json({ text: result.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message || "Failed to get response from AI" });
  }
}
