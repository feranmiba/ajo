'use client';

import React, { useState } from 'react';
import { CircleData, formatAddress, formatUSDC, formatNGN } from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

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
      await new Promise((r) => setTimeout(r, 1000));
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
      await new Promise((r) => setTimeout(r, 1200));
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
      await new Promise((r) => setTimeout(r, 1500));
      alert(`Successfully contributed ${formatUSDC(circle.amount)} USDC to Circle #${circle.id}!`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayout = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-700 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-white font-mono font-bold text-lg">
            #{circle.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Circle #{circle.id}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono border bg-white text-black font-bold">
                {circle.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">Admin: {formatAddress(circle.admin, 6)}</p>
          </div>
        </div>

        <div className="flex border-b border-zinc-800 mb-4 gap-4">
          {(['overview', 'members', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 pr-1 font-mono text-xs">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 bg-black p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Round Pot</span>
                  <span className="text-xl font-bold text-white block">{formatUSDC(potSize)}</span>
                  <span className="text-[10px] text-zinc-400 block">{formatNGN(potSize)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Round Contribution</span>
                  <span className="text-lg font-semibold text-zinc-200 block">{formatUSDC(circle.amount)}</span>
                  <span className="text-[10px] text-zinc-400 block">{formatNGN(circle.amount)}</span>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-400">Current Round:</span>
                  <span className="font-semibold text-white">
                    Round {circle.currentRound + 1} of {circle.maxMembers}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-400">Turn Recipient:</span>
                  <span className="font-semibold text-white">
                    {circle.payoutOrder[circle.currentRound]
                      ? formatAddress(circle.payoutOrder[circle.currentRound])
                      : 'Pending Start'}
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Member Roster ({circle.members.length}/{circle.maxMembers})
              </h4>
              <div className="divide-y divide-zinc-800 bg-black rounded-xl border border-zinc-800 overflow-hidden">
                {circle.members.map((m, idx) => (
                  <div key={m + idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-white">{formatAddress(m, 6)}</span>
                      {m === circle.admin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Admin
                        </span>
                      )}
                    </div>
                    {m === address && <span className="text-xs text-white font-bold">You</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-3">
              {circle.status === 'Created' && !isMember && !isFull && (
                <button
                  onClick={handleJoin}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition"
                >
                  {isProcessing ? 'Processing Join...' : 'Join Circle'}
                </button>
              )}

              {circle.status === 'Created' && isAdmin && (
                <button
                  onClick={handleStart}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition"
                >
                  {isProcessing ? 'Locking & Starting...' : 'Start Circle (Lock Roster)'}
                </button>
              )}

              {circle.status === 'Active' && isMember && (
                <button
                  onClick={handleContribute}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing Transfer...' : `Contribute ${formatUSDC(circle.amount)} USDC (~${formatNGN(circle.amount)})`}</span>
                </button>
              )}

              {circle.status === 'Active' && isAdmin && (
                <button
                  onClick={handlePayout}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition"
                >
                  {isProcessing ? 'Executing Payout...' : `Execute Round ${circle.currentRound + 1} Payout`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
