'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatNGN } from '@/lib/stellar';
import { X, PlusCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-white shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Create Savings Circle</h2>
            <p className="text-xs text-zinc-400 font-mono">Configure ROSCA parameters on Stellar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 font-mono mb-1.5">
              Contribution Per Member (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                required
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-white min-h-[44px]"
              />
              <span className="absolute right-4 top-3 text-xs text-zinc-400 font-mono font-bold">
                USDC
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
              Estimated: {formatNGN(usdcNum)} per round
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 font-mono mb-1.5">
              Max Members (Circle Size)
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              min="2"
              max="20"
              required
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-white min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 font-mono mb-1.5">
              Round Frequency (Days)
            </label>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-white min-h-[44px]"
            >
              <option value="1">1 Day (Daily)</option>
              <option value="7">7 Days (Weekly)</option>
              <option value="14">14 Days (Bi-Weekly)</option>
              <option value="30">30 Days (Monthly)</option>
            </select>
          </div>

          <div className="bg-black border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                Total Round Pot
              </span>
              <span className="text-lg font-bold text-white">${potTotal} USDC</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block">Naira Equivalent</span>
              <span className="text-xs font-medium text-zinc-300">{formatNGN(potTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 min-h-[48px] rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-sm uppercase tracking-wider transition disabled:opacity-50 touch-target flex items-center justify-center"
          >
            {isSubmitting
              ? 'Deploying to Soroban...'
              : !isConnected
              ? 'Connect Wallet to Deploy'
              : 'Create Circle'}
          </button>
        </form>
      </div>
    </div>
  );
};
