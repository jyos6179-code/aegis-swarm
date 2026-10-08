import {
  AgentProfile,
  AgentRole,
  BlackboardState,
  InterAgentMessage,
  MissionTask,
  SharedTool,
  ToolExecutionLog,
} from '../types/agent';
import { INITIAL_AGENTS } from '../data/presets';
import { toolRegistry } from './toolRegistry';

export interface TurnResult {
  agentRole: AgentRole;
  round: number;
  message: InterAgentMessage;
  toolLog?: ToolExecutionLog;
  updatedBlackboard: BlackboardState;
  updatedAgents: AgentProfile[];
}

export async function executeAgentTurn(
  role: AgentRole,
  currentRound: number,
  task: MissionTask,
  agents: AgentProfile[],
  blackboard: BlackboardState,
  recentMessages: InterAgentMessage[],
  injectedChaos?: { title: string; description: string; severity: string } | null
): Promise<TurnResult> {
  const currentAgent = agents.find((a) => a.role === role)!;
  const toolsAvailable = toolRegistry.getTools().filter((t) =>
    t.permittedRoles.includes('all') || t.permittedRoles.includes(role)
  );

  // Call the server API endpoint for Gemini reasoning
  let serverTurnData: any = null;
  try {
    const res = await fetch('/api/multi-agent/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentRole: role,
        task,
        round: currentRound,
        recentMessages: recentMessages.slice(-8),
        blackboardState: blackboard,
        availableTools: toolsAvailable.map((t) => ({ id: t.id, name: t.displayName, description: t.description })),
        injectedChaos,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.result) {
        serverTurnData = json.result;
      }
    }
  } catch (err) {
    console.warn('API turn call had network variance, utilizing local autonomous synthesis:', err);
  }

  // Fallback synthesis if server response is missing properties
  const turnData = serverTurnData || getFallbackTurnData(role, currentRound, task, blackboard);

  // Tool execution
  let toolLog: ToolExecutionLog | undefined;
  let toolToRun = turnData.toolInvocation?.toolName;
  if (toolToRun && toolRegistry.canAgentAccess(toolToRun, role)) {
    try {
      const execResult = await toolRegistry.executeTool(
        toolToRun,
        role,
        turnData.toolInvocation?.arguments || {},
        currentRound,
        blackboard.crisisLevel
      );
      toolLog = execResult.log;
    } catch (toolErr) {
      console.error('Tool execution error:', toolErr);
    }
  }

  // Create message
  const msgData = turnData.messageToTeam || {
    recipient: role === 'tracker' ? 'predictor' : role === 'predictor' ? 'commander' : 'all',
    subject: `Agent ${role.toUpperCase()} update round ${currentRound}`,
    body: 'Status update synchronized to multi-agent blackboard.',
    priority: 'normal',
  };

  const newMessage: InterAgentMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    round: currentRound,
    sender: role,
    recipient: msgData.recipient || 'all',
    type:
      role === 'tracker'
        ? 'telemetry_alert'
        : role === 'predictor'
        ? 'prediction_dispatch'
        : 'command_directive',
    subject: msgData.subject,
    content: msgData.body,
    priority: msgData.priority || 'normal',
    toolUsed: toolLog?.toolName,
  };

  // Update Blackboard state
  const updatedBlackboard: BlackboardState = {
    ...blackboard,
    anomalies: [...blackboard.anomalies],
    forecasts: [...blackboard.forecasts],
    directives: [...blackboard.directives],
    sharedFacts: [...blackboard.sharedFacts],
    metricsHistory: [...blackboard.metricsHistory],
  };

  // Apply Role-Specific Updates to Blackboard
  if (role === 'tracker') {
    // Add extracted facts
    if (turnData.extractedFacts && Array.isArray(turnData.extractedFacts)) {
      turnData.extractedFacts.forEach((fact: any) => {
        if (!updatedBlackboard.sharedFacts.some((f) => f.key === fact.key)) {
          updatedBlackboard.sharedFacts.unshift({
            id: `fact-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            key: fact.key,
            value: fact.value,
            verifiedBy: 'tracker',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });
    }
    // Update anomalies
    if (turnData.detectedAnomalies && Array.isArray(turnData.detectedAnomalies)) {
      if (turnData.detectedAnomalies.length === 0 && updatedBlackboard.crisisLevel < 35) {
        // Mark existing as resolved
        updatedBlackboard.anomalies = updatedBlackboard.anomalies.map((a) => ({
          ...a,
          status: 'resolved',
        }));
      }
    }
  } else if (role === 'predictor') {
    // Update forecasts
    if (turnData.forecasts && Array.isArray(turnData.forecasts)) {
      updatedBlackboard.forecasts = turnData.forecasts;
    }
    if (typeof turnData.crisisLevel === 'number') {
      updatedBlackboard.crisisLevel = Math.max(0, Math.min(100, turnData.crisisLevel));
    }
  } else if (role === 'commander') {
    // Add directive
    if (turnData.commandDirective) {
      updatedBlackboard.directives.unshift({
        id: `dir-${Date.now()}`,
        round: currentRound,
        title: turnData.commandDirective.title || 'Emergency Mitigation Directive',
        action: turnData.commandDirective.action || 'Execute tactical reroute',
        targetSector: turnData.commandDirective.targetSector || 'Primary Incident Sector',
        assignedTool: toolToRun || 'resource_allocator',
        expectedOutcome: turnData.commandDirective.expectedOutcome || 'Stabilize system telemetry',
        status: turnData.problemResolved ? 'verified' : 'executed',
        executedAt: new Date().toLocaleTimeString(),
        resultNotes: toolLog?.status === 'success' ? 'Tool execution succeeded and confirmed' : undefined,
      });
    }

    // Reduce crisis level upon Commander intervention
    if (currentRound >= 2) {
      const reduction = currentRound >= 4 ? 40 : 25;
      updatedBlackboard.crisisLevel = Math.max(0, updatedBlackboard.crisisLevel - reduction);
    }

    if (turnData.problemResolved || updatedBlackboard.crisisLevel <= 10) {
      updatedBlackboard.resolved = true;
      updatedBlackboard.crisisLevel = 0;
      updatedBlackboard.stabilityScore = 99.8;
      updatedBlackboard.resolutionSummary =
        turnData.resolutionSummary ||
        `Mission successfully resolved: Tracker verified normal telemetry, Predictor projected zero residual cascade, and Commander enforced final closure protocol.`;
    }
  }

  // Calculate updated stability score
  updatedBlackboard.stabilityScore = Math.max(5, Math.min(100, 100 - updatedBlackboard.crisisLevel));

  // Append metric history point
  updatedBlackboard.metricsHistory.push({
    round: currentRound,
    timestamp: new Date().toLocaleTimeString(),
    crisisLevel: updatedBlackboard.crisisLevel,
    stabilityScore: updatedBlackboard.stabilityScore,
    throughputRate: Math.max(10, Math.min(100, 100 - updatedBlackboard.crisisLevel * 0.7)),
    agentConsensus: updatedBlackboard.resolved ? 99 : 82 + (currentRound * 3),
  });

  // Update Agent profiles
  const updatedAgents = agents.map((agent) => {
    if (agent.role === role) {
      return {
        ...agent,
        cognitiveLoad: Math.min(95, 40 + Math.floor(Math.random() * 35)),
        status: (updatedBlackboard.resolved ? 'resolved' : 'communicating') as any,
        monologue: turnData.monologue || agent.monologue,
        recentAction: toolLog
          ? `Invoked ${toolLog.toolName} (${toolLog.status})`
          : msgData.subject,
        messagesSentCount: agent.messagesSentCount + 1,
        toolsInvokedCount: toolLog ? agent.toolsInvokedCount + 1 : agent.toolsInvokedCount,
      };
    }
    return agent;
  });

  return {
    agentRole: role,
    round: currentRound,
    message: newMessage,
    toolLog,
    updatedBlackboard,
    updatedAgents,
  };
}

function getFallbackTurnData(role: AgentRole, round: number, task: MissionTask, blackboard: BlackboardState) {
  if (role === 'tracker') {
    return {
      status: 'observing',
      monologue: `Scanning telemetry array for ${task.title}. Detected cross-node variance divergence.`,
      messageToTeam: {
        recipient: 'predictor',
        subject: `TELEMETRY ALERT: Flow rupture isolated in ${task.domain}`,
        body: `Ingestion scan completed. Primary throughput dropped to -43.2% while variance increased 3.1x. Relaying verified state vector for cascade projection.`,
        priority: 'high',
      },
      toolInvocation: {
        toolName: 'telemetry_query_tool',
        arguments: { targetMetric: 'all_channels', sensitivityThreshold: 2.5 },
      },
      extractedFacts: [
        { key: 'Observed_Variance', value: '3.1x baseline sigma' },
        { key: 'Root_Vector', value: 'Ingress channel throttle' },
      ],
      detectedAnomalies: [
        { metric: 'Ingress Channel Latency', deviation: '+310% above tolerance', severity: 'critical' },
      ],
    };
  }
  if (role === 'predictor') {
    return {
      status: 'forecasting',
      monologue: `Simulating stochastic futures on Tracker telemetry. Critical failure projected within 45 minutes.`,
      messageToTeam: {
        recipient: 'commander',
        subject: `CASCADE WARNING: 89.4% probability of terminal outage in T+45m`,
        body: `Monte Carlo runs project that current throughput drag will saturate auxiliary buffers within 18 minutes, resulting in systemic collapse at T+45m. Immediate intervention required.`,
        priority: 'critical',
      },
      toolInvocation: {
        toolName: 'monte_carlo_predictor',
        arguments: { simulationsCount: 1000, horizonMinutes: 45 },
      },
      forecasts: [
        { horizon: 'immediate', timeframe: 'T+15m', probabilityOfFailure: 52, projectedImpact: 'Secondary buffer saturation', recommendedAction: 'Deploy reserve units' },
        { horizon: 'mid_term', timeframe: 'T+30m', probabilityOfFailure: 76, projectedImpact: 'Cascade across adjacent sectors', recommendedAction: 'Isolate divergent routes' },
        { horizon: 'terminal', timeframe: 'T+45m', probabilityOfFailure: 89, projectedImpact: 'Total mission failure', recommendedAction: 'Emergency failover protocol' },
      ],
      crisisLevel: Math.max(65, blackboard.crisisLevel),
    };
  }
  // Commander
  return {
    status: 'action_dispatched',
    monologue: `Synthesizing Tracker data and Predictor risk horizon. Issuing executive resource dispatch and protocol isolation.`,
    messageToTeam: {
      recipient: 'all',
      subject: `EXECUTIVE ORDER: Strategic Reserves Injected - Quarantine Engaged`,
      body: `I have allocated 450 units from strategic reserves and initiated protocol isolation on faulty ingress nodes. Tracker: monitor delta decay. Predictor: update risk matrix.`,
      priority: 'critical',
    },
    toolInvocation: {
      toolName: 'resource_allocator',
      arguments: { unitsDispatched: 450, allocationPool: 'strategic_reserve_alpha' },
    },
    commandDirective: {
      title: 'Deploy Strategic Reserves & Quarantine Runaway Nodes',
      action: 'Allocate emergency reserves and reconfigure routing topology',
      targetSector: 'Primary Crisis Sector',
      expectedOutcome: 'De-escalate crisis index by 50% in next cycle',
    },
    problemResolved: round >= 4 && blackboard.crisisLevel <= 25,
    resolutionSummary: `The 3-agent swarm has completely solved the incident on its own. Full operational SLA restored.`,
  };
}
