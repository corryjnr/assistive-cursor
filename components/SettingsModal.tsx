
import React, { useState } from 'react';
import { CursorConfig, AppState, CursorType } from '../types';
import { X, Wand2, MousePointer2, Eye, Database, Check, Crosshair, Circle, MousePointer } from 'lucide-react';
import { analyzePerformance } from '../utils/analysis';
import { LEVELS } from '../constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: CursorConfig;
    setConfig: React.Dispatch<React.SetStateAction<CursorConfig>>;
    stats: AppState;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, setConfig, stats }) => {
    const [activeTab, setActiveTab] = useState<'physics' | 'interface' | 'data'>('physics');
    const [tuningResult, setTuningResult] = useState<{ msg: string, changes: Partial<CursorConfig> } | null>(null);

    if (!isOpen) return null;

    const handleSmartTune = () => {
        const result = analyzePerformance(stats, config);
        setTuningResult({ msg: result.suggestion, changes: result.changes });
    };

    const applyTune = () => {
        if (tuningResult) {
            setConfig(prev => ({ ...prev, ...tuningResult.changes }));
            setTuningResult(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Settings & Configuration
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900">
                    {[
                        { id: 'physics', label: 'Physics Engine', icon: MousePointer2 },
                        { id: 'interface', label: 'Interface', icon: Eye },
                        { id: 'data', label: 'Data & Stats', icon: Database },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-900/50">
                    
                    {activeTab === 'physics' && (
                        <div className="space-y-6">
                            {/* Smart Tune Section */}
                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Wand2 size={80} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Wand2 size={20} className="text-purple-400" /> Smart Tune
                                </h3>
                                <p className="text-sm text-slate-300 mb-4 max-w-md">
                                    Analyze your recent training performance (Accuracy: {stats.clicks > 0 ? Math.round((stats.clicks / (stats.clicks + stats.misses)) * 100) : 0}%) to automatically calibrate the physics engine for your needs.
                                </p>
                                
                                {tuningResult ? (
                                    <div className="bg-slate-950/50 rounded-lg p-4 border border-indigo-500/50 mb-3 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-sm text-indigo-200 mb-3 italic">"{tuningResult.msg}"</p>
                                        <div className="flex gap-3">
                                            <button onClick={applyTune} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                                                <Check size={14} /> Apply Recommendation
                                            </button>
                                            <button onClick={() => setTuningResult(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={handleSmartTune} className="px-5 py-2.5 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20">
                                        Run Analysis
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                                        Cursor Speed (Lerp) <span className="text-blue-400 font-mono">{config.cursorSpeed.toFixed(2)}</span>
                                    </label>
                                    <input 
                                        type="range" min="0.05" max="0.95" step="0.05"
                                        value={config.cursorSpeed}
                                        onChange={(e) => setConfig(c => ({ ...c, cursorSpeed: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Lower = smoother/laggy. Higher = faster response.</p>
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                                        Snap Strength <span className="text-blue-400 font-mono">{config.snapStrength.toFixed(2)}</span>
                                    </label>
                                    <input 
                                        type="range" min="0.05" max="0.9" step="0.05"
                                        value={config.snapStrength}
                                        onChange={(e) => setConfig(c => ({ ...c, snapStrength: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">How aggressively the cursor locks onto targets.</p>
                                </div>
                                
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                                        Gravity Radius <span className="text-blue-400 font-mono">{config.gravityRadius}px</span>
                                    </label>
                                    <input 
                                        type="range" min="20" max="250" step="10"
                                        value={config.gravityRadius}
                                        onChange={(e) => setConfig(c => ({ ...c, gravityRadius: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Distance at which the cursor begins to assist.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'interface' && (
                        <div className="space-y-6">
                             {/* Cursor Style Selector */}
                             <div>
                                 <label className="block text-sm font-medium text-white mb-3">Cursor Style</label>
                                 <div className="grid grid-cols-4 gap-3">
                                     {[
                                         { id: 'dot', icon: Circle, label: 'Dot' },
                                         { id: 'crosshair', icon: Crosshair, label: 'Cross' },
                                         { id: 'ring', icon: Circle, label: 'Ring' }, // Reusing circle for ring but will rely on label/impl
                                         { id: 'pointer', icon: MousePointer, label: 'Pointer' },
                                     ].map(type => (
                                         <button
                                            key={type.id}
                                            onClick={() => setConfig(c => ({ ...c, cursorType: type.id as CursorType }))}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${config.cursorType === type.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                         >
                                             <type.icon size={24} className={type.id === 'ring' ? 'stroke-2 fill-none' : type.id === 'dot' ? 'fill-current' : ''} />
                                             <span className="text-xs font-medium">{type.label}</span>
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Cursor Size Slider */}
                             <div>
                                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                                        Cursor Size Scale <span className="text-blue-400 font-mono">{config.cursorSize ? config.cursorSize.toFixed(1) : 1.0}x</span>
                                    </label>
                                    <input 
                                        type="range" min="0.5" max="2.0" step="0.1"
                                        value={config.cursorSize || 1.0}
                                        onChange={(e) => setConfig(c => ({ ...c, cursorSize: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Scale cursor visual for visibility.</p>
                             </div>

                             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Visual Feedback</h4>
                                    <p className="text-[10px] text-slate-400">Ripples and color changes on interaction</p>
                                </div>
                                <button 
                                    onClick={() => setConfig(c => ({ ...c, visualFeedback: !c.visualFeedback }))}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${config.visualFeedback ? 'bg-blue-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.visualFeedback ? 'translate-x-4' : ''}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Motion Trail</h4>
                                    <p className="text-[10px] text-slate-400">Show path history visually</p>
                                </div>
                                <button 
                                    onClick={() => setConfig(c => ({ ...c, showTrail: !c.showTrail }))}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${config.showTrail ? 'bg-blue-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.showTrail ? 'translate-x-4' : ''}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Auto-Detect Elements</h4>
                                    <p className="text-[10px] text-slate-400">Use heuristic scanner for buttons (Real World)</p>
                                </div>
                                <button 
                                    onClick={() => setConfig(c => ({ ...c, autoDetect: !c.autoDetect }))}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${config.autoDetect ? 'bg-blue-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.autoDetect ? 'translate-x-4' : ''}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white mb-2">Level Performance</h3>
                            <div className="space-y-2">
                                {Object.entries(stats.levelStats).map(([lvlId, data]) => {
                                    // Find level name
                                    const level = LEVELS.find(l => l.id.toString() === lvlId.toString()) || { title: `Custom Level ${lvlId}` };
                                    
                                    return (
                                        <div key={lvlId} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-white">{level.title}</div>
                                                <div className="text-[10px] text-slate-500">Played {data.attempts} times</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono text-emerald-400">Best: {data.bestScore}</div>
                                                <div className="text-[10px] text-slate-400">{(data.bestTime / 1000).toFixed(1)}s</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(stats.levelStats).length === 0 && (
                                    <div className="text-center text-slate-500 text-xs py-8">
                                        No level data recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
