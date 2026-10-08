import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  MessageSquare,
  Wrench,
  Share2,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Bot,
} from 'lucide-react';
import {
  AgentProfile,
  AgentRole,
  BlackboardState,
  InterAgentMessage,
  MissionTask,
  SharedTool,
  ToolExecutionLog,
} from './types/agent';
import { INITIAL_AGENTS, MISSION_PRESETS } from './data/presets';
import { toolRegistry } from './services/toolRegistry';
import { executeAgentTurn } from './services/agentEngine';

import { Header } from './components/Header';
import { AgentMatrix } from './components/AgentMatrix';
import { BlackboardWorkspace } from './components/BlackboardWorkspace';
import { InterAgentComms } from './components/InterAgentComms';
import { SharedToolBus } from './components/SharedToolBus';
import { OperatorChat } from './components/OperatorChat';
import { TaskSelectorModal } from './components/TaskSelectorModal';
import { ChaosModal } from './components/ChaosModal';
import { AuditReportModal } from './components/AuditReportModal';

export default function App() {
  // Active Mission Task
  const [currentTask, setCurrentTask] = useState<MissionTask>(MISSION_PRESETS[0]);

  // Swarm State
  const [agents, setAgents] = useState<AgentProfile[]>(INITIAL_AGENTS);
  const [round, setRound] = useState(1);
  const [activeTurnAgent, setActiveTurnAgent] = useState<AgentRole | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [injectedChaos, setInjectedChaos] = useState<{
    title: string;
    description: string;
    severity: 'warning' | 'critical';
  } | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'matrix' | 'comms' | 'tools' | 'blackboard' | 'chat'>('matrix');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Blackboard State
  const [blackboard, setBlackboard] = useState<BlackboardState>(() => ({
    crisisLevel: currentTask.initialCrisisLevel,
    stabilityScore: 100 - currentTask.initialCrisisLevel,
    resolved: false,
    resolutionSummary: null,
    anomalies: currentTask.initialAnomalies.map((a, idx) => ({
      id: `anom-${idx}`,
      metric: a.metric,
      deviation: a.deviation,
      severity: a.severity,
      detectedAtRound: 1,
      detectedBy: 'tracker',
      status: 'active',
    })),
    forecasts: [],
    directives: [],
    sharedFacts: [],
    metricsHistory: [
      {
        round: 1,
        timestamp: new Date().toLocaleTimeString(),
        crisisLevel: currentTask.initialCrisisLevel,
        stabilityScore: 100 - currentTask.initialCrisisLevel,
        throughputRate: 35,
        agentConsensus: 82,
      },
    ],
  }));

  // Inter-Agent Messages
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);

  // Shared Tool Registry State
  const [tools, setTools] = useState<SharedTool[]>(toolRegistry.getTools());
  const [toolLogs, setToolLogs] = useState<ToolExecutionLog[]>(toolRegistry.getLogs());

  // Reset or Switch Mission
  const handleSelectTask = (task: MissionTask) => {
    setIsRunning(false);
    setCurrentTask(task);
    setRound(1);
    setActiveTurnAgent(null);
    setInjectedChaos(null);
    toolRegistry.reset();
    setTools(toolRegistry.getTools());
    setToolLogs([]);

    // Reset agents
    setAgents(
      INITIAL_AGENTS.map((a) => ({
        ...a,
        cognitiveLoad: 30 + Math.floor(Math.random() * 20),
        status: 'idle',
        messagesSentCount: 0,
        toolsInvokedCount: 0,
      }))
    );

    // Reset blackboard
    setBlackboard({
      crisisLevel: task.initialCrisisLevel,
      stabilityScore: 100 - task.initialCrisisLevel,
      resolved: false,
      resolutionSummary: null,
      anomalies: task.initialAnomalies.map((a, idx) => ({
        id: `anom-${idx}`,
        metric: a.metric,
        deviation: a.deviation,
        severity: a.severity,
        detectedAtRound: 1,
        detectedBy: 'tracker',
        status: 'active',
      })),
      forecasts: [],
      directives: [],
      sharedFacts: [],
      metricsHistory: [
        {
          round: 1,
          timestamp: new Date().toLocaleTimeString(),
          crisisLevel: task.initialCrisisLevel,
          stabilityScore: 100 - task.initialCrisisLevel,
          throughputRate: 35,
          agentConsensus: 82,
        },
      ],
    });

    // Initial greeting system broadcast
    const initMsg: InterAgentMessage = {
      id: `msg-init-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      round: 1,
      sender: 'system',
      recipient: 'all',
      type: 'status_sync',
      subject: `SWARM ACTIVATION: Mission Initiated: ${task.title}`,
      content: `Triad initialized for [${task.domain}]. Sentinel-Tracker ingesting telemetry. Oracle-Predictor building stochastic trees. Vanguard-Commander priming executive dispatch bus.`,
      priority: 'high',
    };
    setMessages([initMsg]);
  };

  const handleReset = () => {
    handleSelectTask(currentTask);
  };

  // Step Single Agent Turn (Tracker -> Predictor -> Commander -> next round)
  const stepTurn = useCallback(async () => {
    if (blackboard.resolved) {
      setIsRunning(false);
      return;
    }

    // Determine whose turn it is
    let nextRole: AgentRole = 'tracker';
    if (!activeTurnAgent || activeTurnAgent === 'commander') {
      nextRole = 'tracker';
    } else if (activeTurnAgent === 'tracker') {
      nextRole = 'predictor';
    } else if (activeTurnAgent === 'predictor') {
      nextRole = 'commander';
    }

    setActiveTurnAgent(nextRole);

    try {
      const result = await executeAgentTurn(
        nextRole,
        round,
        currentTask,
        agents,
        blackboard,
        messages,
        injectedChaos
      );

      // Apply updates
      setBlackboard(result.updatedBlackboard);
      setAgents(result.updatedAgents);
      setMessages((prev) => [result.message, ...prev]);
      setTools(toolRegistry.getTools());
      setToolLogs(toolRegistry.getLogs());

      // If chaos was applied, clear it after Tracker and Predictor absorb it
      if (injectedChaos && nextRole === 'commander') {
        setInjectedChaos(null);
      }

      // If Commander finished, advance round
      if (nextRole === 'commander') {
        if (result.updatedBlackboard.resolved) {
          setIsRunning(false);
        } else {
          setRound((r) => r + 1);
        }
      }
    } catch (err) {
      console.error('Error during agent step:', err);
    }
  }, [activeTurnAgent, blackboard, round, currentTask, agents, messages, injectedChaos]);

  // Autonomous Swarm Loop
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  useEffect(() => {
    if (!isRunning || blackboard.resolved) return;

    const timer = setInterval(() => {
      if (isRunningRef.current && !blackboard.resolved) {
        stepTurn();
      }
    }, 2400);

    return () => clearInterval(timer);
  }, [isRunning, blackboard.resolved, stepTurn]);

  // Inject Chaos Handler
  const handleInjectChaos = (chaos: {
    title: string;
    description: string;
    severity: 'warning' | 'critical';
  }) => {
    setInjectedChaos(chaos);
    // Broadcast chaos message into comms
    const chaosMsg: InterAgentMessage = {
      id: `chaos-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      round,
      sender: 'environment',
      recipient: 'all',
      type: 'chaos_event',
      subject: `CHAOS EVENT: ${chaos.title}`,
      content: chaos.description,
      priority: 'critical',
    };
    setMessages((prev) => [chaosMsg, ...prev]);

    // Add anomaly to blackboard
    setBlackboard((prev) => ({
      ...prev,
      crisisLevel: Math.min(99, prev.crisisLevel + 28),
      stabilityScore: Math.max(5, prev.stabilityScore - 25),
      anomalies: [
        {
          id: `chaos-anom-${Date.now()}`,
          metric: chaos.title,
          deviation: 'Abrupt Unplanned Shock (+65%)',
          severity: chaos.severity,
          detectedAtRound: round,
          detectedBy: 'tracker',
          status: 'active',
        },
        ...prev.anomalies,
      ],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header & Mission Controls */}
      <Header
        currentTask={currentTask}
        round={round}
        blackboard={blackboard}
        isRunning={isRunning}
        onToggleRun={() => setIsRunning(!isRunning)}
        onStep={stepTurn}
        onReset={handleReset}
        onOpenTaskSelector={() => setIsTaskModalOpen(true)}
        onOpenChaosModal={() => setIsChaosModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        activeTurnAgent={activeTurnAgent}
      />

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Mission Briefing Hero Banner */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                  Operational Objective
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 font-mono text-[11px]">Domain: {currentTask.domain}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-mono text-[11px]">Severity: {currentTask.estimatedComplexity}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentTask.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                {currentTask.objective}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch / Custom Task</span>
              </button>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
              >
                Post-Mortem Audit
              </button>
            </div>
          </div>
        </section>

        {/* View Switcher Tabs (Anti-pill clean segmented bar per guidelines) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-md transition ${
                activeTab === 'matrix'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tri-Agent Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('comms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-md transition ${
                activeTab === 'comms'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Communication Bus ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-md transition ${
                activeTab === 'tools'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shared Tool Hub ({tools.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('blackboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-md transition ${
                activeTab === 'blackboard'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Blackboard State</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-md transition ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operator Comm</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Deliberation Turn:</span>
            <strong className="text-cyan-400 font-semibold uppercase">
              {activeTurnAgent || 'Idle'}
            </strong>
          </div>
        </div>

        {/* Tab 1: The Tri-Agent Command Deck (Focal Anchor) */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <AgentMatrix
              agents={agents}
              blackboard={blackboard}
              activeTurnAgent={activeTurnAgent}
            />

            {/* Central Synchronized Blackboard Overview */}
            <BlackboardWorkspace
              blackboard={blackboard}
              task={currentTask}
              round={round}
            />
          </div>
        )}

        {/* Tab 2: Inter-Agent Communication Bus */}
        {activeTab === 'comms' && (
          <InterAgentComms messages={messages} />
        )}

        {/* Tab 3: Shared Tool Bus */}
        {activeTab === 'tools' && (
          <SharedToolBus
            tools={tools}
            toolLogs={toolLogs}
            round={round}
            crisisLevel={blackboard.crisisLevel}
            onToolExecuted={() => {
              setTools(toolRegistry.getTools());
              setToolLogs(toolRegistry.getLogs());
            }}
          />
        )}

        {/* Tab 4: Shared Memory Blackboard Full View */}
        {activeTab === 'blackboard' && (
          <BlackboardWorkspace
            blackboard={blackboard}
            task={currentTask}
            round={round}
          />
        )}

        {/* Tab 5: Multi-Turn Operator Chat */}
        {activeTab === 'chat' && (
          <OperatorChat
            currentTask={currentTask}
            blackboard={blackboard}
            round={round}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Aegis Swarm</span>
            <span>·</span>
            <span>Autonomous Multi-Agent System (Tracker · Predictor · Commander)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Shared Blackboard Bus</span>
            <span>·</span>
            <span>Independent Tool Coordination</span>
            <span>·</span>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Export Incident Audit
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskSelectorModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        currentTaskId={currentTask.id}
        onSelectTask={handleSelectTask}
      />

      <ChaosModal
        isOpen={isChaosModalOpen}
        onClose={() => setIsChaosModalOpen(false)}
        onInjectChaos={handleInjectChaos}
      />

      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        task={currentTask}
        round={round}
        blackboard={blackboard}
        agents={agents}
        messages={messages}
        toolLogs={toolLogs}
      />
    </div>
  );
}
