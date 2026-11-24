'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatNGN, formatUSDC } from '@/lib/stellar';
import { X, Plus } from 'lucide-react';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newCircle: any) => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const { address, isConnected, connect } = useWallet();
  const [amount, setAmount] = useState('50');
  const [maxMembers, setMaxMembers] = useState('4');
  const [periodDays, setPeriodDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      await connect();
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));

      const newCircle = {
        id: Math.floor(Math.random() * 900) + 100,
        admin: address!,
        token: 'USDC (Stellar Testnet)',
        amount: parseFloat(amount),
        periodSecs: parseInt(periodDays) * 86400,
        maxMembers: parseInt(maxMembers),
        status: 'Created',
        currentRound: 0,
        members: [address!],
        payoutOrder: [address!],
      };

      onCreateSuccess(newCircle);
      onClose();
    } catch (err) {
      console.error('Failed to create circle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const usdcNum = parseFloat(amount) || 0;
  const potTotal = usdcNum * (parseInt(maxMembers) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121821] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-white">Start a savings circle</h2>
          <p className="text-xs text-slate-400 mt-1">
            Define your circle parameters. You will be registered as the first member.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Contribution amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                required
                className="w-full bg-[#0B0F14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5A93C]"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                USDC
              </span>
            </div>
            <span className="text-xs text-[#E5A93C] mt-1 block font-medium">
              ~ {formatNGN(usdcNum)} per member per round
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Number of members
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              min="2"
              max="20"
              required
              className="w-full bg-[#0B0F14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5A93C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Round frequency
            </label>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5A93C]"
            >
              <option value="1">Daily (1 day)</option>
              <option value="7">Weekly (7 days)</option>
              <option value="14">Bi-weekly (14 days)</option>
              <option value="30">Monthly (30 days)</option>
            </select>
          </div>

          {/* Pot Preview Box */}
          <div className="bg-[#0B0F14] border border-white/[0.08] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total round pot</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {formatUSDC(potTotal)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Naira estimate</span>
              <span className="text-xs font-semibold text-[#E5A93C]">
                ~ {formatNGN(potTotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F5BE58] text-black font-semibold text-sm transition disabled:opacity-50"
          >
            {isSubmitting
              ? 'Deploying to Soroban...'
              : !isConnected
              ? 'Connect wallet to deploy'
              : 'Create circle'}
          </button>
        </form>
      </div>
    </div>
  );
};
