import React, { useCallback } from 'react';
import { GeneratedLayout, CursorConfig } from '../types';

interface WorkspaceProps {
  layout: GeneratedLayout;
  config: CursorConfig;
  onTargetClick: (id: string, isCorrect: boolean) => void;
  activeItems?: Set<string>;
  gridCols?: number;
}

const Workspace: React.FC<WorkspaceProps> = ({ layout, config, onTargetClick, activeItems, gridCols = 3 }) => {
  const handleInteraction = useCallback((item: typeof layout.items[0]) => {
     if (config.lockMode && !item.isCorrect) {
         return; 
     }
     onTargetClick(item.id, item.isCorrect);
  }, [config.lockMode, onTargetClick]);

  return (
    <div className="flex-1 h-full relative overflow-hidden flex flex-col items-center justify-center p-12">
      {/* Instructions */}
      <div className="absolute top-24 text-center z-0 pointer-events-none">
        <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">{layout.title}</h2>
        <p className="text-lg text-slate-400 max-w-2xl bg-slate-900/50 px-4 py-1 rounded-full backdrop-blur-sm border border-slate-800">{layout.instruction}</p>
      </div>

      {/* Grid of Targets */}
      <div 
        className="grid gap-6 w-full max-w-5xl z-10 transition-all duration-500 ease-in-out"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {layout.items.map((item) => {
          const isLocked = config.lockMode && !item.isCorrect;
          const isCompleted = activeItems?.has(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => handleInteraction(item)}
              data-neuro-target="true"
              data-neuro-locked={isLocked || isCompleted}
              disabled={isCompleted}
              className={`
                aspect-[4/3] rounded-2xl flex flex-col items-center justify-center
                shadow-lg transition-all duration-300 transform relative overflow-hidden group
                ${item.color.startsWith('bg-') ? item.color : 'bg-slate-800'}
                ${isLocked ? 'opacity-20 grayscale cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-95 opacity-100'}
                ${isCompleted ? 'ring-4 ring-emerald-500 opacity-50 scale-90 grayscale' : ''}
                border border-white/5
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <span className="text-2xl font-bold text-white drop-shadow-md pointer-events-none z-10">
                {isCompleted ? '✓' : item.label}
              </span>
              
              {/* Correct Target Hint in Training Mode (optional, subtle glow) */}
              {item.isCorrect && !isCompleted && !isLocked && (
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Workspace;