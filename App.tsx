import React, { useState, useRef, useEffect } from 'react';
import { CursorConfig, AppState, GeneratedLayout, Level } from './types';
import { 
    DEFAULT_GRAVITY_RADIUS, 
    DEFAULT_GRAVITY_STRENGTH, 
    DEFAULT_DWELL_ENABLED, 
    DEFAULT_DWELL_DELAY,
    DEFAULT_AUTO_DETECT,
    LEVELS
} from './constants';
import ControlPanel from './components/ControlPanel';
import Workspace from './components/Workspace';
import SmartCursor from './components/SmartCursor';
import AnalyticsPanel from './components/AnalyticsPanel';
import RealWorldDemo from './components/RealWorldDemo';
import { generateLayout } from './services/geminiService';
import { Layers, Zap, Trophy, ArrowRight } from 'lucide-react';

const INITIAL_CONFIG: CursorConfig = {
  gravityRadius: DEFAULT_GRAVITY_RADIUS,
  gravityStrength: DEFAULT_GRAVITY_STRENGTH,
  assistMode: true,
  lockMode: false,
  showTrail: true,
  dwellEnabled: DEFAULT_DWELL_ENABLED,
  dwellDelay: DEFAULT_DWELL_DELAY,
  autoDetect: DEFAULT_AUTO_DETECT,
};

// Convert Level to GeneratedLayout format for Workspace compatibility
const levelToLayout = (level: Level): GeneratedLayout => ({
  title: level.title,
  instruction: level.instruction,
  items: level.items
});

const App: React.FC = () => {
  const [config, setConfig] = useState<CursorConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [viewMode, setViewMode] = useState<'training' | 'demo'>('training');
  
  // Level Management
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = LEVELS[currentLevelIndex];
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  // Layout handling
  const [customLayout, setCustomLayout] = useState<GeneratedLayout | null>(null);
  
  // Track layout version to inform SmartCursor to refresh its cache
  const [layoutVersion, setLayoutVersion] = useState(0);
  
  // Analytics State
  const [stats, setStats] = useState<AppState>({
    currentLevel: 1,
    score: 0,
    clicks: 0,
    avgTimeBetweenClicks: 0,
    history: []
  });
  
  const lastClickTimeRef = useRef<number>(Date.now());

  // Reset active items when level changes
  useEffect(() => {
    setActiveItems(new Set());
    setIsLevelComplete(false);
    setLayoutVersion(prev => prev + 1);
  }, [currentLevelIndex, customLayout]);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    const newLayout = await generateLayout(prompt);
    if (newLayout) {
      setCustomLayout(newLayout);
      setCurrentLevelIndex(-1); // Indicator for custom mode
      setViewMode('training');
    }
    setLoading(false);
  };

  const handleTargetClick = (id: string, isCorrect: boolean) => {
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;
    
    if (timeDiff < 100) return;
    lastClickTimeRef.current = now;

    // Visual feedback
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    // Track Progress
    if (isCorrect) {
        const newActive = new Set(activeItems);
        newActive.add(id);
        setActiveItems(newActive);

        // Check completion
        const layout = customLayout || levelToLayout(currentLevel);
        const totalCorrect = layout.items.filter(i => i.isCorrect).length;
        
        if (newActive.size >= totalCorrect) {
            setIsLevelComplete(true);
            // Auto advance after brief delay
            if (customLayout === null) {
                setTimeout(() => {
                    if (currentLevelIndex < LEVELS.length - 1) {
                         setCurrentLevelIndex(prev => prev + 1);
                    }
                }, 1500);
            }
        }
    }

    setStats(prev => {
        const newClicks = prev.clicks + 1;
        const newAvg = prev.avgTimeBetweenClicks === 0 
            ? timeDiff 
            : (prev.avgTimeBetweenClicks * (newClicks - 1) + timeDiff) / newClicks;

        return {
            ...prev,
            score: prev.score + (isCorrect ? 100 : 10),
            clicks: newClicks,
            avgTimeBetweenClicks: newAvg,
            history: [...prev.history, { time: newClicks, speed: timeDiff }].slice(-20) 
        };
    });
  };

  const currentDisplayLayout = customLayout || levelToLayout(currentLevel);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-blue-500/30 font-sans">
      <SmartCursor 
        config={config} 
        layoutVersion={layoutVersion + (viewMode === 'demo' ? 100 : 0)} 
        isClicking={isClicking} 
      />
      
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        onGenerate={handleGenerate}
        loading={loading}
        currentLevel={customLayout ? 0 : currentLevelIndex + 1}
        totalLevels={LEVELS.length}
      />
      
      <div className="flex-1 flex flex-col h-full relative">
        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center p-6 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-full flex gap-1 pointer-events-auto shadow-2xl">
                <button 
                    onClick={() => {
                        setViewMode('training');
                        setConfig(p => ({ ...p, autoDetect: false }));
                    }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'training' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    data-neuro-target="true"
                >
                    <Zap size={14} /> Training
                </button>
                <button 
                    onClick={() => {
                        setViewMode('demo');
                        setConfig(p => ({ ...p, autoDetect: true }));
                    }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'demo' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    data-neuro-target="true"
                >
                    <Layers size={14} /> Real World Demo
                </button>
            </div>
        </div>

        {/* Content Area */}
        {viewMode === 'training' ? (
            <>
                <Workspace 
                    layout={currentDisplayLayout}
                    config={config} 
                    onTargetClick={handleTargetClick}
                    activeItems={activeItems}
                    gridCols={customLayout ? 3 : currentLevel.gridCols}
                />
                
                {/* Level Completion Overlay */}
                {isLevelComplete && !customLayout && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-30 animate-in fade-in duration-300">
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center transform animate-in zoom-in-50 duration-300">
                             <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 shadow-lg shadow-emerald-500/30">
                                <Trophy size={32} />
                             </div>
                             <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
                             <p className="text-slate-400 mb-6">Moving to next challenge...</p>
                             {currentLevelIndex < LEVELS.length - 1 ? (
                                 <button 
                                    onClick={() => setCurrentLevelIndex(prev => prev + 1)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                                    data-neuro-target="true"
                                 >
                                    Next Level <ArrowRight size={16} />
                                 </button>
                             ) : (
                                 <div className="text-emerald-400 font-bold">ALL LEVELS CLEARED</div>
                             )}
                        </div>
                    </div>
                )}
            </>
        ) : (
            <RealWorldDemo />
        )}

        {viewMode === 'training' && <AnalyticsPanel stats={stats} />}
      </div>
    </div>
  );
};

export default App;