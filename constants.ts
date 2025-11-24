
import { Level, CursorType } from './types';

export const DEFAULT_GRAVITY_RADIUS = 80;
export const MAX_GRAVITY_RADIUS = 200;
export const DEFAULT_GRAVITY_STRENGTH = 0.3;
export const STORAGE_KEY_CUSTOM_LEVELS = 'neuro_custom_levels_v1';

// Physics Defaults
export const DEFAULT_CURSOR_SPEED = 0.45;
export const MIN_CURSOR_SPEED = 0.05; // Very smooth/laggy
export const MAX_CURSOR_SPEED = 0.95; // Almost raw input

export const DEFAULT_SNAP_STRENGTH = 0.3;
export const MIN_SNAP_STRENGTH = 0.05;
export const MAX_SNAP_STRENGTH = 0.8;

// Dwell Click Defaults
export const DEFAULT_DWELL_ENABLED = false;
export const DEFAULT_DWELL_DELAY = 600; 
export const MIN_DWELL_DELAY = 200;
export const MAX_DWELL_DELAY = 2000;

export const DEFAULT_AUTO_DETECT = false;
export const DEFAULT_CURSOR_TYPE: CursorType = 'dot';
export const DEFAULT_CURSOR_SIZE = 1.0;

// Theme Colors (Dark Blue Minimalist)
export const COLORS = {
  primary: "bg-blue-600",
  secondary: "bg-slate-700",
  accent: "bg-sky-500",
  danger: "bg-rose-600",
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  purple: "bg-indigo-600",
  orange: "bg-orange-500",
  nav: "bg-slate-800",
  input: "bg-slate-600",
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
    title: "The Spiral",
    instruction: "Follow the spiral path inward.",
    gridCols: 5,
    items: Array.from({ length: 25 }).map((_, i) => {
        const spiralIndices = [0, 1, 2, 3, 4, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5, 6, 7, 8, 13, 12];
        const isPath = spiralIndices.includes(i);
        return {
            id: `l10-${i}`,
            label: isPath ? (spiralIndices.indexOf(i) + 1).toString() : '',
            color: isPath ? COLORS.purple : COLORS.secondary,
            isCorrect: isPath,
        };
    })
  },
  {
      id: 11,
      title: "Checkerboard",
      instruction: "Select the alternating pattern.",
      gridCols: 4,
      items: Array.from({ length: 16 }).map((_, i) => {
          const isBlack = (Math.floor(i / 4) + i) % 2 === 0;
          return {
              id: `l11-${i}`,
              label: '',
              color: isBlack ? COLORS.accent : COLORS.secondary,
              isCorrect: isBlack,
          };
      })
  },
  {
      id: 12,
      title: "Edge Hugger",
      instruction: "Click all targets on the border.",
      gridCols: 4,
      items: Array.from({ length: 16 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const isEdge = row === 0 || row === 3 || col === 0 || col === 3;
          return {
              id: `l12-${i}`,
              label: isEdge ? '⛛' : '',
              color: isEdge ? COLORS.warning : COLORS.secondary,
              isCorrect: isEdge,
          };
      })
  },
  {
      id: 13,
      title: "Center Rush",
      instruction: "Focus on the center cluster.",
      gridCols: 5,
      items: Array.from({ length: 25 }).map((_, i) => {
          const centerIndices = [6, 7, 8, 11, 12, 13, 16, 17, 18];
          const isCenter = centerIndices.includes(i);
          return {
              id: `l13-${i}`,
              label: isCenter ? '◎' : '',
              color: isCenter ? COLORS.orange : COLORS.secondary,
              isCorrect: isCenter,
          };
      })
  },
  {
      id: 14,
      title: "Color Match",
      instruction: "Click only the SKY BLUE items.",
      gridCols: 4,
      items: Array.from({ length: 16 }).map((_, i) => {
           const colorMap = [
               COLORS.accent, COLORS.primary, COLORS.secondary, COLORS.accent,
               COLORS.secondary, COLORS.accent, COLORS.primary, COLORS.secondary,
               COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.primary,
               COLORS.secondary, COLORS.accent, COLORS.secondary, COLORS.primary
           ];
           const isCorrect = colorMap[i] === COLORS.accent;
           return {
               id: `l14-${i}`,
               label: '',
               color: colorMap[i],
               isCorrect: isCorrect
           };
      })
  },
  {
    id: 15,
    title: "Grandmaster",
    instruction: "Precision & Speed. Complete the pattern.",
    gridCols: 5,
    items: Array.from({ length: 15 }).map((_, i) => ({
      id: `l15-${i}`,
      label: i % 2 === 0 ? '✓' : '✗',
      color: i % 2 === 0 ? COLORS.success : COLORS.secondary,
      isCorrect: i % 2 === 0,
    }))
  },
  // --- REAL WORLD SIMULATION LEVELS ---
  {
      id: 16,
      title: "The Navbar",
      instruction: "Sim: Select the 'Profile' and 'Settings' links.",
      gridCols: 5,
      items: [
          { id: 'l16-1', label: 'Home', color: COLORS.nav, isCorrect: false },
          { id: 'l16-2', label: 'About', color: COLORS.nav, isCorrect: false },
          { id: 'l16-3', label: 'Profile', color: COLORS.primary, isCorrect: true },
          { id: 'l16-4', label: 'Settings', color: COLORS.primary, isCorrect: true },
          { id: 'l16-5', label: 'Logout', color: COLORS.nav, isCorrect: false },
      ]
  },
  {
      id: 17,
      title: "Data Entry",
      instruction: "Sim: Click the input fields in order (Top to Bottom).",
      gridCols: 1,
      items: [
          { id: 'l17-1', label: 'First Name', color: COLORS.input, isCorrect: true },
          { id: 'l17-2', label: 'Last Name', color: COLORS.input, isCorrect: true },
          { id: 'l17-3', label: 'Email', color: COLORS.input, isCorrect: true },
          { id: 'l17-4', label: 'Password', color: COLORS.input, isCorrect: true },
          { id: 'l17-5', label: 'Submit', color: COLORS.success, isCorrect: true },
      ]
  },
  {
      id: 18,
      title: "Close Buttons",
      instruction: "Sim: Close all the popups (Click 'X').",
      gridCols: 4,
      items: Array.from({ length: 16 }).map((_, i) => {
          const isTarget = [3, 6, 9, 12].includes(i);
          return {
              id: `l18-${i}`,
              label: isTarget ? 'X' : 'Content',
              color: isTarget ? COLORS.danger : COLORS.secondary,
              isCorrect: isTarget,
          };
      })
  },
  {
      id: 19,
      title: "Context Menu",
      instruction: "Sim: Select 'Copy' and 'Paste' from the menu.",
      gridCols: 1,
      items: [
          { id: 'l19-1', label: 'View', color: COLORS.nav, isCorrect: false },
          { id: 'l19-2', label: 'Edit', color: COLORS.nav, isCorrect: false },
          { id: 'l19-3', label: 'Copy', color: COLORS.accent, isCorrect: true },
          { id: 'l19-4', label: 'Paste', color: COLORS.accent, isCorrect: true },
          { id: 'l19-5', label: 'Delete', color: COLORS.nav, isCorrect: false },
      ]
  },
  {
      id: 20,
      title: "The Toolbar",
      instruction: "Sim: Activate the tool icons (Blue).",
      gridCols: 6,
      items: Array.from({ length: 18 }).map((_, i) => {
          const isTool = [2, 4, 8, 10, 14, 16].includes(i);
          return {
              id: `l20-${i}`,
              label: isTool ? 'Tool' : '',
              color: isTool ? COLORS.primary : COLORS.secondary,
              isCorrect: isTool,
          };
      })
  }
];
