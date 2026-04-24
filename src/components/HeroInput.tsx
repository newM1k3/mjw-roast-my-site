import { useState } from 'react';
import { Flame, Globe, AlertTriangle, TrendingDown, Zap } from 'lucide-react';

interface HeroInputProps {
  onSubmit: (url: string) => void;
}

export default function HeroInput({ onSubmit }: HeroInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Enter a URL. We know you have one.');
      return;
    }
    setError('');
    onSubmit(url.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-rose-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px)',
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Flame className="text-rose-500 w-6 h-6" />
          <span className="text-white font-black text-lg tracking-tight uppercase">The Shutdown</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">Live Audit Tool</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-2 mb-8">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">No Sugar Coating. No Mercy.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Find out why your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
              website is losing
            </span>
            <br />
            money.
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            Enter your URL for a brutal, honest, no-sugar-coating teardown of your UX, speed, and copy.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yoursite.com"
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="group relative bg-rose-600 hover:bg-rose-500 text-white font-black text-lg px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50 hover:shadow-rose-600/40 whitespace-nowrap overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <Flame className="relative w-5 h-5" />
                <span className="relative">Roast My Site</span>
              </button>
            </div>
            {error && (
              <p className="mt-3 text-rose-400 text-sm font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </form>

          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: <Zap className="w-5 h-5" />, label: 'Speed Score', value: 'Brutal' },
              { icon: <TrendingDown className="w-5 h-5" />, label: 'UX Failures', value: 'Exposed' },
              { icon: <AlertTriangle className="w-5 h-5" />, label: 'Copy Sins', value: 'Destroyed' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                <div className="text-rose-500 mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-white font-black text-lg">{stat.value}</div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 border-t border-slate-800/50">
        <p className="text-slate-600 text-xs uppercase tracking-widest">
          Powered by Claude Vision + PageSpeed Intelligence
        </p>
      </footer>
    </div>
  );
}
