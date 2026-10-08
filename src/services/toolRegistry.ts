import { AgentRole, SharedTool, ToolExecutionLog } from '../types/agent';
import { INITIAL_SHARED_TOOLS } from '../data/presets';

class ToolRegistryService {
  private tools: Map<string, SharedTool> = new Map();
  private logs: ToolExecutionLog[] = [];

  constructor() {
    INITIAL_SHARED_TOOLS.forEach((tool) => {
      this.tools.set(tool.id, { ...tool });
    });
  }

  public getTools(): SharedTool[] {
    return Array.from(this.tools.values());
  }

  public getTool(id: string): SharedTool | undefined {
    return this.tools.get(id);
  }

  public getLogs(): ToolExecutionLog[] {
    return [...this.logs];
  }

  public canAgentAccess(toolId: string, role: AgentRole): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) return false;
    return tool.permittedRoles.includes('all') || tool.permittedRoles.includes(role);
  }

  public async executeTool(
    toolId: string,
    invokedBy: AgentRole,
    args: Record<string, any>,
    round: number,
    crisisLevel: number
  ): Promise<{ log: ToolExecutionLog; result: any }> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found in registry.`);
    }

    const startTime = Date.now();
    let result: any = {};
    let status: 'success' | 'warning' | 'error' = 'success';

    // Simulate realistic computation latency
    await new Promise((resolve) => setTimeout(resolve, 180));

    switch (toolId) {
      case 'telemetry_query_tool': {
        const threshold = Number(args.sensitivityThreshold || 2.5);
        const varianceFactor = crisisLevel > 50 ? (crisisLevel / 35).toFixed(2) : '1.14';
        result = {
          probedChannels: ['ingress_bandwidth', 'core_entropy', 'thermal_envelope', 'error_frequency'],
          varianceFactor: `${varianceFactor}σ`,
          signalIntegrityScore: `${Math.max(12, 100 - crisisLevel).toFixed(1)}%`,
          anomalyDetected: crisisLevel > 25,
          activeRuptures: crisisLevel > 25 ? [
            { channel: 'core_entropy', delta: `+${(crisisLevel * 1.8).toFixed(1)}%`, sigma: varianceFactor },
            { channel: 'throughput_drag', delta: `-${(crisisLevel * 0.9).toFixed(1)}%`, sigma: (Number(varianceFactor) * 0.8).toFixed(2) },
          ] : [],
          timestamp: new Date().toISOString(),
        };
        break;
      }

      case 'state_diff_analyzer': {
        const distance = ((crisisLevel / 100) * 4.2).toFixed(3);
        result = {
          comparisonMode: args.comparisonMode || 'nominal_baseline',
          euclideanDistance: distance,
          divergentVectors: crisisLevel > 30 ? [
            { vector: 'throughput_vs_jitter', divergenceIndex: 0.88, rootCauseConfidence: '91.4%' },
            { vector: 'capacity_headroom', divergenceIndex: 0.74, rootCauseConfidence: '84.0%' },
          ] : [
            { vector: 'all_vectors', divergenceIndex: 0.04, rootCauseConfidence: '99.2%' },
          ],
          deltaDecayRate: crisisLevel < 50 ? '+14.2% recovery per round' : '-4.8% divergence',
        };
        break;
      }

      case 'monte_carlo_predictor': {
        const scenarios = Number(args.simulationsCount || 1000);
        const horizon = Number(args.horizonMinutes || 60);
        const rawFailRate = Math.min(98.4, Math.max(2.1, (crisisLevel * 1.05) - (round > 2 ? 25 : 0)));
        result = {
          scenariosExecuted: scenarios,
          horizonMinutes: horizon,
          probabilityOfTerminalOutage: `${rawFailRate.toFixed(1)}%`,
          estimatedTimeToCascade: crisisLevel > 50 ? `T+${Math.max(8, 48 - round * 4)}m` : 'Stable / Negligible',
          confidenceInterval95: [
            `${Math.max(1, rawFailRate - 4.2).toFixed(1)}%`,
            `${Math.min(99.9, rawFailRate + 3.8).toFixed(1)}%`,
          ],
          stochasticShockAbsorption: crisisLevel < 40 ? 'High (Buffer resilient)' : 'Critical (Buffer depleted)',
        };
        break;
      }

      case 'counterfactual_evaluator': {
        const action = args.hypotheticalAction || 'auxiliary_reserve_injection';
        result = {
          evaluatedAction: action,
          projectedRiskReduction: '-64.8% risk surface compression',
          collateralOverhead: '12.4% temporary operational cost increase',
          recommendedDisposition: 'PROCEED WITH HIGH CONFIDENCE',
          tradeoffMatrix: [
            { strategy: 'Aggressive Isolation', speed: 'Immediate', collateralImpact: 'Moderate', survivalRate: '88%' },
            { strategy: 'Dynamic Reserve Injection (Selected)', speed: 'Fast (<2m)', collateralImpact: 'Minimal', survivalRate: '96.2%' },
          ],
        };
        break;
      }

      case 'resource_allocator': {
        const units = Number(args.unitsDispatched || 450);
        const pool = args.allocationPool || 'strategic_reserve_alpha';
        result = {
          dispatchStatus: 'ALLOCATION_COMMITTED',
          poolDepletedFrom: pool,
          capacityInjected: `${units} Units`,
          targetSector: 'Primary Crisis Zone',
          dampedVariance: '-52.3% peak load shaved',
          activeRoutingTableId: `RT-${Math.floor(Math.random() * 89999 + 10000)}`,
        };
        break;
      }

      case 'protocol_enforcer': {
        const directive = args.protocolDirective || 'isolate_and_quarantine';
        result = {
          protocolExecuted: directive,
          executionState: 'ENFORCED_WITH_CONFIRMATION',
          quarantinedEntitiesCount: 14,
          failoverTransitTimeMs: 42,
          safetyBoundaryTrips: 0,
          immutableAuditHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        };
        break;
      }

      case 'verification_audit_probe': {
        const isClear = crisisLevel <= 30;
        result = {
          auditPassStatus: isClear ? 'VERIFIED_NORMAL_OPERATION' : 'RESIDUAL_DRIFT_DETECTED',
          activeSlaCompliance: isClear ? '99.98%' : '78.4%',
          consecutiveStableCycles: isClear ? 2 : 0,
          residualVarianceSigma: isClear ? '0.04σ' : '1.82σ',
          closureReadiness: isClear ? 'READY_FOR_MISSION_DE-ESCALATION' : 'AWAITING_FURTHER_STABILIZATION',
        };
        break;
      }

      case 'blackboard_sync_tool': {
        result = {
          syncStatus: 'ATOMIC_COMMIT_ACKNOWLEDGED',
          blackboardRevision: round + 1,
          activePeersSynchronized: ['Sentinel-Tracker', 'Oracle-Predictor', 'Vanguard-Commander'],
          stateHash: `BLK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
        break;
      }

      default:
        result = { status: 'executed', argumentsReceived: args };
    }

    const duration = Date.now() - startTime;

    // Update tool metadata
    tool.invocationCount += 1;
    tool.lastInvokedBy = invokedBy;
    tool.lastExecutionTimestamp = new Date().toLocaleTimeString();
    tool.lastResult = result;

    const logEntry: ToolExecutionLog = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      round,
      toolId,
      toolName: tool.displayName,
      invokedBy,
      arguments: args,
      output: result,
      status,
      executionTimeMs: duration,
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > 50) this.logs.pop();

    return { log: logEntry, result };
  }

  public reset(): void {
    INITIAL_SHARED_TOOLS.forEach((tool) => {
      this.tools.set(tool.id, {
        ...tool,
        invocationCount: 0,
        lastInvokedBy: undefined,
        lastExecutionTimestamp: undefined,
        lastResult: undefined,
      });
    });
    this.logs = [];
  }
}

export const toolRegistry = new ToolRegistryService();
