
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
  id: string | number; // Allow string IDs for custom levels
  title: string;
  instruction: string;
  gridCols: number; // 1, 2, 3, 4, 5
  items: LevelItem[];
  isCustom?: boolean;
  createdAt?: number;
}

export interface AppState {
  currentLevelId: string | number;
  score: number;
  clicks: number;
  avgTimeBetweenClicks: number;
  history: { time: number; speed: number }[];
}

export interface GeneratedLayout {
  title: string;
  instruction: string;
  gridCols: number;
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
    gridCols: { type: Type.INTEGER, description: "Number of grid columns (1-5)" },
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
  required: ["title", "instruction", "gridCols", "items"],
};
