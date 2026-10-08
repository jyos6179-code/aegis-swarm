import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Check,
  AlertCircle,
  Ship,
  TrendingDown,
  Flame,
  ShieldAlert,
  Orbit,
} from 'lucide-react';
import { MissionTask } from '../types/agent';
import { MISSION_PRESETS } from '../data/presets';

interface TaskSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTaskId: string;
  onSelectTask: (task: MissionTask) => void;
}

export const TaskSelectorModal: React.FC<TaskSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTaskId,
  onSelectTask,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'preset-supply-chain':
        return <Ship className="w-4 h-4 text-cyan-400" />;
      case 'preset-flash-crash':
        return <TrendingDown className="w-4 h-4 text-amber-400" />;
      case 'preset-wildfire-grid':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'preset-cloud-breach':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'preset-satellite-orbit':
        return <Orbit className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleGenerateCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/multi-agent/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptTopic: customPrompt.trim() }),
      });

      if (!res.ok) {
        throw new Error('Task generator returned an error.');
      }

      const data = await res.json();
      if (data.task) {
        const newTask: MissionTask = {
          id: data.task.id || `custom-${Date.now()}`,
          title: data.task.title,
          domain: data.task.domain || 'Complex System Operation',
          objective: data.task.objective,
          background: data.task.background,
          initialCrisisLevel: data.task.initialCrisisLevel || 85,
          estimatedComplexity: 'Severe',
          initialAnomalies: data.task.initialAnomalies || [
            { metric: 'Primary Throughput', deviation: '-42% delta', severity: 'critical' },
          ],
          keyTelemetryMetrics: data.task.keyTelemetryMetrics || [
            'System Ingestion Rate',
            'Variance Deviation',
            'Buffer Capacity',
          ],
          suggestedTools: ['telemetry_query_tool', 'monte_carlo_predictor', 'resource_allocator'],
        };

        onSelectTask(newTask);
        onClose();
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate custom scenario.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Select or Configure Mission Task
              </h3>
              <p className="text-xs text-slate-400">
                Choose a pre-configured domain or generate a custom task for the 3-agent swarm
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Custom Mission Generator */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Autonomous Mission Generator
              </span>
              <span className="text-[11px] text-slate-400">Generates custom telemetry & constraints</span>
            </div>

            <form onSubmit={handleGenerateCustomTask} className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Mars Habitat Oxygen Generator Leak, Smart Grid EV Charging Overload..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/80"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !customPrompt.trim()}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate Mission'}</span>
                </button>
              </div>

              {generationError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {generationError}
                </p>
              )}
            </form>
          </div>

          {/* Built-in Presets */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              High-Stakes Domain Presets
            </div>

            <div className="space-y-2">
              {MISSION_PRESETS.map((preset) => {
                const isSelected = preset.id === currentTaskId;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectTask(preset);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-500/60 ring-1 ring-cyan-500/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                          {getPresetIcon(preset.id)}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">
                            {preset.title}
                          </h4>
                          <span className="text-[11px] text-cyan-400">
                            {preset.domain}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 shrink-0">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {preset.objective}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Initial Crisis: <strong className="text-rose-400 font-mono">{preset.initialCrisisLevel}%</strong></span>
                      <span className="text-slate-400">
                        {preset.initialAnomalies.length} tracked anomalies
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
