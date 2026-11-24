'use client';

import React from 'react';
import { CircleData, formatAddress, formatUSDC, formatNGN } from '@/lib/stellar';
import { Users, Calendar, ArrowRight } from 'lucide-react';

interface CircleCardProps {
  circle: CircleData;
  onSelect: (circle: CircleData) => void;
}

const formatPeriod = (secs: number): string => {
  const days = Math.round(secs / 86400);
  if (days <= 1) return 'Daily';
  if (days === 7) return 'Weekly';
  if (days === 14) return 'Bi-weekly';
  if (days >= 28 && days <= 31) return 'Monthly';
  return `${days} days`;
};

export const CircleCard: React.FC<CircleCardProps> = ({ circle, onSelect }) => {
  const potSize = circle.amount * circle.maxMembers;
  const progressPercent = Math.min(
    100,
    Math.round((circle.members.length / circle.maxMembers) * 100)
  );

  const statusConfig = {
    Active: {
      label: `Round ${circle.currentRound + 1} of ${circle.maxMembers}`,
      dot: 'bg-emerald-400',
      badge: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60',
    },
    Created: {
      label: 'Open to join',
      dot: 'bg-[#E5A93C]',
      badge: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
    },
    Completed: {
      label: 'Completed',
      dot: 'bg-slate-400',
      badge: 'text-slate-300 bg-slate-900 border-slate-700',
    },
    Cancelled: {
      label: 'Cancelled',
      dot: 'bg-rose-400',
      badge: 'text-rose-300 bg-rose-950/60 border-rose-800/60',
    },
  }[circle.status];

  return (
    <article
      onClick={() => onSelect(circle)}
      className="bg-[#121821] hover:bg-[#161F2B] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Circle #{circle.id}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatPeriod(circle.periodSecs)}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${statusConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span className="font-medium">{statusConfig.label}</span>
          </div>
        </div>

        {/* Primary Financial Overview */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Target pot</span>
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight block">
              {formatUSDC(potSize)}
            </span>
            <span className="text-xs text-[#E5A93C] font-medium block mt-0.5">
              ~ {formatNGN(potSize)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">Each member pays</span>
            <span className="text-base font-semibold text-slate-200 tabular-nums block">
              {formatUSDC(circle.amount)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              ~ {formatNGN(circle.amount)}
            </span>
          </div>
        </div>

        {/* Roster Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Members
            </span>
            <span className="text-slate-200 font-medium">
              {circle.members.length} / {circle.maxMembers}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-slate-200 group-hover:bg-[#E5A93C] transition-colors rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
        <div>
          {circle.status === 'Active' && circle.payoutOrder[circle.currentRound] ? (
            <span>
              Next turn: <span className="font-mono text-slate-200">{formatAddress(circle.payoutOrder[circle.currentRound])}</span>
            </span>
          ) : (
            <span>Admin: <span className="font-mono text-slate-300">{formatAddress(circle.admin)}</span></span>
          )}
        </div>

        <span className="text-slate-300 group-hover:text-white flex items-center gap-1 font-medium transition-colors">
          View
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
};
