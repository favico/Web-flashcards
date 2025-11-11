
import { GoogleGenAI, Type } from "@google/genai";
import { Deck } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const parseTextToDeck = async (text: string, deckName: string): Promise<Deck | null> => {
  if (!ai) {
    throw new Error("Gemini API key not configured.");
  }
  
  const prompt = `
    Parse the following text into a JSON array of flashcards. Each flashcard should be an object with a "front" and "back" property. The text is likely a CSV or a list with a separator like a tab, comma, or hyphen.
    
    Example input: "Apple - A fruit; Banana - Another fruit"
    Example output:
    [
        {"front": "Apple", "back": "A fruit"},
        {"front": "Banana", "back": "Another fruit"}
    ]

    Here is the text to parse:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ["front", "back"],
          },
        },
      },
    });

    const jsonString = response.text;
    const parsedCards = JSON.parse(jsonString);

    if (!Array.isArray(parsedCards)) {
      throw new Error("Parsed data is not an array");
    }

    const now = new Date().toISOString();
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name: deckName,
      cards: parsedCards.map((c, index) => ({
        id: `card-${Date.now()}-${index}`,
        front: c.front,
        back: c.back,
        lastReviewed: null,
        nextReview: now,
        interval: 0,
        easeFactor: 2.5,
      })),
    };

    return newDeck;
  } catch (error) {
    console.error("Error parsing text with Gemini:", error);
    throw new Error("Failed to parse the provided text. Please check the format and try again.");
  }
};
