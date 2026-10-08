import React from 'react';
import {
  Share2,
  TrendingDown,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import { BlackboardState, MissionTask } from '../types/agent';

interface BlackboardWorkspaceProps {
  blackboard: BlackboardState;
  task: MissionTask;
  round: number;
}

export const BlackboardWorkspace: React.FC<BlackboardWorkspaceProps> = ({
  blackboard,
  task,
  round,
}) => {
  const isResolved = blackboard.resolved;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Blackboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Shared Multi-Agent Blackboard State</span>
              <span className="text-xs font-mono text-cyan-400 font-normal">
                [Revision #{round}]
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized state space and atomic fact repository shared across Tracker, Predictor, and Commander
            </p>
          </div>
        </div>

        {/* Global Stability Metric Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Mission Health</div>
            <div className="text-xs font-bold text-slate-200">
              {isResolved ? '100% Nominal' : `${blackboard.stabilityScore.toFixed(1)}% Operational`}
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${
            isResolved
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
              : 'bg-amber-950/60 border-amber-800 text-amber-400'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4-Panel Grid: Stability Trajectory, Shared Facts, Active Directives, Domain Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: Dynamic Crisis & Stability Curve */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              Crisis Attenuation
            </span>
            <span className="font-mono text-slate-400 text-[11px]">Rounds 0–{round}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Crisis Level:</span>
              <span className={`font-mono font-bold ${isResolved ? 'text-emerald-400' : 'text-rose-400'}`}>
                {blackboard.crisisLevel}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isResolved ? 'bg-emerald-500' : blackboard.crisisLevel > 50 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${blackboard.crisisLevel}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Stability Score:</span>
              <span className="font-mono font-bold text-emerald-400">
                {blackboard.stabilityScore.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${blackboard.stabilityScore}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Swarm Consensus:</span>
            <span className="text-cyan-400 font-mono font-medium">
              {isResolved ? '99.9%' : `${(82 + round * 3).toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Panel 2: Verified Fact Ledger */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Empirical Fact Ledger
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{blackboard.sharedFacts.length} facts</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
            {blackboard.sharedFacts.length === 0 ? (
              <div className="text-slate-400 text-xs italic py-2">
                Tracker establishing telemetry baselines...
              </div>
            ) : (
              blackboard.sharedFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">{fact.key.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{fact.timestamp}</span>
                  </div>
                  <div className="text-cyan-300 font-mono">{fact.value}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 3: Commander's Directives Ledger */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Executive Directives
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{blackboard.directives.length} orders</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
            {blackboard.directives.length === 0 ? (
              <div className="text-slate-400 text-xs italic py-2">
                Awaiting Commander executive dispatch...
              </div>
            ) : (
              blackboard.directives.map((dir) => (
                <div
                  key={dir.id}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{dir.title}</span>
                    <span className="text-[10px] uppercase font-mono text-emerald-400">
                      {dir.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[10px] truncate">
                    Action: {dir.action}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 4: Domain Mission Telemetry Highlights */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Monitored Telemetry Channels
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{task.keyTelemetryMetrics.length} feeds</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
            {task.keyTelemetryMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px]"
              >
                <span className="text-slate-300 truncate max-w-[140px]">{metric}</span>
                <span className={`font-mono ${isResolved ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isResolved ? '0.00σ Nominal' : `${(0.8 + idx * 0.4).toFixed(2)}σ`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
