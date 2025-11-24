import { Type } from "@google/genai";

export interface Point {
  x: number;
  y: number;
}

export interface TargetElement {
  id: string;
  rect: DOMRect;
  label: string;
  isCorrect?: boolean; 
  color?: string;
}

export interface CursorConfig {
  gravityRadius: number; 
  gravityStrength: number; 
  assistMode: boolean; 
  lockMode: boolean; 
  showTrail: boolean;
  dwellEnabled: boolean; 
  dwellDelay: number; 
  autoDetect: boolean; 
}

export interface LevelItem {
  id: string;
  label: string;
  color: string;
  isCorrect: boolean;
  colSpan?: number; // For grid layout control
}

export interface Level {
  id: number;
  title: string;
  instruction: string;
  gridCols: number; // 1, 2, 3, 4
  items: LevelItem[];
}

export interface AppState {
  currentLevel: number;
  score: number;
  clicks: number;
  avgTimeBetweenClicks: number;
  history: { time: number; speed: number }[];
}

export interface GeneratedLayout {
  title: string;
  instruction: string;
  items: {
    id: string;
    label: string;
    color: string;
    isCorrect: boolean;
  }[];
}

// Gemini Schema
export const LayoutSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instruction: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          color: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN },
        },
        required: ["id", "label", "color", "isCorrect"]
      }
    },
  },
  required: ["title", "instruction", "items"],
};