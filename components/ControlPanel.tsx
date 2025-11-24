import React, { useState } from 'react';
import { CursorConfig } from '../types';
import { Settings, MousePointer2, Lock, BrainCircuit, Timer, Accessibility, Globe, ChevronRight } from 'lucide-react';
import { MIN_DWELL_DELAY, MAX_DWELL_DELAY } from '../constants';

interface ControlPanelProps {
  config: CursorConfig;
  setConfig: React.Dispatch<React.SetStateAction<CursorConfig>>;
  onGenerate: (prompt: string) => void;
  loading: boolean;
  currentLevel: number;
  totalLevels: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerate, loading, currentLevel, totalLevels }) => {
  const [prompt, setPrompt] = useState('');
  const [showAi, setShowAi] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setShowAi(false);
    }
  };

  return (
    <div className="w-72 h-full bg-slate-950 border-r border-slate-800 p-5 flex flex-col gap-6 overflow-y-auto relative z-10 scrollbar-hide text-slate-300" data-neuro-target="false">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 pb-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
           <BrainCircuit size={18} />
        </div>
        <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
            NeuroCursor
            </h1>
            <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">System Online</p>
            </div>
        </div>
      </div>

      {/* Level Status */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="text-xl font-bold text-white font-mono">{currentLevel}<span className="text-slate-600 text-sm">/{totalLevels}</span></span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                style={{ width: `${(currentLevel / totalLevels) * 100}%` }}
              />
          </div>
      </div>

      {/* Configuration Group */}
      <div className="space-y-5">
        
        {/* Physics Section */}
        <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Settings size={12} /> Physics Engine
            </h2>

            <div className="bg-slate-900 rounded-lg border border-slate-800 p-1 space-y-1">
                <div className="flex items-center justify-between p-2">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                         Magnetic Assist
                    </label>
                    <Toggle 
                        active={config.assistMode} 
                        onChange={() => setConfig(prev => ({ ...prev, assistMode: !prev.assistMode }))} 
                    />
                </div>

                <div className="px-3 pb-3 pt-1">
                    <div className="flex justify-between text-[10px] mb-2 font-mono text-slate-500">
                        <span>SNAP RADIUS</span>
                        <span>{config.gravityRadius}px</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="200"
                        value={config.gravityRadius}
                        onChange={(e) => setConfig(prev => ({ ...prev, gravityRadius: Number(e.target.value) }))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        data-neuro-target="true"
                    />
                </div>
            </div>
        </section>

        {/* Accessibility Section */}
        <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Accessibility size={12} /> Accessibility
            </h2>

            <div className="bg-slate-900 rounded-lg border border-slate-800 p-1 space-y-1">
                 <div className="flex items-center justify-between p-2">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                        Dwell Click
                    </label>
                    <Toggle 
                        active={config.dwellEnabled} 
                        onChange={() => setConfig(prev => ({ ...prev, dwellEnabled: !prev.dwellEnabled }))} 
                    />
                </div>

                {config.dwellEnabled && (
                    <div className="px-3 pb-3 pt-1 animate-in slide-in-from-top-1 fade-in">
                        <div className="flex justify-between text-[10px] mb-2 font-mono text-slate-500">
                            <span>DELAY</span>
                            <span>{(config.dwellDelay / 1000).toFixed(1)}s</span>
                        </div>
                        <input
                        type="range"
                        min={MIN_DWELL_DELAY}
                        max={MAX_DWELL_DELAY}
                        step="100"
                        value={config.dwellDelay}
                        onChange={(e) => setConfig(prev => ({ ...prev, dwellDelay: Number(e.target.value) }))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        data-neuro-target="true"
                        />
                    </div>
                )}
            </div>
        </section>

        {/* Modes Section */}
        <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Globe size={12} /> Global Settings
            </h2>
            
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-1 divide-y divide-slate-800/50">
                 <div className="flex items-center justify-between p-2.5">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-300">Universal Access</span>
                        <span className="text-[10px] text-slate-500">Detect web elements</span>
                    </div>
                    <Toggle 
                        active={config.autoDetect} 
                        onChange={() => setConfig(prev => ({ ...prev, autoDetect: !prev.autoDetect }))} 
                        color="bg-indigo-500"
                    />
                </div>

                 <div className="flex items-center justify-between p-2.5">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-300">Focus Lock</span>
                        <span className="text-[10px] text-slate-500">Block wrong targets</span>
                    </div>
                    <Toggle 
                        active={config.lockMode} 
                        onChange={() => setConfig(prev => ({ ...prev, lockMode: !prev.lockMode }))} 
                        color="bg-rose-500"
                    />
                </div>
            </div>
        </section>

        {/* AI Generator Toggle */}
        <div className="pt-2">
            <button 
                onClick={() => setShowAi(!showAi)}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-400 transition-colors"
                data-neuro-target="true"
            >
                {showAi ? 'Hide AI Tools' : 'Show AI Tools'}
            </button>
            
            {showAi && (
                <div className="mt-3 bg-slate-900 p-3 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleGenerate}>
                        <textarea
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:border-blue-500/50 outline-none resize-none h-16 mb-2"
                            placeholder="Describe custom level..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            data-neuro-target="true"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-xs font-medium disabled:opacity-50"
                            data-neuro-target="true"
                        >
                            {loading ? 'Processing...' : 'Generate Layout'}
                        </button>
                    </form>
                </div>
            )}
        </div>

      </div>

      <div className="mt-auto pt-4 border-t border-slate-800 text-center">
         <p className="text-[10px] text-slate-700 font-mono">v2.1.4_STABLE</p>
      </div>
    </div>
  );
};

const Toggle = ({ active, onChange, color = 'bg-blue-500' }: { active: boolean, onChange: () => void, color?: string }) => (
    <button
        className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${active ? color : 'bg-slate-700'}`}
        onClick={onChange}
        data-neuro-target="true"
    >
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-4' : ''}`} />
    </button>
);

export default ControlPanel;