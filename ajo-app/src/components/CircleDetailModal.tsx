'use client';

import React, { useState } from 'react';
import { CircleData, formatAddress, formatUSDC, formatNGN } from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { X, Check } from 'lucide-react';

interface CircleDetailModalProps {
  circle: CircleData | null;
  onClose: () => void;
  onUpdateCircle: (updated: CircleData) => void;
}

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  circle,
  onClose,
  onUpdateCircle,
}) => {
  const { address, isConnected, connect } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'actions'>('overview');

  if (!circle) return null;

  const potSize = circle.amount * circle.maxMembers;
  const isMember = address ? circle.members.includes(address) : false;
  const isAdmin = address ? circle.admin === address : false;
  const isFull = circle.members.length >= circle.maxMembers;

  const handleJoin = async () => {
    if (!isConnected) return connect();
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const updated = {
        ...circle,
        members: [...circle.members, address!],
        payoutOrder: [...circle.payoutOrder, address!],
      };
      onUpdateCircle(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const updated: CircleData = {
        ...circle,
        status: 'Active',
      };
      onUpdateCircle(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContribute = async () => {
    if (!isConnected) return connect();
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      alert(`Successfully contributed ${formatUSDC(circle.amount)} USDC to Circle #${circle.id}!`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayout = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const recipient = circle.payoutOrder[circle.currentRound] || circle.admin;
      alert(`Successfully paid out ${formatUSDC(potSize)} USDC to recipient ${formatAddress(recipient)}!`);
      const nextRound = circle.currentRound + 1;
      const isComplete = nextRound >= circle.members.length;
      const updated: CircleData = {
        ...circle,
        currentRound: isComplete ? circle.currentRound : nextRound,
        status: isComplete ? 'Completed' : 'Active',
      };
      onUpdateCircle(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121821] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-white/[0.1] flex items-center justify-center text-white font-semibold text-sm">
            #{circle.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Circle #{circle.id}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full border bg-white/[0.05] border-white/[0.1] text-slate-300">
                {circle.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Organizer: <span className="font-mono text-slate-300">{formatAddress(circle.admin, 6)}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] mb-4 gap-6">
          {(['overview', 'members', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#E5A93C] text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 bg-[#0B0F14] p-4 rounded-xl border border-white/[0.06]">
                <div>
                  <span className="text-slate-400 block mb-0.5">Round pot</span>
                  <span className="text-xl font-bold text-white tabular-nums block">
                    {formatUSDC(potSize)}
                  </span>
                  <span className="text-xs text-[#E5A93C] font-medium block mt-0.5">
                    ~ {formatNGN(potSize)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contribution per round</span>
                  <span className="text-base font-semibold text-slate-200 tabular-nums block">
                    {formatUSDC(circle.amount)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    ~ {formatNGN(circle.amount)}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B0F14] p-4 rounded-xl border border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current round:</span>
                  <span className="font-medium text-white">
                    Round {circle.currentRound + 1} of {circle.maxMembers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled recipient:</span>
                  <span className="font-mono text-slate-200">
                    {circle.payoutOrder[circle.currentRound]
                      ? formatAddress(circle.payoutOrder[circle.currentRound], 6)
                      : 'Pending circle start'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roster capacity:</span>
                  <span className="font-medium text-white">
                    {circle.members.length} / {circle.maxMembers} members
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block">
                Rotation order ({circle.members.length} of {circle.maxMembers} joined)
              </span>
              <div className="divide-y divide-white/[0.06] bg-[#0B0F14] rounded-xl border border-white/[0.06] overflow-hidden">
                {circle.members.map((m, idx) => (
                  <div key={m + idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] text-slate-300 text-[10px] flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-slate-200">{formatAddress(m, 6)}</span>
                      {m === circle.admin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                          Organizer
                        </span>
                      )}
                    </div>
                    {m === address && (
                      <span className="text-xs text-[#E5A93C] font-semibold">You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-3 pt-1">
              {circle.status === 'Created' && !isMember && !isFull && (
                <button
                  onClick={handleJoin}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[#E5A93C] text-black font-semibold hover:bg-[#F5BE58] transition"
                >
                  {isProcessing ? 'Joining circle...' : 'Join this circle'}
                </button>
              )}

              {circle.status === 'Created' && isAdmin && (
                <button
                  onClick={handleStart}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition"
                >
                  {isProcessing ? 'Starting circle...' : 'Lock roster and start circle'}
                </button>
              )}

              {circle.status === 'Active' && isMember && (
                <button
                  onClick={handleContribute}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[#E5A93C] text-black font-semibold hover:bg-[#F5BE58] transition"
                >
                  {isProcessing
                    ? 'Processing transfer...'
                    : `Contribute ${formatUSDC(circle.amount)} USDC (~${formatNGN(circle.amount)})`}
                </button>
              )}

              {circle.status === 'Active' && isAdmin && (
                <button
                  onClick={handlePayout}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition"
                >
                  {isProcessing
                    ? 'Executing payout...'
                    : `Execute round ${circle.currentRound + 1} payout`}
                </button>
              )}

              {circle.status === 'Completed' && (
                <div className="p-4 text-center text-xs text-slate-400 bg-[#0B0F14] rounded-xl border border-white/[0.06]">
                  This circle has completed all {circle.maxMembers} payout rounds.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
