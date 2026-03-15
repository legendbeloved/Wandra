import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Journey, Moment } from "../types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const GeminiService = {
  async generateJournalEntry(journey: Journey): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using a standard stable model
    
    const momentsSummary = (journey.moments || []).map(m => 
      `- ${new Date(m.timestamp || m.captured_at || '').toLocaleTimeString()}: ${m.place_name}, ${m.weather_condition}. ${m.user_mood ? `Mood: ${m.user_mood}.` : ''}`
    ).join('\n');

    const prompt = `
      You are a warm, nostalgic, and intimate travel journal writer. 
      Write a first-person journal entry (3-5 paragraphs) for a journey to ${journey.destination_name}.
      
      Journey Details:
      - Destination: ${journey.destination_name}
      - Started: ${new Date(journey.started_at).toLocaleString()}
      - Moments captured:
      ${momentsSummary}
      
      The tone should be like re-reading a letter from yourself written at the height of a beautiful trip. 
      Focus on the atmosphere, the small details of the places visited, and the feeling of the journey.
      Do not use robotic or overly formal language. Use "I" and speak from the heart.
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
  }
};
