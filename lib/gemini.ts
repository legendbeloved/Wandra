import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const STYLE_PROMPTS = {
  poetic: "You are a warm, literary travel journal writer. Write in first-person past tense. Emotionally evocative, sensory, specific. 3–5 paragraphs of flowing literary prose. No bullet points. No clichés. Make the reader feel like they were there.",
  descriptive: "You are a vivid travel journalist. Write in first-person past tense. Factual but atmospheric. Focus on what happened, where, and when. 3–5 clear paragraphs.",
  brief: "You are writing a short, warm travel log entry. First-person past tense. 2–3 compact paragraphs. Clear and honest. No fluff."
};

import { Journey, Moment } from "@/types";

/**
 * Generates a journal entry using Gemini 1.5 Flash
 */
export async function generateJournalEntry(
  journey: Journey,
  moments: Moment[],
  style: 'poetic' | 'descriptive' | 'brief' = 'poetic'
) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: STYLE_PROMPTS[style] || STYLE_PROMPTS.poetic
  });

  const momentsContext = moments.map(m => (
    `- ${m.captured_at}: Arrived at ${m.place_name || 'unknown location'}. Weather: ${m.weather_condition || 'fair'}, ${m.weather_temp || 'unknown'}°C. ${m.is_key_moment ? ' (Key Moment)' : ''}`
  )).join('\n');

  const prompt = `
    Journal for a journey to ${journey.destination_name}.
    Timeframe: ${journey.started_at} to ${journey.ended_at || 'Present'}.
    
    Moments gathered:
    ${momentsContext}
    
    Write a beautiful journal entry based on these moments.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract first sentence as title
    const firstSentence = text.split(/[.!?]/)[0].trim().slice(0, 100);

    return {
      text,
      title: firstSentence
    };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    console.error("Gemini Error:", error);
    throw error;
  }
}

/**
 * Streaming version of journal generation for real-time UI
 */
export async function* streamJournalEntry(
  journey: Journey,
  moments: Moment[],
  style: 'poetic' | 'descriptive' | 'brief' = 'poetic'
) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: STYLE_PROMPTS[style] || STYLE_PROMPTS.poetic
  });

  const momentsContext = moments.map(m => (
    `- ${m.captured_at}: Arrived at ${m.place_name || 'unknown location'}. Weather: ${m.weather_condition || 'fair'}, ${m.weather_temp || 'unknown'}°C. ${m.is_key_moment ? ' (Key Moment)' : ''}`
  )).join('\n');

  const prompt = `
    Journal for a journey to ${journey.destination_name}.
    Timeframe: ${journey.started_at} to ${journey.ended_at || 'Present'}.
    
    Moments gathered:
    ${momentsContext}
    
    Write a beautiful journal entry based on these moments.
  `;

  try {
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw error;
  }
}
