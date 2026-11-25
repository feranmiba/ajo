'use client';

import React, { useState } from 'react';
import { formatUSDC, formatNGN } from '@/lib/stellar';
import { Users, Calendar, DollarSign } from 'lucide-react';

export const SavingsCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(50); // in USDC
  const [members, setMembers] = useState<number>(6);
  const [frequencyDays, setFrequencyDays] = useState<number>(7); // Weekly default

  const totalPot = amount * members;
  const cycleDurationDays = members * frequencyDays;

  return (
    <section className="my-16 sm:my-20">
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono inline-block mb-2">
          Savings Calculator
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Estimate Circle Returns
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono">
          Model savings targets with estimated Naira conversions at current testnet rates.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-[#18181b] border border-zinc-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xl">
        {/* Controls */}
        <div className="md:col-span-7 space-y-6">
          {/* Contribution Amount */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs font-mono">
              <label htmlFor="contribution-slider" className="text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-white" /> Contribution
              </label>
              <div className="text-right">
                <span className="font-bold text-white text-sm block tabular-nums">{formatUSDC(amount)}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">~ {formatNGN(amount)}</span>
              </div>
            </div>
            <input
              id="contribution-slider"
              type="range"
              min="10"
              max="500"
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white touch-target"
            />
          </div>

          {/* Members Count */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs font-mono">
              <label htmlFor="members-slider" className="text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-white" /> Circle Size
              </label>
              <span className="font-bold text-white text-sm tabular-nums">
                {members} Members
              </span>
            </div>
            <input
              id="members-slider"
              type="range"
              min="2"
              max="12"
              step="1"
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white touch-target"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-white" /> Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {[
                { label: 'Daily', days: 1 },
                { label: 'Weekly', days: 7 },
                { label: 'Monthly', days: 30 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFrequencyDays(item.days)}
                  className={`py-3 px-3 rounded-lg border font-medium transition min-h-[44px] flex items-center justify-center touch-target ${
                    frequencyDays === item.days
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Summary Card */}
        <div className="md:col-span-5 bg-black border border-zinc-800 p-6 rounded-2xl text-center flex flex-col justify-between h-full relative font-mono">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">
              Your Lump-Sum Payout
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white my-2 block tabular-nums">
              {formatUSDC(totalPot)}
            </span>
            <span className="text-sm font-semibold text-zinc-300 block">
              ~ {formatNGN(totalPot)} NGN
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-400 block">Total Cycle</span>
              <span className="font-bold text-white">{cycleDurationDays} Days</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Rounds</span>
              <span className="font-bold text-white">{members} Rounds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
