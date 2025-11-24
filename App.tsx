
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CursorConfig, AppState, GeneratedLayout, Level, LevelStats } from './types';
import { 
    DEFAULT_GRAVITY_RADIUS, 
    DEFAULT_GRAVITY_STRENGTH, 
    DEFAULT_CURSOR_SPEED,
    DEFAULT_SNAP_STRENGTH,
    DEFAULT_DWELL_ENABLED, 
    DEFAULT_DWELL_DELAY,
    DEFAULT_AUTO_DETECT,
    DEFAULT_CURSOR_TYPE,
    DEFAULT_CURSOR_SIZE,
    LEVELS,
    STORAGE_KEY_CUSTOM_LEVELS
} from './constants';
import ControlPanel from './components/ControlPanel';
import Workspace from './components/Workspace';
import SmartCursor from './components/SmartCursor';
import AnalyticsPanel from './components/AnalyticsPanel';
import RealWorldDemo from './components/RealWorldDemo';
import SettingsModal from './components/SettingsModal';
import { generateLayout } from './services/geminiService';
import { Layers, Zap, Trophy, ArrowRight, Menu, X, CheckCircle2, BrainCircuit, RotateCcw, Play } from 'lucide-react';

const INITIAL_CONFIG: CursorConfig = {
  gravityRadius: DEFAULT_GRAVITY_RADIUS,
  gravityStrength: DEFAULT_GRAVITY_STRENGTH,
  cursorSpeed: DEFAULT_CURSOR_SPEED,
  snapStrength: DEFAULT_SNAP_STRENGTH,
  assistMode: true,
  lockMode: false,
  showTrail: true,
  visualFeedback: true,
  dwellEnabled: DEFAULT_DWELL_ENABLED,
  dwellDelay: DEFAULT_DWELL_DELAY,
  autoDetect: DEFAULT_AUTO_DETECT,
  cursorType: DEFAULT_CURSOR_TYPE,
  cursorSize: DEFAULT_CURSOR_SIZE
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

// Helper to convert Level to GeneratedLayout
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
    misses: 0,
    startTime: Date.now(),
    avgTimeBetweenClicks: 0,
    history: [],
    levelStats: {} // Per-level tracking
  });
  
  const lastClickTimeRef = useRef<number>(Date.now());
  const levelStartTimeRef = useRef<number>(Date.now());

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
      const timeout = setTimeout(() => {
          setLayoutVersion(prev => prev + 1);
      }, 350); 
      return () => clearTimeout(timeout);
  }, [isSidebarOpen]);

  // Combine standard and custom levels
  const allLevels = useMemo(() => [...LEVELS, ...customLevels], [customLevels]);
  const currentLevel = allLevels.find(l => l.id === currentLevelId) || LEVELS[0];
  
  const isFinalCampaignLevel = !currentLevel.isCustom && allLevels.findIndex(l => l.id === currentLevelId) === LEVELS.length - 1;

  // Reset active items and stats when level changes
  useEffect(() => {
    setActiveItems(new Set());
    setIsLevelComplete(false);
    setLayoutVersion(prev => prev + 1);
    
    lastClickTimeRef.current = Date.now();
    levelStartTimeRef.current = Date.now();
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
  
  const handleRepeatLevel = () => {
      setIsLevelComplete(false);
      setActiveItems(new Set());
      lastClickTimeRef.current = Date.now();
      levelStartTimeRef.current = Date.now();
      setLayoutVersion(prev => prev + 1);
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

  const handleMiss = () => {
      setStats(prev => ({
          ...prev,
          misses: prev.misses + 1
      }));
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 100);
  };

  const handleTargetClick = (id: string, isCorrect: boolean) => {
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;
    
    // Debounce very fast double clicks
    if (timeDiff < 50) return;
    lastClickTimeRef.current = now;

    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    const levelTime = now - levelStartTimeRef.current;
    const currentScoreAdd = isCorrect ? 100 : 0;

    let levelCompleteTrigger = false;

    if (isCorrect) {
        const newActive = new Set(activeItems);
        newActive.add(id);
        setActiveItems(newActive);

        const totalCorrect = currentLevel.items.filter(i => i.isCorrect).length;
        if (newActive.size >= totalCorrect) {
            levelCompleteTrigger = true;
            setIsLevelComplete(true);
        }
    }

    setStats(prev => {
        const newClicks = prev.clicks + 1;
        const newAvg = prev.avgTimeBetweenClicks === 0 
            ? timeDiff 
            : (prev.avgTimeBetweenClicks * (newClicks - 1) + timeDiff) / newClicks;
        
        // Update per-level stats
        const currentStats: LevelStats = prev.levelStats[currentLevelId] || {
            attempts: 0,
            bestScore: 0,
            bestTime: 0,
            lastPlayed: 0,
            accuracyHistory: []
        };
        
        // If level completed just now, update bests
        const updatedLevelStats: LevelStats = {
             ...currentStats,
             lastPlayed: now,
             // Increment attempts only if this is the first interaction or a restart
             attempts: activeItems.size === 0 ? currentStats.attempts + 1 : currentStats.attempts
        };

        if (levelCompleteTrigger) {
             const runScore = currentScoreAdd + (prev.score); // Simplified run score tracking
             updatedLevelStats.bestScore = Math.max(currentStats.bestScore, runScore); // Basic score logic
             updatedLevelStats.bestTime = currentStats.bestTime === 0 ? levelTime : Math.min(currentStats.bestTime, levelTime);
        }

        return {
            ...prev,
            currentLevelId: currentLevelId,
            score: prev.score + currentScoreAdd,
            clicks: newClicks,
            avgTimeBetweenClicks: newAvg,
            history: [...prev.history, { time: newClicks, speed: timeDiff }].slice(-20),
            levelStats: {
                ...prev.levelStats,
                [currentLevelId]: updatedLevelStats
            }
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
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
        stats={stats}
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
                onOpenSettings={() => setIsSettingsOpen(true)}
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
                        onMiss={handleMiss}
                        activeItems={activeItems}
                        gridCols={currentLevel.gridCols || 3}
                    />
                    
                    {/* Level Completion Mastery Modal */}
                    {isLevelComplete && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md z-30 animate-in fade-in duration-300 p-4">
                            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center transform animate-in zoom-in-50 slide-in-from-bottom-5 duration-300 max-w-sm w-full relative overflow-hidden">
                                
                                {/* Background Shine */}
                                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-emerald-500/30 rotate-3">
                                        <Trophy size={40} className="drop-shadow-md" />
                                    </div>
                                    
                                    {isFinalCampaignLevel ? (
                                        <>
                                            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Campaign Cleared!</h2>
                                            <p className="text-slate-400 mb-8 text-sm leading-relaxed">You have mastered the curriculum. Test your skills in the real world or build custom challenges.</p>
                                            
                                            <div className="space-y-3">
                                                <button 
                                                    onClick={handleGoToRealWorld}
                                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-900/50"
                                                    data-neuro-target="true"
                                                >
                                                    <Layers size={20} /> Test Real World Demo
                                                </button>
                                                <button 
                                                    onClick={handleGoToCustomCreation}
                                                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-blue-500/30"
                                                    data-neuro-target="true"
                                                >
                                                    <BrainCircuit size={20} /> Create Custom Stage
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl font-bold text-white mb-1">
                                                {currentLevel.isCustom ? 'Scenario Cleared!' : 'Level Complete!'}
                                            </h2>
                                            <div className="flex justify-center items-center gap-2 text-slate-400 mb-6 text-sm">
                                                <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                                    Score: <span className="text-emerald-400 font-bold">{currentLevel.items.filter(i => i.isCorrect).length * 100}</span>
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Primary Action: Next Level */}
                                                {!currentLevel.isCustom && allLevels.findIndex(l => l.id === currentLevelId) < LEVELS.length - 1 && (
                                                    <button 
                                                        onClick={handleNextLevel}
                                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/50 group"
                                                        data-neuro-target="true"
                                                    >
                                                        Next Level 
                                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )}
                                                
                                                {/* Secondary Action: Repeat Level */}
                                                <button 
                                                    onClick={handleRepeatLevel}
                                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-slate-700"
                                                    data-neuro-target="true"
                                                >
                                                    <RotateCcw size={16} /> Repeat Level
                                                </button>
                                                
                                                {currentLevel.isCustom && (
                                                    <button 
                                                        onClick={() => setIsLevelComplete(false)}
                                                        className="w-full py-3 text-sm text-slate-500 hover:text-slate-400 font-medium"
                                                        data-neuro-target="true"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <RealWorldDemo />
            )}
        </div>

        {/* Analytics Panel - Always Visible */}
        <AnalyticsPanel stats={stats} viewMode={viewMode} />
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
