import React, { useState } from 'react';
import {
  Wrench,
  Activity,
  GitCompare,
  Cpu,
  Sparkles,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Share2,
  Play,
  Clock,
  Terminal,
  ChevronRight,
  User,
} from 'lucide-react';
import { SharedTool, ToolExecutionLog, AgentRole } from '../types/agent';
import { toolRegistry } from '../services/toolRegistry';

interface SharedToolBusProps {
  tools: SharedTool[];
  toolLogs: ToolExecutionLog[];
  round: number;
  crisisLevel: number;
  onToolExecuted?: () => void;
}

export const SharedToolBus: React.FC<SharedToolBusProps> = ({
  tools,
  toolLogs,
  round,
  crisisLevel,
  onToolExecuted,
}) => {
  const [selectedTool, setSelectedTool] = useState<SharedTool | null>(tools[0] || null);
  const [testArgs, setTestArgs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastManualOutput, setLastManualOutput] = useState<any>(null);

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'telemetry_query_tool':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'state_diff_analyzer':
        return <GitCompare className="w-4 h-4 text-cyan-400" />;
      case 'monte_carlo_predictor':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'counterfactual_evaluator':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'resource_allocator':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'protocol_enforcer':
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 'verification_audit_probe':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'blackboard_sync_tool':
        return <Share2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSelectTool = (tool: SharedTool) => {
    setSelectedTool(tool);
    const initialArgs: Record<string, any> = {};
    tool.parameters.forEach((p) => {
      initialArgs[p.name] = p.defaultValue;
    });
    setTestArgs(initialArgs);
    setLastManualOutput(null);
  };

  const handleExecuteManual = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    try {
      const primaryRole = (selectedTool.permittedRoles[0] === 'all'
        ? 'commander'
        : selectedTool.permittedRoles[0]) as AgentRole;

      const { result } = await toolRegistry.executeTool(
        selectedTool.id,
        primaryRole,
        testArgs,
        round,
        crisisLevel
      );
      setLastManualOutput(result);
      if (onToolExecuted) onToolExecuted();
    } catch (err) {
      console.error('Manual tool run error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Shared Multi-Agent Tool Hub</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({tools.length} shared instruments)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Shared capabilities accessible across Tracker, Predictor, and Commander
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Invocations: <strong className="text-slate-200">{tools.reduce((acc, t) => acc + t.invocationCount, 0)}</strong>
        </div>
      </div>

      {/* Main Grid: Left side tool list, Right side inspector & execution trace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Left: Tool Registry List (5 cols) */}
        <div className="md:col-span-5 overflow-y-auto p-3 space-y-2">
          {tools.map((tool) => {
            const isSelected = selectedTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-500/60 shadow-xs ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      {getToolIcon(tool.id)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 leading-tight">
                        {tool.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tool.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                    {tool.invocationCount} runs
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  {tool.description}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Access: </span>
                    <span className="text-slate-300 capitalize font-medium">
                      {tool.permittedRoles.join(', ')}
                    </span>
                  </div>
                  {tool.lastInvokedBy && (
                    <span className="text-cyan-400">
                      Last: {tool.lastInvokedBy}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Tool Inspector & Live Executions (7 cols) */}
        <div className="md:col-span-7 flex flex-col overflow-hidden bg-slate-950/30">
          {selectedTool ? (
            <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-4">
              {/* Selected Tool Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getToolIcon(selectedTool.id)}
                    <h4 className="text-sm font-semibold text-white">
                      {selectedTool.displayName}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    Category: {selectedTool.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>

              {/* Parameter Configuration & Manual Probe Tester */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium border-b border-slate-800/60 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Interactive Tool Parameter Inspection
                  </span>
                  <button
                    onClick={handleExecuteManual}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-cyan-600 text-white hover:bg-cyan-500 transition disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isExecuting ? 'Probing...' : 'Test Tool Run'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTool.parameters.map((param) => (
                    <div key={param.name} className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>{param.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({param.type})</span>
                      </label>

                      {param.type === 'select' ? (
                        <select
                          value={testArgs[param.name] ?? param.defaultValue}
                          onChange={(e) =>
                            setTestArgs({ ...testArgs, [param.name]: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                        >
                          {param.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : param.type === 'boolean' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            checked={Boolean(testArgs[param.name] ?? param.defaultValue)}
                            onChange={(e) =>
                              setTestArgs({ ...testArgs, [param.name]: e.target.checked })
                            }
                            className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0"
                          />
                          <span className="text-xs text-slate-300">Enabled</span>
                        </div>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={testArgs[param.name] ?? param.defaultValue}
                          onChange={(e) =>
                            setTestArgs({ ...testArgs, [param.name]: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Output View if manually run */}
                {lastManualOutput && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-1">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      Live Output Return Vector:
                    </div>
                    <pre className="bg-slate-900/90 border border-slate-800 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-28">
                      {JSON.stringify(lastManualOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Live Swarm Tool Execution Trace */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Swarm Tool Invocation Trace
                  </span>
                  <span>{toolLogs.length} events logged</span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {toolLogs.length === 0 ? (
                    <div className="p-3 rounded bg-slate-950/40 border border-slate-800/40 text-xs text-slate-400 italic">
                      No tool executions logged yet. Start or step the swarm loop to see agents trigger tools.
                    </div>
                  ) : (
                    toolLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-semibold text-slate-200">
                              {log.toolName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              by {log.invokedBy.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{log.executionTimeMs}ms</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-900/40 px-1.5 py-0.5 rounded">
                          Output: {JSON.stringify(log.output)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a tool on the left to inspect parameters and execution logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
