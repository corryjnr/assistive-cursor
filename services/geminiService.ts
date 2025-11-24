import { GoogleGenAI, Type } from "@google/genai";
import { LayoutSchema, GeneratedLayout } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generateLayout = async (prompt: string): Promise<GeneratedLayout | null> => {
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a UI layout for a simple point-and-click learning game. 
      The user request is: "${prompt}".
      Ensure items have distinct colors (hex codes or tailwind class names like 'bg-red-500').
      Mark only one item as 'isCorrect: true' if the prompt implies a question, otherwise mark all false.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: LayoutSchema,
        systemInstruction: "You are an assistive technology interface designer. Create simple, high-contrast, large-target layouts."
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeneratedLayout;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};