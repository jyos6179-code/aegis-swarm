import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  Activity,
  Cpu,
  ShieldCheck,
  Radio,
  CornerDownLeft,
} from 'lucide-react';
import { MissionTask, BlackboardState, AgentRole } from '../types/agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface OperatorChatProps {
  currentTask: MissionTask;
  blackboard: BlackboardState;
  round: number;
}

export const OperatorChat: React.FC<OperatorChatProps> = ({
  currentTask,
  blackboard,
  round,
}) => {
  const [selectedAgentRole, setSelectedAgentRole] = useState<'commander' | 'predictor' | 'tracker' | 'coordinator'>('commander');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Operator Comm Channel established. I am Vanguard-Commander, standing by to answer executive inquiries regarding the ${currentTask.title} operation. Tracker is continuously monitoring sensor deltas and Predictor is updating Monte Carlo risk curves. What are your orders?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleRoleChange = (newRole: 'commander' | 'predictor' | 'tracker' | 'coordinator') => {
    setSelectedAgentRole(newRole);
    let intro = '';
    if (newRole === 'tracker') {
      intro = `Sentinel-Tracker online. Ingesting raw sensor channels for ${currentTask.domain}. Ask me about live variance, discrepancy deltas, or baseline drift.`;
    } else if (newRole === 'predictor') {
      intro = `Oracle-Predictor online. 1,000 Monte Carlo stochastic trajectories initialized. Ask me about failure horizons, cascade risk curves, or counterfactual branchings.`;
    } else if (newRole === 'commander') {
      intro = `Vanguard-Commander online. Tactical dispatch bus armed. Ask me about resource allocations, mitigation directives, or trade-off decisions.`;
    } else {
      intro = `Aegis Swarm Coordinator online. Synthesizing full triad intelligence across Tracker, Predictor, and Commander. How can I assist?`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'model',
        content: intro,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedAgentRole,
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentTask,
          blackboardState: blackboard,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || 'Directive acknowledged.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: `Telemetry link noise detected. Operation continuing under standard parameters.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    { label: 'Explain Tool Strategy', text: 'Explain why the swarm selected its current shared tools and how they interact.' },
    { label: 'Worst-Case Cascade', text: 'What is the worst-case cascading failure if no countermeasures were deployed?' },
    { label: 'Sensor Drift Breakdown', text: 'Provide a granular telemetry breakdown of the primary sensor deviations.' },
    { label: 'Accelerate Resolution', text: 'What additional parameters or overrides can accelerate mission stabilization?' },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tracker':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'predictor':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'commander':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Radio className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Human Operator Interrogation Channel</span>
              <span className="text-[11px] font-mono text-cyan-400 font-normal">
                [Gemini Multi-Turn Engine]
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Direct conversational link with Tracker, Predictor, or Commander personas
            </p>
          </div>
        </div>

        {/* Agent Persona Switcher */}
        <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => handleRoleChange('commander')}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition ${
              selectedAgentRole === 'commander'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Commander</span>
          </button>
          <button
            onClick={() => handleRoleChange('predictor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition ${
              selectedAgentRole === 'predictor'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Predictor</span>
          </button>
          <button
            onClick={() => handleRoleChange('tracker')}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition ${
              selectedAgentRole === 'tracker'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tracker</span>
          </button>
          <button
            onClick={() => handleRoleChange('coordinator')}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition ${
              selectedAgentRole === 'coordinator'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Coordinator</span>
          </button>
        </div>
      </div>

      {/* Message Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 border border-slate-700 text-slate-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : getRoleIcon(selectedAgentRole)}
              </div>

              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-1 mb-1 border-b border-white/10 text-[10px] opacity-75 font-mono">
                  <span>{isUser ? 'Human Operator' : selectedAgentRole.toUpperCase()}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {getRoleIcon(selectedAgentRole)}
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl rounded-tl-none px-3.5 py-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{selectedAgentRole.toUpperCase()} synthesizing response via Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Prompts */}
      <div className="px-3.5 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">
          Inquiries:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.text)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${selectedAgentRole.toUpperCase()} regarding active mission parameters...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Transmit</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
