
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

export type CursorType = 'dot' | 'crosshair' | 'ring' | 'pointer';

export interface CursorConfig {
  // Physics
  gravityRadius: number; 
  gravityStrength: number; // Deprecated in favor of snapStrength logic, kept for compat
  cursorSpeed: number; // New: 0.1 to 0.9
  snapStrength: number; // New: 0.1 to 0.9
  
  // Modes
  assistMode: boolean; 
  lockMode: boolean; 
  dwellEnabled: boolean; 
  dwellDelay: number; 
  autoDetect: boolean; 

  // Visuals
  showTrail: boolean;
  visualFeedback: boolean;
  cursorType: CursorType; // New
  cursorSize: number; // New: 0.5 to 2.0
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

export interface LevelStats {
  attempts: number;
  bestScore: number;
  bestTime: number; // ms
  lastPlayed: number;
  accuracyHistory: number[]; // Store last 5 runs
}

export interface AppState {
  currentLevelId: string | number;
  score: number;
  clicks: number;
  misses: number;
  startTime: number;
  avgTimeBetweenClicks: number;
  history: { time: number; speed: number }[];
  levelStats: Record<string | number, LevelStats>;
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
