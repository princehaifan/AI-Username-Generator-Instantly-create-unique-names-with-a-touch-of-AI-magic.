
import { GoogleGenAI, Type } from "@google/genai";
import type { WordPosition, Category } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateUsernames = async (
  seedWord: string,
  category: Category,
  wordPosition: WordPosition
): Promise<string[]> => {
  try {
    const prompt = `You are a creative username generator. Generate 15 unique and cool usernames. The user wants a name based on the seed word '${seedWord}' and the category '${category}'. The seed word must appear ${wordPosition} a word related to the category. Include some fun variations using numbers, special characters like underscores, or creative spellings. Ensure the usernames are diverse in style.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usernames: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A creative username.",
              },
            },
          },
          required: ["usernames"],
        },
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    
    if (parsed && Array.isArray(parsed.usernames)) {
      return parsed.usernames;
    } else {
      throw new Error("Invalid response format from AI.");
    }
  } catch (error) {
    console.error("Error generating usernames:", error);
    throw new Error("Failed to generate usernames. Please try again.");
  }
};
