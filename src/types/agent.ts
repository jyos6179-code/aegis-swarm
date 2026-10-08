export type AgentRole = 'tracker' | 'predictor' | 'commander';

export interface AgentProfile {
  id: string;
  role: AgentRole;
  name: string;
  callsign: string;
  badgeTitle: string;
  avatarColor: string;
  accentColor: string;
  description: string;
  specialization: string[];
  cognitiveLoad: number; // 0 - 100
  status: 'idle' | 'analyzing' | 'computing' | 'executing' | 'communicating' | 'awaiting' | 'resolved';
  monologue: string;
  recentAction: string;
  activeGoals: string[];
  toolsAccess: string[];
  messagesSentCount: number;
  toolsInvokedCount: number;
}

export type MessageType =
  | 'telemetry_alert'
  | 'state_vector'
  | 'prediction_dispatch'
  | 'risk_assessment'
  | 'command_directive'
  | 'tool_invocation'
  | 'tool_response'
  | 'status_sync'
  | 'chaos_event'
  | 'solution_verified';

export interface InterAgentMessage {
  id: string;
  timestamp: string;
  round: number;
  sender: AgentRole | 'system' | 'environment';
  recipient: AgentRole | 'all';
  type: MessageType;
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  toolUsed?: string;
  metadata?: Record<string, any>;
}

export interface SharedTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'telemetry' | 'forecasting' | 'intervention' | 'coordination';
  permittedRoles: (AgentRole | 'all')[];
  iconName: string;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    description: string;
    options?: string[];
    defaultValue: any;
  }[];
  invocationCount: number;
  lastInvokedBy?: AgentRole;
  lastExecutionTimestamp?: string;
  lastResult?: any;
}

export interface ToolExecutionLog {
  id: string;
  timestamp: string;
  round: number;
  toolId: string;
  toolName: string;
  invokedBy: AgentRole;
  arguments: Record<string, any>;
  output: any;
  status: 'success' | 'warning' | 'error';
  executionTimeMs: number;
}

export interface AnomalyItem {
  id: string;
  metric: string;
  deviation: string;
  severity: 'warning' | 'critical';
  detectedAtRound: number;
  detectedBy: AgentRole;
  status: 'active' | 'mitigating' | 'resolved';
}

export interface ForecastHorizon {
  horizon: 'immediate' | 'mid_term' | 'terminal';
  timeframe: string;
  probabilityOfFailure: number; // 0 - 100
  projectedImpact: string;
  recommendedAction: string;
}

export interface CommandDirective {
  id: string;
  round: number;
  title: string;
  action: string;
  targetSector: string;
  assignedTool: string;
  expectedOutcome: string;
  status: 'pending' | 'in_progress' | 'executed' | 'verified';
  executedAt?: string;
  resultNotes?: string;
}

export interface SharedFact {
  id: string;
  key: string;
  value: string;
  verifiedBy: AgentRole;
  timestamp: string;
}

export interface MetricSnapshot {
  round: number;
  timestamp: string;
  crisisLevel: number;
  stabilityScore: number;
  throughputRate: number;
  agentConsensus: number;
}

export interface BlackboardState {
  crisisLevel: number; // 0 - 100
  stabilityScore: number; // 0 - 100
  resolved: boolean;
  resolutionSummary: string | null;
  anomalies: AnomalyItem[];
  forecasts: ForecastHorizon[];
  directives: CommandDirective[];
  sharedFacts: SharedFact[];
  metricsHistory: MetricSnapshot[];
}

export interface MissionTask {
  id: string;
  title: string;
  domain: string;
  objective: string;
  background: string;
  initialCrisisLevel: number;
  estimatedComplexity: 'Moderate' | 'High' | 'Severe';
  initialAnomalies: { metric: string; deviation: string; severity: 'warning' | 'critical' }[];
  keyTelemetryMetrics: string[];
  suggestedTools: string[];
}
