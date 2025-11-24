
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CursorConfig, AppState, GeneratedLayout, Level } from './types';
import { 
    DEFAULT_GRAVITY_RADIUS, 
    DEFAULT_GRAVITY_STRENGTH, 
    DEFAULT_DWELL_ENABLED, 
    DEFAULT_DWELL_DELAY,
    DEFAULT_AUTO_DETECT,
    LEVELS,
    STORAGE_KEY_CUSTOM_LEVELS
} from './constants';
import ControlPanel from './components/ControlPanel';
import Workspace from './components/Workspace';
import SmartCursor from './components/SmartCursor';
import AnalyticsPanel from './components/AnalyticsPanel';
import RealWorldDemo from './components/RealWorldDemo';
import { generateLayout } from './services/geminiService';
import { Layers, Zap, Trophy, ArrowRight, Menu, X, CheckCircle2, BrainCircuit } from 'lucide-react';

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

// Helper to convert GeneratedLayout to Level
const generatedToLevel = (layout: GeneratedLayout): Level => ({
    id: `custom-${Date.now()}`,
    title: layout.title || "Custom Level",
    instruction: layout.instruction || "Complete the task.",
    gridCols: layout.gridCols || 3,
    items: layout.items,
    isCustom: true,
    createdAt: Date.now()
});

// Helper to convert Level to GeneratedLayout (for Workspace compatibility if needed)
const levelToLayout = (level: Level): GeneratedLayout => ({
  title: level.title,
  instruction: level.instruction,
  gridCols: level.gridCols,
  items: level.items
});

const App: React.FC = () => {
  const [config, setConfig] = useState<CursorConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [viewMode, setViewMode] = useState<'training' | 'demo'>('training');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAi, setShowAi] = useState(false);
  
  // Level State
  const [customLevels, setCustomLevels] = useState<Level[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<string | number>(1);
  const [creationSuccess, setCreationSuccess] = useState(false);
  
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);
  
  // Analytics State
  const [stats, setStats] = useState<AppState>({
    currentLevelId: 1,
    score: 0,
    clicks: 0,
    avgTimeBetweenClicks: 0,
    history: []
  });
  
  const lastClickTimeRef = useRef<number>(Date.now());

  // Load custom levels on mount
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_LEVELS);
      if (saved) {
          try {
              setCustomLevels(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to load custom levels", e);
          }
      }
      
      // Responsive sidebar check
      if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
      }
  }, []);

  // Save custom levels when changed
  useEffect(() => {
      if (customLevels.length > 0) {
          localStorage.setItem(STORAGE_KEY_CUSTOM_LEVELS, JSON.stringify(customLevels));
      }
  }, [customLevels]);

  // Handle layout updates when sidebar toggles
  useEffect(() => {
      // Trigger a layout update for the cursor after transition
      const timeout = setTimeout(() => {
          setLayoutVersion(prev => prev + 1);
      }, 350); // Match transition duration
      return () => clearTimeout(timeout);
  }, [isSidebarOpen]);

  // Combine standard and custom levels
  const allLevels = useMemo(() => [...LEVELS, ...customLevels], [customLevels]);
  const currentLevel = allLevels.find(l => l.id === currentLevelId) || LEVELS[0];
  
  // Determine if it's the final level of the main campaign
  const isFinalCampaignLevel = !currentLevel.isCustom && allLevels.findIndex(l => l.id === currentLevelId) === LEVELS.length - 1;

  // Reset active items when level changes
  useEffect(() => {
    setActiveItems(new Set());
    setIsLevelComplete(false);
    setLayoutVersion(prev => prev + 1);
  }, [currentLevelId]);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    const newLayout = await generateLayout(prompt);
    if (newLayout) {
      const newLevel = generatedToLevel(newLayout);
      setCustomLevels(prev => [newLevel, ...prev]);
      setCurrentLevelId(newLevel.id);
      setViewMode('training');
      setCreationSuccess(true);
      setShowAi(false);
      
      setTimeout(() => setCreationSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDeleteLevel = (id: string | number) => {
      const newCustom = customLevels.filter(l => l.id !== id);
      setCustomLevels(newCustom);
      localStorage.setItem(STORAGE_KEY_CUSTOM_LEVELS, JSON.stringify(newCustom));
      if (currentLevelId === id) {
          setCurrentLevelId(LEVELS[0].id);
      }
  };

  const handleNextLevel = () => {
      const currentIndex = allLevels.findIndex(l => l.id === currentLevelId);
      if (currentIndex < allLevels.length - 1) {
          setCurrentLevelId(allLevels[currentIndex + 1].id);
      }
  };
  
  const handleGoToRealWorld = () => {
      setIsLevelComplete(false);
      setViewMode('demo');
      setConfig(prev => ({ ...prev, autoDetect: true }));
  };
  
  const handleGoToCustomCreation = () => {
      setIsLevelComplete(false);
      setIsSidebarOpen(true);
      setShowAi(true);
  };

  const handleTargetClick = (id: string, isCorrect: boolean) => {
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;
    
    if (timeDiff < 100) return;
    lastClickTimeRef.current = now;

    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    if (isCorrect) {
        const newActive = new Set(activeItems);
        newActive.add(id);
        setActiveItems(newActive);

        const totalCorrect = currentLevel.items.filter(i => i.isCorrect).length;
        
        if (newActive.size >= totalCorrect) {
            setIsLevelComplete(true);
            // Auto advance ONLY if it's a standard campaign level AND not the last one
            if (!currentLevel.isCustom && !isFinalCampaignLevel) {
                setTimeout(() => {
                    handleNextLevel();
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
            currentLevelId: currentLevelId,
            score: prev.score + (isCorrect ? 100 : 10),
            clicks: newClicks,
            avgTimeBetweenClicks: newAvg,
            history: [...prev.history, { time: newClicks, speed: timeDiff }].slice(-20) 
        };
    });
  };

  const currentDisplayLayout = levelToLayout(currentLevel);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-blue-500/30 font-sans relative">
      <SmartCursor 
        config={config} 
        layoutVersion={layoutVersion + (viewMode === 'demo' ? 100 : 0)} 
        isClicking={isClicking} 
      />
      
      {/* Toast Notification for Creation Success */}
      {creationSuccess && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/50">
                  <CheckCircle2 size={20} className="text-white" />
                  <span className="font-semibold text-sm">Custom Level Created Successfully!</span>
              </div>
          </div>
      )}
      
      {/* Mobile/Tablet Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-blue-500 transition-colors shadow-xl"
        data-neuro-target="true"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <div 
        className={`
            fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl
            ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80 lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0'}
        `}
      >
          <div className={`w-80 h-full ${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 delay-100`}>
            <ControlPanel 
                config={config} 
                setConfig={setConfig} 
                onGenerate={handleGenerate}
                loading={loading}
                levels={allLevels}
                currentLevelId={currentLevelId}
                onSelectLevel={(id) => {
                    setCurrentLevelId(id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                onDeleteLevel={handleDeleteLevel}
                showAi={showAi}
                setShowAi={setShowAi}
            />
          </div>
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full relative transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        
        {/* View Mode Switcher */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center p-4 lg:p-6 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-full flex gap-1 pointer-events-auto shadow-2xl scale-90 lg:scale-100 transition-transform origin-top">
                <button 
                    onClick={() => {
                        setViewMode('training');
                        setConfig(p => ({ ...p, autoDetect: false }));
                    }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'training' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    data-neuro-target="true"
                >
                    <Zap size={14} /> <span className="hidden sm:inline">Training</span>
                </button>
                <button 
                    onClick={() => {
                        setViewMode('demo');
                        setConfig(p => ({ ...p, autoDetect: true }));
                    }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'demo' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    data-neuro-target="true"
                >
                    <Layers size={14} /> <span className="hidden sm:inline">Real World</span><span className="inline sm:hidden">Demo</span>
                </button>
            </div>
        </div>

        {/* Workspace Container */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
            {viewMode === 'training' ? (
                <>
                    <Workspace 
                        layout={currentDisplayLayout}
                        config={config} 
                        onTargetClick={handleTargetClick}
                        activeItems={activeItems}
                        gridCols={currentLevel.gridCols || 3}
                    />
                    
                    {/* Level Completion Overlay */}
                    {isLevelComplete && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 animate-in fade-in duration-300 p-4">
                            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center transform animate-in zoom-in-50 duration-300 max-w-sm w-full">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 shadow-lg shadow-emerald-500/30">
                                    <Trophy size={32} />
                                </div>
                                
                                {isFinalCampaignLevel ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-white mb-2">Campaign Complete!</h2>
                                        <p className="text-slate-400 mb-6">You have mastered the basics. Now test your skills in the real world or build your own challenges.</p>
                                        
                                        <div className="space-y-3">
                                            <button 
                                                onClick={handleGoToRealWorld}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                                data-neuro-target="true"
                                            >
                                                <Layers size={18} /> Test Real World Demo
                                            </button>
                                            <button 
                                                onClick={handleGoToCustomCreation}
                                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-blue-500/30"
                                                data-neuro-target="true"
                                            >
                                                <BrainCircuit size={18} /> Create Custom Stage
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {currentLevel.isCustom ? 'Scenario Cleared!' : 'Level Complete!'}
                                        </h2>
                                        <p className="text-slate-400 mb-6">
                                            {currentLevel.isCustom ? 'Great job on this custom task.' : 'Ready for the next challenge?'}
                                        </p>
                                        
                                        {!currentLevel.isCustom && allLevels.findIndex(l => l.id === currentLevelId) < LEVELS.length - 1 && (
                                            <button 
                                                onClick={handleNextLevel}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                                data-neuro-target="true"
                                            >
                                                Next Level <ArrowRight size={18} />
                                            </button>
                                        )}
                                        
                                        {currentLevel.isCustom && (
                                            <button 
                                                onClick={() => setIsLevelComplete(false)}
                                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                                                data-neuro-target="true"
                                            >
                                                Replay Level
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <RealWorldDemo />
            )}
        </div>

        {viewMode === 'training' && <AnalyticsPanel stats={stats} />}
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}
    </div>
  );
};

export default App;
