import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { journeyData } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a warm, literary travel journal writer. You write in first-person, past tense, as if the traveler themselves is writing about their journey hours after arriving. Your writing is emotionally evocative, specific, and sensory. You notice light, weather, time of day, and the feeling of movement through space. You do not write in bullet points. You write in flowing, literary prose. 3 to 5 paragraphs. Never use generic travel clichés. Make the reader feel like they were there. Carefully parse the following journey data and Write a travel journal entry for this journey:

${journeyData}`;

    const result = await model.generateContentStream(prompt);
    
    // Create a readable stream from the async generator
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate journal." }, { status: 500 });
  }
}
