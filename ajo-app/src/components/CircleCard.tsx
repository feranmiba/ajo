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
      dot: 'bg-white',
      badge: 'text-white bg-zinc-800 border-zinc-700',
    },
    Created: {
      label: 'Open to join',
      dot: 'bg-zinc-400',
      badge: 'text-zinc-300 bg-zinc-900 border-zinc-700',
    },
    Completed: {
      label: 'Completed',
      dot: 'bg-zinc-500',
      badge: 'text-zinc-400 bg-black border-zinc-800',
    },
    Cancelled: {
      label: 'Cancelled',
      dot: 'bg-zinc-600',
      badge: 'text-zinc-400 bg-black border-zinc-800',
    },
  }[circle.status];

  return (
    <article
      onClick={() => onSelect(circle)}
      className="bg-[#18181b] hover:bg-[#202024] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between group touch-target min-h-[220px]"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-mono">Circle #{circle.id}</span>
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {formatPeriod(circle.periodSecs)}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-mono ${statusConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span className="font-semibold">{statusConfig.label}</span>
          </div>
        </div>

        {/* Primary Financial Overview Box */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-black p-3.5 rounded-xl border border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">
              Round Pot
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono block tabular-nums">
              {formatUSDC(potSize)}
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              {formatNGN(potSize)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">
              Per Member
            </span>
            <span className="text-sm sm:text-base font-semibold text-zinc-300 font-mono block tabular-nums">
              {formatUSDC(circle.amount)}
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              {formatNGN(circle.amount)}
            </span>
          </div>
        </div>

        {/* Roster Progress */}
        <div className="space-y-1.5 my-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-white" /> Members
            </span>
            <span className="text-xs font-semibold text-white">
              {circle.members.length} / {circle.maxMembers} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-white rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div>
          {circle.status === 'Active' && circle.payoutOrder[circle.currentRound] ? (
            <span>
              Turn: <span className="text-zinc-200">{formatAddress(circle.payoutOrder[circle.currentRound])}</span>
            </span>
          ) : (
            <span>Admin: <span className="text-zinc-300">{formatAddress(circle.admin)}</span></span>
          )}
        </div>

        <span className="text-zinc-300 group-hover:text-white flex items-center gap-1 font-bold transition-colors py-1">
          Details
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
};
