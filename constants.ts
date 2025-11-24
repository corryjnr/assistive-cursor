
import { Level } from './types';

export const DEFAULT_GRAVITY_RADIUS = 80;
export const MAX_GRAVITY_RADIUS = 200;
export const DEFAULT_GRAVITY_STRENGTH = 0.3;
export const STORAGE_KEY_CUSTOM_LEVELS = 'neuro_custom_levels_v1';

// Tuned for better responsiveness
export const CURSOR_SMOOTHING = 0.45; // 0.15 was too laggy
export const SNAP_SMOOTHING = 0.3;

// Dwell Click Defaults
export const DEFAULT_DWELL_ENABLED = false;
export const DEFAULT_DWELL_DELAY = 600; // Faster default
export const MIN_DWELL_DELAY = 200;
export const MAX_DWELL_DELAY = 2000;

export const DEFAULT_AUTO_DETECT = false;

// Theme Colors (Dark Blue Minimalist)
export const COLORS = {
  primary: "bg-blue-600",
  secondary: "bg-slate-700",
  accent: "bg-sky-500",
  danger: "bg-rose-600",
  success: "bg-emerald-600",
  warning: "bg-amber-500",
};

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Calibration",
    instruction: "Move your cursor to the blue button.",
    gridCols: 1,
    items: [
      { id: 'l1-1', label: 'Start', color: COLORS.primary, isCorrect: true },
    ]
  },
  {
    id: 2,
    title: "Binary Choice",
    instruction: "Select the correct target on the right.",
    gridCols: 2,
    items: [
      { id: 'l2-1', label: 'Ignore', color: COLORS.secondary, isCorrect: false },
      { id: 'l2-2', label: 'Click Me', color: COLORS.primary, isCorrect: true },
    ]
  },
  {
    id: 3,
    title: "The Corners",
    instruction: "Reach the targets in the corners.",
    gridCols: 2,
    items: [
      { id: 'l3-1', label: '1', color: COLORS.primary, isCorrect: true },
      { id: 'l3-2', label: '2', color: COLORS.primary, isCorrect: true },
      { id: 'l3-3', label: '3', color: COLORS.primary, isCorrect: true },
      { id: 'l3-4', label: '4', color: COLORS.primary, isCorrect: true },
    ]
  },
  {
    id: 4,
    title: "Precision Line",
    instruction: "Follow the path from left to right.",
    gridCols: 4,
    items: [
      { id: 'l4-1', label: 'A', color: COLORS.accent, isCorrect: true },
      { id: 'l4-2', label: 'B', color: COLORS.accent, isCorrect: true },
      { id: 'l4-3', label: 'C', color: COLORS.accent, isCorrect: true },
      { id: 'l4-4', label: 'D', color: COLORS.accent, isCorrect: true },
    ]
  },
  {
    id: 5,
    title: "Odd One Out",
    instruction: "Find the Green button among the gray ones.",
    gridCols: 3,
    items: [
      { id: 'l5-1', label: 'X', color: COLORS.secondary, isCorrect: false },
      { id: 'l5-2', label: 'X', color: COLORS.secondary, isCorrect: false },
      { id: 'l5-3', label: 'X', color: COLORS.secondary, isCorrect: false },
      { id: 'l5-4', label: 'X', color: COLORS.secondary, isCorrect: false },
      { id: 'l5-5', label: 'Target', color: COLORS.success, isCorrect: true },
      { id: 'l5-6', label: 'X', color: COLORS.secondary, isCorrect: false },
    ]
  },
  {
    id: 6,
    title: "Small Targets",
    instruction: "Precision test. Targets are smaller.",
    gridCols: 4,
    items: [
      { id: 'l6-1', label: '•', color: COLORS.primary, isCorrect: true },
      { id: 'l6-2', label: '•', color: COLORS.secondary, isCorrect: false },
      { id: 'l6-3', label: '•', color: COLORS.primary, isCorrect: true },
      { id: 'l6-4', label: '•', color: COLORS.secondary, isCorrect: false },
      { id: 'l6-5', label: '•', color: COLORS.secondary, isCorrect: false },
      { id: 'l6-6', label: '•', color: COLORS.primary, isCorrect: true },
      { id: 'l6-7', label: '•', color: COLORS.secondary, isCorrect: false },
      { id: 'l6-8', label: '•', color: COLORS.primary, isCorrect: true },
    ]
  },
  {
    id: 7,
    title: "Focus Check",
    instruction: "Only click the Danger (Red) items.",
    gridCols: 3,
    items: [
      { id: 'l7-1', label: 'Safe', color: COLORS.secondary, isCorrect: false },
      { id: 'l7-2', label: 'DANGER', color: COLORS.danger, isCorrect: true },
      { id: 'l7-3', label: 'Safe', color: COLORS.secondary, isCorrect: false },
      { id: 'l7-4', label: 'DANGER', color: COLORS.danger, isCorrect: true },
      { id: 'l7-5', label: 'Safe', color: COLORS.secondary, isCorrect: false },
      { id: 'l7-6', label: 'Safe', color: COLORS.secondary, isCorrect: false },
    ]
  },
  {
    id: 8,
    title: "Grid Search",
    instruction: "Locate all active nodes (Blue).",
    gridCols: 4,
    items: Array.from({ length: 12 }).map((_, i) => ({
      id: `l8-${i}`,
      label: [2, 5, 9, 11].includes(i) ? 'Active' : 'Offline',
      color: [2, 5, 9, 11].includes(i) ? COLORS.primary : COLORS.secondary,
      isCorrect: [2, 5, 9, 11].includes(i),
    }))
  },
  {
    id: 9,
    title: "Cognitive Load",
    instruction: "Read carefully: Click the items labeled 'YES'.",
    gridCols: 3,
    items: [
      { id: 'l9-1', label: 'NO', color: COLORS.primary, isCorrect: false },
      { id: 'l9-2', label: 'YES', color: COLORS.secondary, isCorrect: true },
      { id: 'l9-3', label: 'MAYBE', color: COLORS.primary, isCorrect: false },
      { id: 'l9-4', label: 'YES', color: COLORS.primary, isCorrect: true },
      { id: 'l9-5', label: 'NO', color: COLORS.secondary, isCorrect: false },
      { id: 'l9-6', label: 'YES', color: COLORS.secondary, isCorrect: true },
    ]
  },
  {
    id: 10,
    title: "Mastery",
    instruction: "Final Challenge. Accuracy matters.",
    gridCols: 5,
    items: Array.from({ length: 15 }).map((_, i) => ({
      id: `l10-${i}`,
      label: i % 2 === 0 ? '✓' : '✗',
      color: i % 2 === 0 ? COLORS.success : COLORS.secondary,
      isCorrect: i % 2 === 0,
    }))
  }
];
