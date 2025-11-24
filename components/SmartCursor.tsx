import React, { useEffect, useRef, useCallback } from 'react';
import { CursorConfig } from '../types';
import { lerp, getDistance, clamp } from '../utils/math';
import { getInteractiveElements } from '../utils/dom';
import { CURSOR_SMOOTHING, SNAP_SMOOTHING } from '../constants';

interface SmartCursorProps {
  config: CursorConfig;
  layoutVersion?: number;
  isClicking: boolean;
}

interface TargetCache {
  el: HTMLElement;
  rect: DOMRect;
  centerX: number;
  centerY: number;
  radius: number;
  locked: boolean;
}

const SmartCursor: React.FC<SmartCursorProps> = ({ config, layoutVersion, isClicking }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  
  // Physics State
  const mousePos = useRef({ x: -100, y: -100 });
  const visualPos = useRef({ x: -100, y: -100 });
  const targetsRef = useRef<TargetCache[]>([]);
  const activeTargetRef = useRef<TargetCache | null>(null);
  const dwellStartTime = useRef<number>(0);
  const isDwelling = useRef(false);
  const requestRef = useRef<number>(0);

  const updateTargetCache = useCallback(() => {
    const explicitElements = Array.from(document.querySelectorAll('[data-neuro-target="true"]')) as HTMLElement[];
    let allElements = explicitElements;

    if (config.autoDetect) {
      const implicitElements = getInteractiveElements();
      allElements = [...explicitElements, ...implicitElements];
    }

    targetsRef.current = allElements.map((el) => {
      const rect = el.getBoundingClientRect();
      const isExplicit = el.getAttribute('data-neuro-target') === 'true';
      return {
        el: el,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        radius: Math.max(rect.width, rect.height) / 2 + (isExplicit ? 0 : 5), 
        locked: el.getAttribute('data-neuro-locked') === 'true'
      };
    });
  }, [config.autoDetect]);

  useEffect(() => {
    updateTargetCache();
    window.addEventListener('resize', updateTargetCache);
    window.addEventListener('scroll', updateTargetCache, true);
    
    const observer = new MutationObserver(updateTargetCache);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateTargetCache);
      window.removeEventListener('scroll', updateTargetCache, true);
      observer.disconnect();
    };
  }, [updateTargetCache, layoutVersion]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleGlobalClick = (e: MouseEvent) => {
      if (!config.assistMode || !activeTargetRef.current) return;

      const target = activeTargetRef.current;
      const dist = getDistance(e.clientX, e.clientY, target.centerX, target.centerY);

      // Gravity Assist Click Logic
      // Only intervene if the user clicked OUTSIDE the element but INSIDE gravity radius
      if (dist < config.gravityRadius && !target.el.contains(e.target as Node)) {
        if (target.locked) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Visual feedback for gravity click
        if (coreRef.current) {
            coreRef.current.classList.add('scale-150', 'bg-white');
            setTimeout(() => coreRef.current?.classList.remove('scale-150', 'bg-white'), 100);
        }

        target.el.click();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleGlobalClick, { capture: true }); 

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleGlobalClick, { capture: true });
    };
  }, [config.assistMode, config.gravityRadius]);

  const animate = useCallback(() => {
    if (!cursorRef.current) return;

    let targetX = mousePos.current.x;
    let targetY = mousePos.current.y;
    let bestTarget: TargetCache | null = null;
    let isSnapped = false;

    if (config.assistMode) {
      let closestDist = Infinity;
      
      for (const target of targetsRef.current) {
        if (config.lockMode && target.locked) continue;
        const dist = getDistance(targetX, targetY, target.centerX, target.centerY);
        
        if (dist < closestDist) {
          closestDist = dist;
          bestTarget = target;
        }
      }

      if (bestTarget && closestDist < config.gravityRadius) {
        targetX = bestTarget.centerX;
        targetY = bestTarget.centerY;
        isSnapped = true;
        
        if (activeTargetRef.current !== bestTarget) {
            if (activeTargetRef.current) activeTargetRef.current.el.style.transform = '';
            // Only scale game targets, generic elements shouldn't pop as much
            if (bestTarget.el.getAttribute('data-neuro-target') === 'true') {
                 bestTarget.el.style.transform = 'scale(1.05)';
            }
        }
      } else {
        if (activeTargetRef.current) activeTargetRef.current.el.style.transform = '';
      }
    }

    activeTargetRef.current = isSnapped ? bestTarget : null;

    // Improved Physics: Significantly faster lerp for responsiveness
    const ease = isSnapped ? SNAP_SMOOTHING : CURSOR_SMOOTHING; 
    visualPos.current.x = lerp(visualPos.current.x, targetX, ease);
    visualPos.current.y = lerp(visualPos.current.y, targetY, ease);

    // Rounding to 2 decimal places prevents micro-jitter on some screens
    const vx = Math.round(visualPos.current.x * 100) / 100;
    const vy = Math.round(visualPos.current.y * 100) / 100;

    const translate = `translate3d(${vx}px, ${vy}px, 0)`;
    cursorRef.current.style.transform = `${translate} translate(-50%, -50%)`;

    updateDwellLogic(isSnapped, bestTarget);
    updateVisuals(isSnapped);

    requestRef.current = requestAnimationFrame(animate);
  }, [config]);

  const updateDwellLogic = (isSnapped: boolean, target: TargetCache | null) => {
    if (!config.dwellEnabled) {
        isDwelling.current = false;
        return;
    }

    if (isSnapped && target) {
        if (!isDwelling.current) {
            isDwelling.current = true;
            dwellStartTime.current = Date.now();
        }

        const elapsed = Date.now() - dwellStartTime.current;
        const progress = clamp(elapsed / config.dwellDelay, 0, 1);

        if (ringRef.current) {
            const radius = 24;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progress * circumference);
            ringRef.current.style.strokeDashoffset = offset.toString();
        }

        if (progress >= 1) {
            target.el.click();
            isDwelling.current = false;
            dwellStartTime.current = Date.now() + 500;
            if (ringRef.current) ringRef.current.style.strokeDashoffset = (2 * Math.PI * 24).toString();
        }
    } else {
        isDwelling.current = false;
        if (ringRef.current) ringRef.current.style.strokeDashoffset = (2 * Math.PI * 24).toString();
    }
  };

  const updateVisuals = (isSnapped: boolean) => {
     if (coreRef.current) {
         coreRef.current.className = `w-3 h-3 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(14,165,233,0.5)] ${
            isSnapped ? 'bg-sky-400 scale-125' : 'bg-slate-200'
         }`;
     }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  return (
    <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center w-0 h-0"
        style={{ willChange: 'transform' }}
    >
        <div className="relative flex items-center justify-center">
            <div ref={coreRef} className="w-3 h-3 bg-slate-200 rounded-full" />

            <svg 
                className={`absolute w-16 h-16 -rotate-90 drop-shadow-xl transition-opacity duration-300 ${config.dwellEnabled ? 'opacity-100' : 'opacity-0'}`} 
                viewBox="0 0 60 60"
            >
                <circle
                    cx="30" cy="30" r={radius}
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.2)"
                    strokeWidth="4"
                />
                <circle
                    ref={ringRef}
                    cx="30" cy="30" r={radius}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    strokeLinecap="round"
                />
            </svg>

            {isClicking && (
                <div className="absolute w-12 h-12 border-2 border-sky-400 rounded-full animate-ping opacity-75" />
            )}
        </div>
    </div>
  );
};

export default SmartCursor;