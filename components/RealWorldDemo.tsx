import React, { useState, useCallback } from 'react';
import { Mail, Bell, Search, Home, BarChart3, Users, Settings as SettingsIcon, Check } from 'lucide-react';

const RealWorldDemo: React.FC = () => {
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);

  const addToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const handleClick = (label: string) => {
      addToast(`Action: ${label}`);
  };

  return (
    <div className="flex-1 h-full bg-slate-50 overflow-y-auto overflow-x-hidden text-slate-800 font-sans relative">
      
      {/* Toast Container */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
              <div key={t.id} className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-right fade-in duration-300">
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium">{t.text}</span>
              </div>
          ))}
      </div>

      <div className="max-w-6xl mx-auto p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">D</div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          </div>
          <div className="flex gap-3">
             <button onClick={() => handleClick("Search")} className="p-2.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 text-slate-600 transition-colors focus:ring-2 ring-blue-500/50">
                <Search size={18} />
             </button>
             <button onClick={() => handleClick("Notifications")} className="p-2.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 text-slate-600 transition-colors focus:ring-2 ring-blue-500/50">
                <Bell size={18} />
             </button>
             <button onClick={() => handleClick("New Project")} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 font-medium transition-colors text-sm active:scale-95 transform">
                New Project
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Users', val: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Revenue', val: '$42.5k', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Active Now', val: '321', icon: ActivityIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} onClick={() => handleClick(`View ${stat.label}`)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer active:scale-95">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Form Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Mail size={18} className="text-slate-400" />
                    Contact Support
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleClick("Send Message"); }} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                            <input type="text" placeholder="Jane" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                            <input type="text" placeholder="Doe" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input type="email" placeholder="jane@example.com" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                        <textarea placeholder="How can we help you today?" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all h-32 text-sm resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 font-medium transition-transform active:scale-[0.98]">
                        Send Message
                    </button>
                </form>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
             <div onClick={() => handleClick("Inbox")} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group active:scale-95">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Mail />
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900">Inbox</h3>
                        <p className="text-sm text-slate-500">12 Unread Messages</p>
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-medium mb-4 text-slate-900">Quick Navigation</h3>
                <nav className="flex flex-col gap-2">
                    {[
                        { name: 'Home', icon: Home },
                        { name: 'Team Members', icon: Users },
                        { name: 'Analytics', icon: BarChart3 },
                        { name: 'Settings', icon: SettingsIcon },
                    ].map((item, i) => (
                        <button key={i} onClick={() => handleClick(`Nav: ${item.name}`)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-left">
                            <item.icon size={18} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                <h3 className="font-bold text-lg mb-2">Pro Plan</h3>
                <p className="text-blue-100 text-sm mb-4">Upgrade for advanced features.</p>
                <button onClick={() => handleClick("Upgrade")} className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium transition-colors">
                    Upgrade Now
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const ActivityIcon = ({size, className}: {size: number, className?: string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

export default RealWorldDemo;