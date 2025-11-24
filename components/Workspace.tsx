
import React, { useCallback } from 'react';
import { GeneratedLayout, CursorConfig } from '../types';

interface WorkspaceProps {
  layout: GeneratedLayout;
  config: CursorConfig;
  onTargetClick: (id: string, isCorrect: boolean) => void;
  onMiss?: () => void;
  activeItems?: Set<string>;
  gridCols?: number;
}

const Workspace: React.FC<WorkspaceProps> = ({ layout, config, onTargetClick, onMiss, activeItems, gridCols = 3 }) => {
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent, item: typeof layout.items[0]) => {
     // IMPORTANT: Stop propagation so the background click handler (miss tracking) doesn't fire
     e.stopPropagation();

     if (config.lockMode && !item.isCorrect) {
         return; 
     }
     onTargetClick(item.id, item.isCorrect);
  }, [config.lockMode, onTargetClick]);

  // Adjust gap based on density to fit smaller screens better
  const gapClass = gridCols >= 4 ? 'gap-2 md:gap-4' : 'gap-4 md:gap-8';
  const paddingClass = gridCols >= 4 ? 'p-2 md:p-12' : 'p-4 md:p-12';

  return (
    <div 
        className={`flex-1 h-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center ${paddingClass} scrollbar-hide cursor-none`}
        onClick={(e) => {
            if (onMiss) onMiss();
        }}
    >
      {/* Instructions */}
      <div className="text-center z-10 pointer-events-none mb-6 md:mb-10 mt-12 lg:mt-0 transition-all">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">{layout.title}</h2>
        <p className="text-sm md:text-lg text-slate-400 max-w-2xl bg-slate-900/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-800 inline-block">{layout.instruction}</p>
      </div>

      {/* Grid of Targets */}
      <div 
        className={`grid w-full max-w-5xl z-10 transition-all duration-500 ease-in-out ${gapClass} pb-20 pointer-events-none`}
        style={{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` 
        }}
      >
        {layout.items.map((item) => {
          const isLocked = config.lockMode && !item.isCorrect;
          const isCompleted = activeItems?.has(item.id);
          
          return (
            <button
              key={item.id}
              onClick={(e) => handleInteraction(e, item)}
              data-neuro-target="true"
              data-neuro-locked={isLocked || isCompleted}
              disabled={isCompleted}
              className={`
                pointer-events-auto 
                aspect-[4/3] rounded-xl md:rounded-2xl flex flex-col items-center justify-center
                shadow-lg transition-all duration-300 transform relative overflow-hidden group
                ${item.color.startsWith('bg-') ? item.color : 'bg-slate-800'}
                ${isLocked ? 'opacity-20 grayscale cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-95 opacity-100'}
                ${isCompleted ? 'ring-4 ring-emerald-500/50 opacity-40 scale-95 grayscale' : ''}
                border border-white/5
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md pointer-events-none z-10 relative">
                {isCompleted ? '✓' : item.label}
              </span>

              {/* Success Ripple Effect */}
              {isCompleted && (
                  <span className="absolute inset-0 rounded-xl md:rounded-2xl animate-ping bg-white/20" />
              )}
              
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
