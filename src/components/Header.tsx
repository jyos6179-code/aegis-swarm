import React from 'react';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Zap,
  FileText,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { MissionTask, BlackboardState } from '../types/agent';

interface HeaderProps {
  currentTask: MissionTask;
  round: number;
  blackboard: BlackboardState;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onOpenTaskSelector: () => void;
  onOpenChaosModal: () => void;
  onOpenAuditModal: () => void;
  activeTurnAgent?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTask,
  round,
  blackboard,
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  onOpenTaskSelector,
  onOpenChaosModal,
  onOpenAuditModal,
  activeTurnAgent,
}) => {
  const isResolved = blackboard.resolved;
  const crisisPercent = Math.round(blackboard.crisisLevel);
  const stabilityPercent = Math.round(blackboard.stabilityScore);

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-30">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Task Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/40">
                <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Radio className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold tracking-tight text-white">
                    Aegis Swarm
                  </h1>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-cyan-400">
                    Autonomous Multi-Agent Triad
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Tracker</span>
                  <span aria-hidden="true">·</span>
                  <span>Predictor</span>
                  <span aria-hidden="true">·</span>
                  <span>Commander</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300">Shared Tool Bus</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-800" />

            {/* Current Mission Selector Button */}
            <button
              onClick={onOpenTaskSelector}
              className="text-left group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition"
              title="Change Mission or Configure Custom Task"
            >
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Active Mission
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white max-w-[220px] sm:max-w-xs truncate">
                  {currentTask.title}
                </div>
              </div>
              <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 ml-1 shrink-0" />
            </button>
          </div>

          {/* Crisis & Stability Telemetry Gauges */}
          <div className="flex items-center gap-6">
            {/* Live Metrics Cluster */}
            <div className="flex items-center gap-4 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 gap-3">
                  <span>Crisis Index</span>
                  <span className={`font-mono font-semibold ${isResolved ? 'text-emerald-400' : crisisPercent > 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {crisisPercent}%
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isResolved ? 'bg-emerald-500' : crisisPercent > 50 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${crisisPercent}%` }}
                  />
                </div>
              </div>

              <div className="h-6 w-px bg-slate-800" />

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 gap-3">
                  <span>Stability</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {stabilityPercent}%
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${stabilityPercent}%` }}
                  />
                </div>
              </div>

              <div className="h-6 w-px bg-slate-800" />

              <div className="text-right">
                <div className="text-[11px] text-slate-400">Cycle Round</div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  #{round}
                </div>
              </div>
            </div>

            {/* Swarm Loop Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Play / Pause Autonomous Run */}
              <button
                onClick={onToggleRun}
                disabled={isResolved}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition shadow-sm ${
                  isResolved
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95'
                }`}
                title={isRunning ? 'Pause Autonomous Deliberation' : 'Start Autonomous Execution Loop'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Swarm</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Autonomous</span>
                  </>
                )}
              </button>

              {/* Step Next Turn */}
              <button
                onClick={onStep}
                disabled={isRunning || isResolved}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Execute single agent turn"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Step Turn</span>
              </button>

              {/* Inject Chaos Anomaly */}
              <button
                onClick={onOpenChaosModal}
                disabled={isResolved}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 hover:bg-rose-900/40 transition disabled:opacity-40"
                title="Inject Chaos / Sudden Environmental Disturbance"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Inject Chaos</span>
              </button>

              {/* Mission Audit Report */}
              <button
                onClick={onOpenAuditModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="View Full Mission Audit Debrief & Resolution Proof"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Audit Log</span>
              </button>

              {/* Reset */}
              <button
                onClick={onReset}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Reset Mission to Initial State"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Swarm Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
            <span className="font-medium text-slate-300">Swarm Execution State:</span>
            {isResolved ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Problem Autonomously Solved · Normal Baseline Restored
              </span>
            ) : isRunning ? (
              <span className="text-cyan-400 font-medium">
                Active Deliberation Loop · {activeTurnAgent ? `Agent ${activeTurnAgent.toUpperCase()} deliberating` : 'Sequencing Triad'}
              </span>
            ) : (
              <span className="text-slate-400">
                Awaiting Next Turn (Autonomous Loop Paused)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Domain: <strong className="text-slate-300 font-medium">{currentTask.domain}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Active Anomalies: <strong className="text-amber-400 font-medium">{blackboard.anomalies.filter(a => a.status !== 'resolved').length}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Directives Issued: <strong className="text-cyan-400 font-medium">{blackboard.directives.length}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
