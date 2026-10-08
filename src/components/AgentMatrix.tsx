import React from 'react';
import {
  Activity,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Layers,
  Wrench,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
  BarChart3,
} from 'lucide-react';
import { AgentProfile, BlackboardState, AgentRole } from '../types/agent';

interface AgentMatrixProps {
  agents: AgentProfile[];
  blackboard: BlackboardState;
  activeTurnAgent?: AgentRole | null;
  onSelectAgent?: (role: AgentRole) => void;
  onTriggerAgentTool?: (toolId: string, role: AgentRole) => void;
}

export const AgentMatrix: React.FC<AgentMatrixProps> = ({
  agents,
  blackboard,
  activeTurnAgent,
}) => {
  const tracker = agents.find((a) => a.role === 'tracker')!;
  const predictor = agents.find((a) => a.role === 'predictor')!;
  const commander = agents.find((a) => a.role === 'commander')!;

  const isResolved = blackboard.resolved;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ---------------- AGENT 1: TRACKER ---------------- */}
      <div
        className={`rounded-xl border transition-all duration-300 flex flex-col bg-slate-900/90 shadow-sm ${
          activeTurnAgent === 'tracker'
            ? 'border-cyan-500/80 shadow-cyan-950/50 ring-1 ring-cyan-500/30'
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {tracker.name}
                </h3>
                {activeTurnAgent === 'tracker' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 animate-pulse">
                    Deliberating
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Sensor Ingestion & Telemetry Diff Observer
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Cognitive Load
            </div>
            <div className="text-xs font-mono font-medium text-cyan-400">
              {tracker.cognitiveLoad}%
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col space-y-4">
          {/* Status & Recent Action */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Observation Monologue (Chain of Thought)</span>
              <span className="text-slate-400 text-[10px] font-mono">Real-Time</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
              "{tracker.monologue}"
            </p>
          </div>

          {/* Active Detected Telemetry Anomalies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Tracked Telemetry Deviations
              </span>
              <span>{blackboard.anomalies.length} items</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {blackboard.anomalies.length === 0 ? (
                <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/40 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All telemetry streams within 0.05-sigma tolerance. Zero deviations.
                </div>
              ) : (
                blackboard.anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-medium text-slate-200">
                        {anom.metric}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Deviation: <span className="text-rose-400 font-mono">{anom.deviation}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                        anom.status === 'resolved'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : anom.severity === 'critical'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {anom.status === 'resolved' ? 'Resolved' : anom.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Extracted Empirical Facts (Committed to Blackboard) */}
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Verified Empirical Facts Logged
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
              {blackboard.sharedFacts.length === 0 ? (
                <div className="text-slate-400 text-xs italic">
                  Awaiting first telemetry extraction sweep...
                </div>
              ) : (
                blackboard.sharedFacts.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40 border border-slate-800/40 text-[11px]"
                  >
                    <span className="text-slate-400">{f.key.replace(/_/g, ' ')}:</span>
                    <span className="text-cyan-300 font-mono">{f.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Tool Stats */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tools Run: {tracker.toolsInvokedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Messages Sent: {tracker.messagesSentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- AGENT 2: PREDICTOR ---------------- */}
      <div
        className={`rounded-xl border transition-all duration-300 flex flex-col bg-slate-900/90 shadow-sm ${
          activeTurnAgent === 'predictor'
            ? 'border-amber-500/80 shadow-amber-950/50 ring-1 ring-amber-500/30'
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {predictor.name}
                </h3>
                {activeTurnAgent === 'predictor' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 animate-pulse">
                    Computing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Probabilistic Simulation & Cascade Forecaster
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Cognitive Load
            </div>
            <div className="text-xs font-mono font-medium text-amber-400">
              {predictor.cognitiveLoad}%
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col space-y-4">
          {/* Monologue */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Stochastic Forecasting Monologue</span>
              <span className="text-slate-400 text-[10px] font-mono">1,000 Paths</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
              "{predictor.monologue}"
            </p>
          </div>

          {/* Three-Horizon Risk Projections Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                Three-Horizon Failure Probabilities
              </span>
              <span className="text-[11px]">Monte Carlo Projected</span>
            </div>

            <div className="space-y-2">
              {blackboard.forecasts.length === 0 ? (
                <div className="p-3 rounded bg-slate-950/40 border border-slate-800/40 text-xs text-slate-400 italic">
                  Running initial stochastic branch generation on Tracker's telemetry vector...
                </div>
              ) : (
                blackboard.forecasts.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 capitalize">
                          {f.horizon.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({f.timeframe})
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          f.probabilityOfFailure < 15
                            ? 'text-emerald-400'
                            : f.probabilityOfFailure < 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {f.probabilityOfFailure}% Fail Prob
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.probabilityOfFailure < 15
                            ? 'bg-emerald-500'
                            : f.probabilityOfFailure < 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${f.probabilityOfFailure}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      Impact: <span className="text-slate-300">{f.projectedImpact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Tool Stats */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulations Run: {predictor.toolsInvokedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Dispatches Sent: {predictor.messagesSentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- AGENT 3: COMMANDER ---------------- */}
      <div
        className={`rounded-xl border transition-all duration-300 flex flex-col bg-slate-900/90 shadow-sm ${
          isResolved
            ? 'border-emerald-500/80 shadow-emerald-950/50 ring-1 ring-emerald-500/40'
            : activeTurnAgent === 'commander'
            ? 'border-emerald-500/80 shadow-emerald-950/50 ring-1 ring-emerald-500/30'
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {commander.name}
                </h3>
                {isResolved ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Solved
                  </span>
                ) : activeTurnAgent === 'commander' ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 animate-pulse">
                    Executing
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">
                Executive Decision Maker & Strategy Dispatcher
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Cognitive Load
            </div>
            <div className="text-xs font-mono font-medium text-emerald-400">
              {commander.cognitiveLoad}%
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col space-y-4">
          {/* Monologue */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Executive Triage Monologue</span>
              <span className="text-slate-400 text-[10px] font-mono">Decision Bus</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
              "{commander.monologue}"
            </p>
          </div>

          {/* Mission Directives Issued */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Active Tactical Directives
              </span>
              <span>{blackboard.directives.length} dispatched</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {blackboard.directives.length === 0 ? (
                <div className="p-3 rounded bg-slate-950/40 border border-slate-800/40 text-xs text-slate-400 italic">
                  Awaiting Tracker and Predictor convergence before dispatching countermeasures...
                </div>
              ) : (
                blackboard.directives.map((dir) => (
                  <div
                    key={dir.id}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-200">
                        {dir.title}
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        {dir.status}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Action: {dir.action}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center justify-between pt-1 border-t border-slate-800/40">
                      <span>Target: {dir.targetSector}</span>
                      <span className="text-cyan-400 font-mono">Tool: {dir.assignedTool}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mission Resolution Banner if Complete */}
          {isResolved && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Autonomous Mission Complete
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-300/90">
                {blackboard.resolutionSummary}
              </p>
            </div>
          )}

          {/* Footer Tool Stats */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Actions Enforced: {commander.toolsInvokedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Directives Sent: {commander.messagesSentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
