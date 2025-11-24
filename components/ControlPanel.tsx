
import React, { useState } from 'react';
import { CursorConfig, Level } from '../types';
import { Settings, BrainCircuit, Accessibility, Trash2, Play, Activity, Sparkles, Sliders } from 'lucide-react';
import { 
    MIN_DWELL_DELAY, MAX_DWELL_DELAY, 
    MIN_CURSOR_SPEED, MAX_CURSOR_SPEED, 
    MIN_SNAP_STRENGTH, MAX_SNAP_STRENGTH 
} from '../constants';

interface ControlPanelProps {
  config: CursorConfig;
  setConfig: React.Dispatch<React.SetStateAction<CursorConfig>>;
  onGenerate: (prompt: string) => void;
  loading: boolean;
  levels: Level[];
  currentLevelId: string | number;
  onSelectLevel: (id: string | number) => void;
  onDeleteLevel: (id: string | number) => void;
  showAi: boolean;
  setShowAi: (show: boolean) => void;
  onOpenSettings: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  config, 
  setConfig, 
  onGenerate, 
  loading, 
  levels,
  currentLevelId,
  onSelectLevel,
  onDeleteLevel,
  showAi,
  setShowAi,
  onOpenSettings
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'campaign' | 'custom'>('campaign');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
      setActiveTab('custom'); 
    }
  };

  const campaignLevels = levels.filter(l => !l.isCustom);
  const customLevels = levels.filter(l => l.isCustom);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-slate-300" data-neuro-target="false">
      
      {/* Header */}
      <div className="p-5 pt-16 lg:pt-5 border-b border-slate-800 flex-shrink-0 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <BrainCircuit size={18} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-white tracking-tight">NeuroCursor</h1>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">System Online</p>
                </div>
            </div>
        </div>
        <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Full Settings"
            data-neuro-target="true"
        >
            <Settings size={20} />
        </button>
      </div>

      {/* Level Library */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 border-b border-slate-800 bg-slate-950">
         <div className="flex px-5 pt-4 gap-4 border-b border-slate-800/50">
            <button 
                onClick={() => setActiveTab('campaign')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'campaign' ? 'border-blue-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                data-neuro-target="true"
            >
                Campaign
            </button>
            <button 
                onClick={() => setActiveTab('custom')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'custom' ? 'border-blue-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                data-neuro-target="true"
            >
                Library ({customLevels.length})
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
             {activeTab === 'campaign' ? (
                 campaignLevels.map((level) => {
                     const isActive = level.id === currentLevelId;
                     return (
                         <button
                            key={level.id}
                            onClick={() => onSelectLevel(level.id)}
                            className={`w-full p-3 rounded-lg border flex items-center justify-between text-left transition-all group ${
                                isActive 
                                ? 'bg-blue-600/10 border-blue-500/50' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                            data-neuro-target="true"
                         >
                             <div className="flex items-center gap-3">
                                 <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                     {level.id}
                                 </div>
                                 <div>
                                     <div className={`text-xs font-medium ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>{level.title}</div>
                                     <div className="text-[10px] text-slate-500 line-clamp-1">{level.instruction}</div>
                                 </div>
                             </div>
                             {isActive && <Play size={12} className="text-blue-500 fill-blue-500" />}
                         </button>
                     );
                 })
             ) : (
                customLevels.length > 0 ? (
                    customLevels.map((level) => {
                        const isActive = level.id === currentLevelId;
                        return (
                            <div
                               key={level.id}
                               className={`w-full p-3 rounded-lg border flex items-center justify-between text-left transition-all group ${
                                   isActive 
                                   ? 'bg-indigo-600/10 border-indigo-500/50' 
                                   : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                               }`}
                            >
                                <button 
                                    onClick={() => onSelectLevel(level.id)}
                                    className="flex-1 flex items-center gap-3"
                                    data-neuro-target="true"
                                >
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        AI
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-xs font-medium truncate ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{level.title}</div>
                                        <div className="text-[10px] text-slate-500">
                                            {new Date(level.createdAt || 0).toLocaleDateString()}
                                        </div>
                                    </div>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteLevel(level.id); }}
                                    className="p-1.5 text-slate-600 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
                                    data-neuro-target="true"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 px-4">
                        <p className="text-xs text-slate-500 mb-2">No custom levels yet.</p>
                        <p className="text-[10px] text-slate-600">Use the AI generator below to create your own practice stages.</p>
                    </div>
                )
             )}
         </div>
      </div>

      {/* Settings & AI Area */}
      <div className="p-5 space-y-5 bg-slate-950 overflow-y-auto scrollbar-hide flex-shrink-0 max-h-[45vh]">
        
        {/* Physics Section */}
        <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Sliders size={12} /> Quick Tune
            </h2>
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-1 space-y-3">
                
                {/* Magnetic Assist Toggle */}
                <div className="flex items-center justify-between p-2 pb-0">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">Magnetic Assist</label>
                    <Toggle active={config.assistMode} onChange={() => setConfig(prev => ({ ...prev, assistMode: !prev.assistMode }))} />
                </div>

                {/* Snap Radius Slider */}
                <div className="px-3 pb-2">
                    <div className="flex justify-between text-[10px] mb-2 font-mono text-slate-500">
                        <span>RADIUS</span>
                        <span>{config.gravityRadius}px</span>
                    </div>
                    <input
                        type="range" min="20" max="200" value={config.gravityRadius}
                        onChange={(e) => setConfig(prev => ({ ...prev, gravityRadius: Number(e.target.value) }))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        data-neuro-target="true"
                    />
                </div>
            </div>
        </section>

        {/* AI Generator Toggle */}
        <div className="pt-2 border-t border-slate-800">
            <button 
                onClick={() => setShowAi(!showAi)}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-400 transition-colors"
                data-neuro-target="true"
            >
                {showAi ? 'Hide AI Creator' : 'Create Custom Level'}
            </button>
            
            {showAi && (
                <div className="mt-3 bg-slate-900 p-3 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleGenerate}>
                        <textarea
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:border-blue-500/50 outline-none resize-none h-16 mb-2"
                            placeholder="E.g., A grid of 10 red circles..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            data-neuro-target="true"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-xs font-medium disabled:opacity-50"
                            data-neuro-target="true"
                        >
                            {loading ? 'Generating...' : 'Generate & Save'}
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>

      <div className="p-2 border-t border-slate-800 text-center bg-slate-950">
         <p className="text-[10px] text-slate-700 font-mono">v3.0.0_STABLE</p>
      </div>
    </div>
  );
};

const Toggle = ({ active, onChange, color = 'bg-blue-500' }: { active: boolean, onChange: () => void, color?: string }) => (
    <button
        className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none flex-shrink-0 ${active ? color : 'bg-slate-700'}`}
        onClick={onChange}
        data-neuro-target="true"
    >
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-4' : ''}`} />
    </button>
);

export default ControlPanel;
