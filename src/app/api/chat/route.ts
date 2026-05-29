import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const { prompt, systemInstruction, history } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Pass systemInstruction to the model configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction || undefined
    });

    let text = "";

    // If history is provided, use startChat
    if (history && Array.isArray(history)) {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      text = result.response.text();
    } else {
      // Otherwise, just a single prompt
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    return new Response(JSON.stringify({ text }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: "Error communicating with AI Copilot" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
