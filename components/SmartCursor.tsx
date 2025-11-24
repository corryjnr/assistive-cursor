import React, { useEffect, useRef, useCallback } from 'react';
import { CursorConfig } from '../types';
import { lerp, getDistance, clamp } from '../utils/math';
import { getInteractiveElements } from '../utils/dom';

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
  const coreDivRef = useRef<HTMLDivElement>(null);
  const coreSvgRef = useRef<SVGSVGElement>(null);
  
  // Physics State
  const mousePos = useRef({ x: -100, y: -100 });
  const visualPos = useRef({ x: -100, y: -100 });
  const targetsRef = useRef<TargetCache[]>([]);
  const activeTargetRef = useRef<TargetCache | null>(null);
  const dwellStartTime = useRef<number>(0);
  const isDwelling = useRef(false);
  const requestRef = useRef<number>(0);
  
  // Trail State
  const trailRef = useRef<{x: number, y: number, id: number}[]>([]);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  const updateTargetCache = useCallback(() => {
    // Safety check for server-side or non-DOM envs
    if (typeof document === 'undefined') return;

    const explicitElements = Array.from(document.querySelectorAll('[data-neuro-target="true"]')) as HTMLElement[];
    let allElements = explicitElements;

    if (config.autoDetect) {
      const implicitElements = getInteractiveElements();
      allElements = [...explicitElements, ...implicitElements];
    }

    targetsRef.current = allElements.map((el) => {
      // Ensure element is actually connected to DOM before measuring
      if (!document.body.contains(el)) return null;

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
    }).filter((t): t is TargetCache => t !== null);
  }, [config.autoDetect]);

  useEffect(() => {
    updateTargetCache();
    window.addEventListener('resize', updateTargetCache);
    window.addEventListener('scroll', updateTargetCache, true);
    window.addEventListener('transitionend', updateTargetCache); // Catch layout shifts from transitions
    
    const observer = new MutationObserver(updateTargetCache);
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    }

    return () => {
      window.removeEventListener('resize', updateTargetCache);
      window.removeEventListener('scroll', updateTargetCache, true);
      window.removeEventListener('transitionend', updateTargetCache);
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
      
      // Safety check: ensure element still exists
      if (!target.el || !document.body.contains(target.el)) return;

      const dist = getDistance(e.clientX, e.clientY, target.centerX, target.centerY);

      // Gravity Assist Click Logic
      // Only intervene if the user clicked OUTSIDE the element but INSIDE gravity radius
      if (dist < config.gravityRadius && !target.el.contains(e.target as Node)) {
        if (target.locked) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Visual feedback for gravity click
        const coreEl = coreDivRef.current || coreSvgRef.current;
        if (config.visualFeedback && coreEl) {
            coreEl.classList.add('scale-150', 'bg-white');
            setTimeout(() => coreEl.classList.remove('scale-150', 'bg-white'), 100);
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
  }, [config.assistMode, config.gravityRadius, config.visualFeedback]);

  const updateTrail = (x: number, y: number) => {
      if (!config.showTrail || !trailContainerRef.current) {
          if (trailContainerRef.current) trailContainerRef.current.innerHTML = '';
          return;
      }

      // Add point
      trailRef.current.push({ x, y, id: Date.now() });
      if (trailRef.current.length > 10) trailRef.current.shift();

      // Simple DOM rendering for trail (more performant than React state loop)
      let html = '';
      trailRef.current.forEach((pt, i) => {
          const opacity = (i / trailRef.current.length) * 0.4;
          const size = (4 * (config.cursorSize || 1)) + (i / trailRef.current.length) * 8;
          html += `<div style="position: absolute; left: ${pt.x}px; top: ${pt.y}px; width: ${size}px; height: ${size}px; background: #0ea5e9; border-radius: 50%; opacity: ${opacity}; transform: translate(-50%, -50%); pointer-events: none;"></div>`;
      });
      trailContainerRef.current.innerHTML = html;
  };

  const animate = useCallback(() => {
    if (!cursorRef.current) return;

    let targetX = mousePos.current.x;
    let targetY = mousePos.current.y;
    let bestTarget: TargetCache | null = null;
    let isSnapped = false;

    if (config.assistMode) {
      let closestDist = Infinity;
      
      for (const target of targetsRef.current) {
        // Double check existence to avoid stale cache issues during rapid navigation
        if (!target.el || !document.body.contains(target.el)) continue;

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
            if (activeTargetRef.current && activeTargetRef.current.el && document.body.contains(activeTargetRef.current.el)) {
                 activeTargetRef.current.el.style.transform = '';
            }
            
            // Only scale game targets if feedback enabled
            if (config.visualFeedback && bestTarget.el.getAttribute('data-neuro-target') === 'true') {
                 bestTarget.el.style.transform = 'scale(1.05)';
            }
        }
      } else {
        if (activeTargetRef.current && activeTargetRef.current.el && document.body.contains(activeTargetRef.current.el)) {
            activeTargetRef.current.el.style.transform = '';
        }
      }
    }

    activeTargetRef.current = isSnapped ? bestTarget : null;

    // Use config settings for physics
    // Higher speed = faster lerp. 
    const ease = isSnapped ? config.snapStrength : config.cursorSpeed; 
    visualPos.current.x = lerp(visualPos.current.x, targetX, ease);
    visualPos.current.y = lerp(visualPos.current.y, targetY, ease);

    // Rounding to 2 decimal places prevents micro-jitter
    const vx = Math.round(visualPos.current.x * 100) / 100;
    const vy = Math.round(visualPos.current.y * 100) / 100;

    const translate = `translate3d(${vx}px, ${vy}px, 0)`;
    cursorRef.current.style.transform = `${translate} translate(-50%, -50%)`;
    
    // Update trail
    if (config.showTrail) {
        updateTrail(vx, vy);
    } else if (trailContainerRef.current && trailContainerRef.current.innerHTML !== '') {
        trailContainerRef.current.innerHTML = '';
    }

    updateDwellLogic(isSnapped, bestTarget);
    updateVisuals(isSnapped);

    requestRef.current = requestAnimationFrame(animate);
  }, [config]);

  const updateDwellLogic = (isSnapped: boolean, target: TargetCache | null) => {
    if (!config.dwellEnabled) {
        isDwelling.current = false;
        return;
    }

    if (isSnapped && target && target.el && document.body.contains(target.el)) {
        if (!isDwelling.current) {
            isDwelling.current = true;
            dwellStartTime.current = Date.now();
        }

        const elapsed = Date.now() - dwellStartTime.current;
        const progress = clamp(elapsed / config.dwellDelay, 0, 1);

        if (ringRef.current && config.visualFeedback) {
            const radius = 24 * (config.cursorSize || 1);
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progress * circumference);
            ringRef.current.style.strokeDashoffset = offset.toString();
        }

        if (progress >= 1) {
            target.el.click();
            isDwelling.current = false;
            dwellStartTime.current = Date.now() + 500;
            if (ringRef.current) ringRef.current.style.strokeDashoffset = (2 * Math.PI * 24 * (config.cursorSize || 1)).toString();
        }
    } else {
        isDwelling.current = false;
        if (ringRef.current) ringRef.current.style.strokeDashoffset = (2 * Math.PI * 24 * (config.cursorSize || 1)).toString();
    }
  };

  const updateVisuals = (isSnapped: boolean) => {
     // Visual state is largely handled by the render method now based on config properties,
     // but we can add dynamic class updates here if needed for advanced animations.
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Dynamic Styles
  const scale = config.cursorSize || 1;
  const radius = 24 * scale;
  const circumference = 2 * Math.PI * radius;
  const snapColor = 'bg-sky-400';
  const normalColor = 'bg-slate-200';

  return (
    <>
        <div ref={trailContainerRef} className="fixed inset-0 pointer-events-none z-[100000]" />
        <div 
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[100001] flex items-center justify-center w-0 h-0"
            style={{ willChange: 'transform' }}
        >
            <div className="relative flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
                
                {/* Cursor Shapes */}
                {config.cursorType === 'dot' && (
                    <div ref={coreDivRef} className={`w-3 h-3 rounded-full transition-colors duration-200 shadow-[0_0_15px_rgba(14,165,233,0.5)] ${activeTargetRef.current ? snapColor : normalColor}`} />
                )}

                {config.cursorType === 'crosshair' && (
                    <div ref={coreDivRef} className={`relative flex items-center justify-center transition-colors duration-200 ${activeTargetRef.current ? 'text-sky-400' : 'text-slate-200'}`}>
                         <div className="w-8 h-0.5 bg-current absolute" />
                         <div className="h-8 w-0.5 bg-current absolute" />
                         <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                    </div>
                )}

                {config.cursorType === 'ring' && (
                    <div ref={coreDivRef} className={`w-6 h-6 rounded-full border-2 transition-colors duration-200 shadow-sm ${activeTargetRef.current ? 'border-sky-400 bg-sky-400/20' : 'border-slate-200'}`} />
                )}

                {config.cursorType === 'pointer' && (
                    <svg ref={coreSvgRef} width="24" height="24" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-200 ${activeTargetRef.current ? 'fill-sky-400 stroke-sky-200' : 'fill-slate-200 stroke-slate-500'} drop-shadow-lg`} style={{ transform: 'translate(25%, 25%)' }}>
                        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}

                {/* Dwell Loading Ring */}
                {config.dwellEnabled && config.visualFeedback && (
                    <svg 
                        className={`absolute -rotate-90 drop-shadow-xl transition-opacity duration-300 opacity-100`} 
                        viewBox="0 0 60 60"
                        style={{ width: `${radius * 2 + 12}px`, height: `${radius * 2 + 12}px`, overflow: 'visible' }}
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
                )}

                {/* Click Feedback (Ping) */}
                {isClicking && config.visualFeedback && (
                    <div className="absolute w-12 h-12 border-2 border-sky-400 rounded-full animate-ping opacity-75" />
                )}
            </div>
        </div>
    </>
  );
};

export default SmartCursor;