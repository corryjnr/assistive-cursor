
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppState } from '../types';
import { Activity, ChevronDown, ChevronUp, MousePointer2, Target, Timer } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: AppState;
  viewMode?: 'training' | 'demo';
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, viewMode = 'training' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - stats.startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [stats.startTime]);

  const totalClicks = stats.clicks + stats.misses;
  const accuracy = totalClicks > 0 ? Math.round((stats.clicks / totalClicks) * 100) : 100;
  
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const cpm = elapsed > 0 ? Math.round(stats.clicks / (elapsed / 60000)) : 0;

  // Chart Gradient Definition
  const GradientColors = () => (
    <defs>
      <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
      </linearGradient>
    </defs>
  );

  return (
    <div 
        className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 ease-in-out font-sans ${isExpanded ? 'w-80' : 'w-auto'}`}
        data-neuro-target="false"
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header / Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors group outline-none"
          data-neuro-target="true"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
               <Activity size={16} />
            </div>
            
            {!isExpanded && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Score</span>
                         <span className="text-sm font-bold text-white font-mono">{stats.score}</span>
                    </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
                         <span className="text-sm font-bold text-white font-mono">{formatTime(elapsed)}</span>
                    </div>
                </div>
            )}
            
            {isExpanded && (
                <div>
                    <h3 className="text-sm font-bold text-white">Performance HUD</h3>
                    <p className="text-[10px] text-slate-400">Live Session Metrics</p>
                </div>
            )}
          </div>
          
          <div className="text-slate-500 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 pt-0 animate-in slide-in-from-bottom-2 fade-in duration-300">
            
            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <MousePointer2 size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Clicks</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stats.clicks}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{cpm} CPM</div>
                </div>
                
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Timer size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <div className="text-xl font-bold text-white">{formatTime(elapsed)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Avg: {(stats.avgTimeBetweenClicks / 1000).toFixed(2)}s</div>
                </div>
            </div>

            {/* Accuracy Bar (Hidden in Demo) */}
            {viewMode === 'training' && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Target size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Accuracy</span>
                        </div>
                        <span className={`text-xs font-bold ${accuracy >= 90 ? 'text-emerald-400' : accuracy >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {accuracy}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${accuracy >= 90 ? 'bg-emerald-500' : accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${accuracy}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-slate-600 font-mono">
                        <span>{stats.clicks} Hits</span>
                        <span>{stats.misses} Misses</span>
                    </div>
                </div>
            )}

            {/* Chart - Only render when expanded to avoid resize errors */}
            <div className="h-24 w-full bg-slate-800/30 rounded-lg overflow-hidden border border-slate-800 relative">
               <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.history}>
                        <GradientColors />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px', borderRadius: '6px' }}
                        itemStyle={{ color: '#94a3b8' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: number) => [`${Math.round(value)}ms`, 'Lag']}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="speed" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorSpeed)" 
                            isAnimationActive={false}
                        />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
