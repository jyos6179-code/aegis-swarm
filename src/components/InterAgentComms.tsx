import React, { useState } from 'react';
import {
  MessageSquare,
  ArrowRight,
  Search,
  Filter,
  Wrench,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';
import { InterAgentMessage, AgentRole } from '../types/agent';

interface InterAgentCommsProps {
  messages: InterAgentMessage[];
  onClearMessages?: () => void;
}

export const InterAgentComms: React.FC<InterAgentCommsProps> = ({ messages }) => {
  const [filterRole, setFilterRole] = useState<'all' | AgentRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter((msg) => {
    if (filterRole !== 'all' && msg.sender !== filterRole) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        msg.subject.toLowerCase().includes(q) ||
        msg.content.toLowerCase().includes(q) ||
        (msg.toolUsed && msg.toolUsed.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getSenderBadge = (sender: string) => {
    switch (sender) {
      case 'tracker':
        return {
          label: 'Tracker',
          badgeClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
          dotClass: 'bg-cyan-400',
        };
      case 'predictor':
        return {
          label: 'Predictor',
          badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
          dotClass: 'bg-amber-400',
        };
      case 'commander':
        return {
          label: 'Commander',
          badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
          dotClass: 'bg-emerald-400',
        };
      case 'environment':
        return {
          label: 'Chaos Injected',
          badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
          dotClass: 'bg-rose-400',
        };
      default:
        return {
          label: 'System',
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
          dotClass: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
      {/* Comms Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Inter-Agent Communication Bus</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({messages.length} messages logged)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synchronous message exchange between Tracker, Predictor, and Commander
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transmission logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/60 w-44"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                filterRole === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('tracker')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                filterRole === 'tracker'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tracker
            </button>
            <button
              onClick={() => setFilterRole('predictor')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                filterRole === 'predictor'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Predictor
            </button>
            <button
              onClick={() => setFilterRole('commander')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                filterRole === 'commander'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commander
            </button>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400/50" />
            <p>No messages match current filter criteria.</p>
            <p className="text-[11px] text-slate-400">
              Run or step the autonomous swarm to begin inter-agent deliberation.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const senderInfo = getSenderBadge(msg.sender);
            const isCritical = msg.priority === 'critical';

            return (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  isCritical
                    ? 'bg-slate-950/80 border-rose-900/60 shadow-xs shadow-rose-950/20'
                    : 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700/80'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Sender -> Recipient */}
                    <div className="flex items-center gap-1.5 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold ${senderInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${senderInfo.dotClass}`} />
                        {senderInfo.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 uppercase font-medium">
                        {msg.recipient}
                      </span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">
                      Cycle #{msg.round}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    {msg.priority === 'critical' && (
                      <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/50">
                        Critical
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Subject */}
                <div className="font-semibold text-slate-100 text-xs">
                  {msg.subject}
                </div>

                {/* Body Content */}
                <div className="text-slate-300 text-xs leading-relaxed">
                  {msg.content}
                </div>

                {/* Shared Tool Invocation Footer */}
                {msg.toolUsed && (
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Wrench className="w-3 h-3" />
                      Shared Tool Invocation: <strong className="font-mono text-slate-200">{msg.toolUsed}</strong>
                    </span>
                    <span className="text-slate-400">Shared Blackboard Sync ACK</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
