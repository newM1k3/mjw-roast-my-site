import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

const LOADING_MESSAGES = [
  'Pulling up your site...',
  'Judging your hero image...',
  'Timing your massive load delay...',
  'Sighing heavily at your copy...',
  'Counting your missing CTAs...',
  'Documenting the UX carnage...',
  'Analyzing your font choices... yikes.',
  'Measuring how far your conversion rate has fallen...',
  'Consulting the book of web sins...',
  'Preparing the citation...',
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-900/15 rounded-full blur-[140px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-lg">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-slate-800 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-rose-500 animate-spin" />
            <Flame className="w-10 h-10 text-rose-500" />
          </div>
          <div className="absolute -inset-4 rounded-full bg-rose-500/5 animate-ping" />
        </div>

        <div>
          <h2 className="text-white font-black text-3xl sm:text-4xl tracking-tight mb-3">
            Analyzing Your Failures
          </h2>
          <div
            className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <p className="text-rose-400 font-semibold text-lg">{LOADING_MESSAGES[messageIndex]}</p>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3">
          {['Screenshot captured', 'PageSpeed analyzed', 'Roast generating'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  i === 0
                    ? 'bg-rose-500 border-rose-500'
                    : i === 1
                    ? 'bg-rose-500/50 border-rose-500/50 animate-pulse'
                    : 'border-slate-700'
                }`}
              >
                {i === 0 && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${i === 0 ? 'text-white' : i === 1 ? 'text-slate-400' : 'text-slate-600'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs uppercase tracking-widest">
          This typically takes 15-30 seconds
        </p>
      </div>
    </div>
  );
}
