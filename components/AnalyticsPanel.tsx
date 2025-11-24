import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppState } from '../types';
import { Activity } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: AppState;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats }) => {
  return (
    <div className="absolute bottom-6 right-6 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-0 pointer-events-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Activity size={16} className="text-green-400" />
          Motion Efficiency
        </h3>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded">
          {stats.score} PTS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/50 p-2 rounded-lg">
          <div className="text-xs text-slate-500">Clicks</div>
          <div className="text-lg font-bold text-white">{stats.clicks}</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded-lg">
          <div className="text-xs text-slate-500">Avg Time</div>
          <div className="text-lg font-bold text-white">
            {stats.avgTimeBetweenClicks > 0 ? (stats.avgTimeBetweenClicks / 1000).toFixed(2) : '0.00'}s
          </div>
        </div>
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.history}>
            <defs>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
              itemStyle={{ color: '#cbd5e1' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: number) => [`${value}ms`, 'Response']}
            />
            <Area 
                type="monotone" 
                dataKey="speed" 
                stroke="#22d3ee" 
                fillOpacity={1} 
                fill="url(#colorSpeed)" 
                isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPanel;