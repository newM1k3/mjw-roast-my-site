import { AlertTriangle, TrendingDown, Monitor, Zap, CheckCircle, XCircle, ExternalLink, RotateCcw, Flame } from 'lucide-react';
import type { RoastResult } from '../types';

interface RoastScorecardProps {
  result: RoastResult;
  onReset: () => void;
}

const GRADE_CONFIG: Record<RoastResult['tafferGrade'], { color: string; bg: string; border: string; label: string }> = {
  F: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/40', label: 'Catastrophic Failure' },
  D: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/40', label: 'Dangerously Bad' },
  C: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', label: 'Mediocre at Best' },
  B: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', label: 'Room to Improve' },
  A: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', label: 'Respectable' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : score >= 25 ? 'bg-orange-500' : 'bg-rose-500';
  return (
    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000 rounded-full`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function FailureCard({ item, index }: { item: { issue: string; fix: string }; index: number }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-rose-500/20 text-rose-400 text-xs font-black flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <p className="text-rose-300 font-semibold text-sm leading-relaxed">{item.issue}</p>
        </div>
      </div>
      <div className="p-4 bg-emerald-950/30">
        <div className="flex items-start gap-2.5">
          <CheckCircle className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
          <p className="text-emerald-300 text-sm leading-relaxed">{item.fix}</p>
        </div>
      </div>
    </div>
  );
}

function FailureSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ issue: string; fix: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-rose-500">{icon}</div>
        <h3 className="text-white font-black text-base uppercase tracking-widest">{title}</h3>
        <div className="flex-1 h-px bg-slate-800" />
        <span className="bg-rose-500/20 text-rose-400 text-xs font-black px-2 py-0.5 rounded">
          {items.length} {items.length === 1 ? 'VIOLATION' : 'VIOLATIONS'}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <FailureCard key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function RoastScorecard({ result, onReset }: RoastScorecardProps) {
  const grade = GRADE_CONFIG[result.tafferGrade];
  const totalViolations = result.uxFailures.length + result.speedFailures.length + result.copyFailures.length;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-rose-900/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.05) 39px, rgba(255,255,255,0.05) 40px)',
          }}
        />
      </div>

      <header className="relative z-10 border-b border-slate-800/60 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-rose-500 w-6 h-6" />
            <span className="text-white font-black text-lg tracking-tight uppercase">Taffer Takedown</span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Roast Another Site</span>
            <span className="sm:hidden">Again</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        <div className={`rounded-2xl border ${grade.border} ${grade.bg} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 text-center">
              <div className={`text-9xl font-black leading-none ${grade.color}`} style={{ textShadow: '0 0 80px currentColor' }}>
                {result.tafferGrade}
              </div>
              <div className={`text-xs font-black uppercase tracking-widest mt-1 ${grade.color} opacity-70`}>
                {grade.label}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-1">
                  {result.theRoast.headline}
                </h1>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  {result.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 rounded-lg p-3">
                  <Zap className="w-4 h-4 text-orange-400 mb-1" />
                  <div className="text-white font-black text-xl">{result.performanceScore}</div>
                  <div className="text-slate-500 text-xs uppercase tracking-wider">Speed Score</div>
                  <div className="mt-2">
                    <ScoreBar score={result.performanceScore} />
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-3">
                  <Monitor className="w-4 h-4 text-orange-400 mb-1" />
                  <div className={`font-black text-xl ${result.mobileFriendly ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {result.mobileFriendly ? 'Pass' : 'Fail'}
                  </div>
                  <div className="text-slate-500 text-xs uppercase tracking-wider">Mobile</div>
                  <div className="mt-2 flex items-center gap-1">
                    {result.mobileFriendly ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="text-slate-600 text-xs">Viewport</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mb-1" />
                  <div className="text-rose-400 font-black text-xl">{totalViolations}</div>
                  <div className="text-slate-500 text-xs uppercase tracking-wider">Violations</div>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-slate-600 text-xs">Cited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-rose-500 rounded-full" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">The Verdict</h2>
            </div>
            <blockquote className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative">
              <div className="absolute top-4 left-4 text-rose-500/20 font-black text-6xl leading-none select-none">"</div>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed relative z-10 pt-4">
                {result.theRoast.brutalSummary}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span className="text-rose-500 text-xs font-black uppercase tracking-widest">Taffer Takedown Assessment</span>
              </div>
            </blockquote>
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-slate-600 rounded-full" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Visual Evidence</h2>
            </div>
            <div className="relative rounded-xl overflow-hidden border-2 border-rose-500/50 shadow-xl shadow-rose-900/20 group">
              <img
                src={result.screenshotUrl}
                alt={`Screenshot of ${result.url}`}
                className="w-full object-cover object-top"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white text-sm font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </a>
              </div>
              <div className="absolute top-2 right-2 bg-rose-600 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider">
                Exhibit A
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-1">
          <div className="bg-slate-950/60 rounded-xl p-4 sm:p-6 border border-slate-900">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-500/20 rounded-lg p-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg uppercase tracking-tight">Citation Report</h2>
                <p className="text-slate-500 text-xs mt-0.5">{totalViolations} violations across {[result.uxFailures.length, result.speedFailures.length, result.copyFailures.length].filter(Boolean).length} categories</p>
              </div>
            </div>
            <div className="space-y-8">
              {result.uxFailures.length > 0 && (
                <FailureSection
                  title="UX Failures"
                  icon={<Monitor className="w-5 h-5" />}
                  items={result.uxFailures}
                />
              )}
              {result.speedFailures.length > 0 && (
                <FailureSection
                  title="Speed Violations"
                  icon={<Zap className="w-5 h-5" />}
                  items={result.speedFailures}
                />
              )}
              {result.copyFailures.length > 0 && (
                <FailureSection
                  title="Copy Crimes"
                  icon={<TrendingDown className="w-5 h-5" />}
                  items={result.copyFailures}
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-6">
            <TrendingDown className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-orange-300 font-semibold text-base italic leading-relaxed">
              "{result.theBottomLine}"
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-rose-500/40 via-orange-500/20 to-transparent mb-8" />
          <div className="text-center mb-6">
            <h2 className="text-white font-black text-2xl sm:text-3xl mb-2">Tired of losing money?</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">
              You have two choices. Fix it yourself, or let us build it right.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <a
              href="https://mjwdesign.com/playbook"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-150 text-center"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              <span>Get the MJW Communication Playbook</span>
            </a>
            <a
              href="https://mjwdesign.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group relative flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-6 rounded-xl transition-all duration-150 text-center shadow-lg shadow-rose-900/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Flame className="relative w-5 h-5 flex-shrink-0" />
              <span className="relative">Hire MJW Design</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-slate-800/40 px-6 py-6 text-center mt-10">
        <p className="text-slate-600 text-xs uppercase tracking-widest">
          Taffer Takedown — A MJW Personal App Platform Tool
        </p>
      </footer>
    </div>
  );
}
