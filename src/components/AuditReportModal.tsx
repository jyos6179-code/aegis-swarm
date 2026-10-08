import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  FileJson,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BlackboardState,
  MissionTask,
  AgentProfile,
  InterAgentMessage,
  ToolExecutionLog,
} from '../types/agent';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: MissionTask;
  round: number;
  blackboard: BlackboardState;
  agents: AgentProfile[];
  messages: InterAgentMessage[];
  toolLogs?: ToolExecutionLog[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  task,
  round,
  blackboard,
  agents,
  messages,
  toolLogs = [],
}) => {
  const [copiedType, setCopiedType] = useState<'md' | 'json' | null>(null);
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'json'>('markdown');

  if (!isOpen) return null;

  const tracker = agents.find((a) => a.role === 'tracker')!;
  const predictor = agents.find((a) => a.role === 'predictor')!;
  const commander = agents.find((a) => a.role === 'commander')!;

  const generateMarkdownReport = () => {
    return `# AEGIS SWARM: AUTONOMOUS MULTI-AGENT MISSION POST-MORTEM DEBRIEF
Generated: ${new Date().toISOString()}
Domain: ${task.domain}
Mission: ${task.title}
Status: ${blackboard.resolved ? 'MISSION ACCOMPLISHED (100% NOMINAL)' : 'IN PROGRESS'}
Total Autonomous Rounds: ${round}
Final Stability Score: ${blackboard.stabilityScore.toFixed(1)}%
Final Crisis Index: ${blackboard.crisisLevel}%

---

## 1. EXECUTIVE MISSION SUMMARY
- **Objective:** ${task.objective}
- **Initial Crisis Severity:** ${task.initialCrisisLevel}%
- **Resolution Summary:** ${blackboard.resolutionSummary || 'Autonomous swarm actively resolving ongoing telemetry deviations.'}

---

## 2. TRIAD SPECIALIZATION CONTRIBUTIONS

### A. SENTINEL-TRACKER (Sensor Ingestion & Telemetry Diff Observer)
- **Monologue:** "${tracker.monologue}"
- **Verified Facts Logged:** ${blackboard.sharedFacts.length}
- **Tools Invoked:** ${tracker.toolsInvokedCount}
- **Messages Dispatched:** ${tracker.messagesSentCount}

### B. ORACLE-PREDICTOR (Probabilistic Simulation & Cascade Forecaster)
- **Monologue:** "${predictor.monologue}"
- **Monte Carlo Horizon Projections:**
${blackboard.forecasts.map((f) => `  * [${f.horizon.toUpperCase()} - ${f.timeframe}] Failure Probability: ${f.probabilityOfFailure}% | Recommended: ${f.recommendedAction}`).join('\n')}
- **Tools Invoked:** ${predictor.toolsInvokedCount}
- **Messages Dispatched:** ${predictor.messagesSentCount}

### C. VANGUARD-COMMANDER (Executive Decision Maker & Strategy Dispatcher)
- **Monologue:** "${commander.monologue}"
- **Directives Dispatched:** ${blackboard.directives.length}
${blackboard.directives.map((d) => `  * [${d.status.toUpperCase()}] ${d.title} -> Action: ${d.action} (Tool: ${d.assignedTool})`).join('\n')}
- **Tools Invoked:** ${commander.toolsInvokedCount}
- **Messages Dispatched:** ${commander.messagesSentCount}

---

## 3. SHARED TOOL EXECUTION TRACE (${toolLogs.length} Executions)
${toolLogs.length === 0 ? 'No tools executed yet.' : toolLogs.map((tl) => `[${tl.timestamp}] Cycle #${tl.round} | Tool: ${tl.toolName} (${tl.toolId}) | Invoked by: ${tl.invokedBy.toUpperCase()} | Duration: ${tl.executionTimeMs}ms
  Status: ${tl.status}
  Arguments: ${JSON.stringify(tl.arguments)}
  Output: ${JSON.stringify(tl.output)}`).join('\n\n')}

---

## 4. INTER-AGENT DELIBERATION AUDIT TRAIL (${messages.length} Records)
${messages.map((m) => `[${m.timestamp}] Cycle #${m.round} | ${m.sender.toUpperCase()} -> ${m.recipient.toUpperCase()} | Subject: ${m.subject}
  "${m.content}"
  (Tool Used: ${m.toolUsed || 'None'})`).join('\n\n')}

---
**Verification Stamp:** All operations executed autonomously by the Tracker-Predictor-Commander triad without human supervisory takeover.`;
  };

  const generateJsonPayload = () => {
    const fullMissionExport = {
      exportMetadata: {
        generator: 'Aegis Swarm - Multi-Agent Autonomous Triad',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        platform: 'Google AI Studio',
      },
      mission: {
        id: task.id,
        title: task.title,
        domain: task.domain,
        objective: task.objective,
        background: task.background,
        initialCrisisLevel: task.initialCrisisLevel,
        estimatedComplexity: task.estimatedComplexity,
        keyTelemetryMetrics: task.keyTelemetryMetrics,
        suggestedTools: task.suggestedTools,
      },
      executionState: {
        round,
        isResolved: blackboard.resolved,
        crisisLevel: blackboard.crisisLevel,
        stabilityScore: blackboard.stabilityScore,
        resolutionSummary: blackboard.resolutionSummary,
        activeAnomaliesCount: blackboard.anomalies.filter((a) => a.status !== 'resolved').length,
      },
      blackboard: {
        crisisLevel: blackboard.crisisLevel,
        stabilityScore: blackboard.stabilityScore,
        resolved: blackboard.resolved,
        resolutionSummary: blackboard.resolutionSummary,
        anomalies: blackboard.anomalies,
        forecasts: blackboard.forecasts,
        directives: blackboard.directives,
        sharedFacts: blackboard.sharedFacts,
        metricsHistory: blackboard.metricsHistory,
      },
      agents: agents.map((a) => ({
        id: a.id,
        role: a.role,
        name: a.name,
        callsign: a.callsign,
        badgeTitle: a.badgeTitle,
        status: a.status,
        cognitiveLoad: a.cognitiveLoad,
        monologue: a.monologue,
        recentAction: a.recentAction,
        activeGoals: a.activeGoals,
        specialization: a.specialization,
        toolsAccess: a.toolsAccess,
        messagesSentCount: a.messagesSentCount,
        toolsInvokedCount: a.toolsInvokedCount,
      })),
      interAgentMessages: messages,
      toolExecutionLogs: toolLogs,
    };
    return fullMissionExport;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(generateJsonPayload(), null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = generateMarkdownReport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-swarm-${task.id}-round-${round}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Browser download of the complete current mission state as JSON
  const handleExportToJson = () => {
    const jsonObject = generateJsonPayload();
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-swarm-${task.id}-round-${round}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Multi-Agent Autonomous Incident Audit Log</span>
                <span className="text-[11px] font-mono text-cyan-400 font-normal">
                  (Round #{round})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verifiable post-mortem report & comprehensive telemetry JSON export
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

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Format Selector Toggle (Anti-pill segmented control) */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFormat('markdown')}
              className={`px-3 py-1 font-medium rounded-md transition flex items-center gap-1.5 ${
                activeFormat === 'markdown'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Markdown</span>
            </button>
            <button
              onClick={() => setActiveFormat('json')}
              className={`px-3 py-1 font-medium rounded-md transition flex items-center gap-1.5 ${
                activeFormat === 'json'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full JSON State</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeFormat === 'markdown' ? (
              <>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
                >
                  {copiedType === 'md' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{copiedType === 'md' ? 'Copied' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .MD</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleCopyJson}
                className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
              >
                {copiedType === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedType === 'json' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}

            {/* Primary 'Export to JSON' Browser Download Button */}
            <button
              onClick={handleExportToJson}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Download full mission state, logs, tools, and message records as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to JSON</span>
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="flex items-center gap-2">
              <strong className="text-slate-200">{task.title}</strong>
              <span aria-hidden="true">·</span>
              <span>{task.domain}</span>
            </span>
            <span className="font-mono text-cyan-400">
              {messages.length} messages · {toolLogs.length} tool executions logged
            </span>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[54vh] select-text">
            {activeFormat === 'markdown'
              ? generateMarkdownReport()
              : JSON.stringify(generateJsonPayload(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
