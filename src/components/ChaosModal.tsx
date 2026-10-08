import React, { useState } from 'react';
import { X, Zap, AlertTriangle, ShieldCheck, Flame, Cpu, Radio } from 'lucide-react';

interface ChaosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectChaos: (chaos: { title: string; description: string; severity: 'warning' | 'critical' }) => void;
}

export const ChaosModal: React.FC<ChaosModalProps> = ({
  isOpen,
  onClose,
  onInjectChaos,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const quickChaosOptions = [
    {
      title: 'Secondary Subsystem Failure Cascade',
      description: 'Auxiliary backup cooling loop abruptly fails due to thermal valve seizure, spiking core temperature by +42°C.',
      severity: 'critical' as const,
      icon: <Flame className="w-4 h-4 text-rose-400" />,
    },
    {
      title: 'Sudden Environmental Storm Vector',
      description: 'Localized microburst wind shear increases by 45 knots, altering dispersion boundaries.',
      severity: 'critical' as const,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    {
      title: 'Hostile Algorithmic Spoofing Wave',
      description: 'Synthetic adversarial orders flood ingestion gateway with 15,000 req/sec bogus telemetry.',
      severity: 'critical' as const,
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    },
    {
      title: 'Critical Gateway Network Partition',
      description: 'Packet drop between primary node and secondary corridor exceeds 35%, cutting direct feedback.',
      severity: 'warning' as const,
      icon: <Radio className="w-4 h-4 text-orange-400" />,
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onInjectChaos({
      title: customTitle.trim(),
      description: customDesc.trim() || 'Unplanned environmental disturbance injected by human operator.',
      severity: 'critical',
    });
    setCustomTitle('');
    setCustomDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Inject Environmental Chaos Event
              </h3>
              <p className="text-xs text-slate-400">
                Test the 3-agent swarm's autonomous resilience against sudden disruptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Select an anomaly to inject into the live environment. The <strong>Tracker</strong> will immediately detect the deviation, the <strong>Predictor</strong> will recalculate the failure horizon, and the <strong>Commander</strong> will adapt the strategy.
          </p>

          {/* Quick Options */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pre-Engineered Stress Scenarios
            </div>
            {quickChaosOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onInjectChaos(opt);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-rose-700/60 hover:bg-rose-950/20 transition group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-200">
                      {opt.title}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                    {opt.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-normal">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Chaos Form */}
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Custom Disturbance
            </div>
            <input
              type="text"
              placeholder="Disturbance title (e.g. Hostile DDOS on GPS feed)..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500/60"
            />
            <input
              type="text"
              placeholder="Description & telemetry symptom..."
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500/60"
            />
            <button
              type="submit"
              disabled={!customTitle.trim()}
              className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Inject Custom Anomaly</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
