import { useState } from 'react';
import HeroInput from './components/HeroInput';
import LoadingState from './components/LoadingState';
import RoastScorecard from './components/RoastScorecard';
import type { RoastResult } from './types';

type AppState = 'input' | 'loading' | 'results' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('input');
  const [result, setResult] = useState<RoastResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (url: string) => {
    setState('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Something went wrong.');
      }

      const data: RoastResult = await res.json();
      setResult(data);
      setState('results');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to roast website.');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('input');
    setResult(null);
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (state === 'loading') return <LoadingState />;

  if (state === 'results' && result) {
    return <RoastScorecard result={result} onReset={handleReset} />;
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <span className="text-rose-500 text-3xl font-black">!</span>
        </div>
        <div>
          <h2 className="text-white font-black text-2xl mb-2">The Audit Failed</h2>
          <p className="text-slate-400 max-w-md">{errorMessage}</p>
        </div>
        <button
          onClick={handleReset}
          className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-3 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <HeroInput onSubmit={handleSubmit} />;
}
