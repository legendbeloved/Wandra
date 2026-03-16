import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Journey, Moment } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const GeminiService = {
  async generateJournalEntry(journey: Journey, style: 'poetic' | 'descriptive' | 'brief' = 'poetic'): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const momentsSummary = (journey.moments || []).map(m => 
      `- ${new Date(m.timestamp || m.captured_at || '').toLocaleTimeString()}: ${m.place_name}, ${m.weather_condition}. ${m.user_mood ? `Mood: ${m.user_mood}.` : ''}`
    ).join('\n');

    let stylePrompt = '';
    switch (style) {
      case 'poetic':
        stylePrompt = 'Use lush, metaphorical language, focusing on sensory details and emotional resonance. The tone should be like a piece of literature.';
        break;
      case 'descriptive':
        stylePrompt = 'Focus on vivid, objective descriptions of the environment, architecture, and scenery. Capture the precise atmosphere and visual details.';
        break;
      case 'brief':
        stylePrompt = 'Keep it concise and punchy (1-2 short paragraphs). Focus only on the most significant highlights and the overall vibe.';
        break;
    }

    const prompt = `
      You are a specialized travel writer. 
      Write a first-person journal entry for a journey to ${journey.destination_name}.
      
      Style Requirement: ${stylePrompt}

      Journey Details:
      - Destination: ${journey.destination_name}
      - Started: ${new Date(journey.started_at).toLocaleString()}
      - Moments captured:
      ${momentsSummary}
      
      The tone should be warm and nostalgic. Speak from the heart using "I". 
      Avoid robotic language.
    `;

    if (!navigator.onLine) {
      return "I'm offline right now, but I've saved your journey data. Once I'm back online, I'll be able to weave these moments into a beautiful story for you.";
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "The memories are still forming...";
    } catch (error) {
      console.error("Error generating journal:", error);
      return "I tried to write down the memories, but the words escaped me. It was a beautiful journey nonetheless.";
    }
  },

  async suggestMoodTag(journey: Journey): Promise<string> {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            mood: { type: SchemaType.STRING }
          }
        }
      }
    });

    const prompt = `Based on these journey moments, suggest a single-word mood tag (e.g., Adventurous, Calm, Reflective, Joyful, Melancholic, Vibrant):
    ${(journey.moments || []).map(m => (m.place_name || 'Unknown') + " (" + (m.weather_condition || 'Unknown') + ")").join(", ")}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text() || '{"mood": "Reflective"}');
      return data.mood;
    } catch (error) {
      console.error("Error suggesting mood:", error);
      return "Reflective";
    }
  },

  async generatePostcardCaption(journey: Journey): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Create a single, punchy, and highly aesthetic caption (max 15 words) for a travel postcard from ${journey.destination_name}.
      The tone should be "wish you were here" mixed with "capturing a dream".
      Context: ${journey.journal_text || journey.destination_name}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "Finding magic in every step.";
    } catch (error) {
      console.error("Error generating caption:", error);
      return "Wish you were here.";
    }
  },

  async translateJournal(text: string, targetLanguage: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Translate the following travel journal entry into ${targetLanguage}.
      Maintain the original tone, emotional depth, and poetic nuances.
      
      Entry:
      ${text}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || text;
    } catch (error) {
      console.error("Error translating journal:", error);
      return text;
    }
  }
};
