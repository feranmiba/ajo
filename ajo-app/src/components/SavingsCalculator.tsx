'use client';

import React, { useState } from 'react';
import { formatUSDC, formatNGN } from '@/lib/stellar';
import { Users, Calendar, Coins, ArrowRight } from 'lucide-react';

export const SavingsCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(50); // in USDC
  const [members, setMembers] = useState<number>(6);
  const [frequencyDays, setFrequencyDays] = useState<number>(7); // Weekly default

  const totalPot = amount * members;
  const cycleDurationDays = members * frequencyDays;

  const frequencyLabel = {
    1: 'daily',
    7: 'weekly',
    14: 'bi-weekly',
    30: 'monthly',
  }[frequencyDays] || `${frequencyDays} days`;

  return (
    <section className="my-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Savings planner
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Model your circle. See how much each member contributes and the lump-sum you collect on your payout round.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-[#121821] border border-white/[0.08] rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="md:col-span-7 space-y-6">
          {/* Contribution Amount */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label htmlFor="contribution-slider" className="text-sm font-medium text-slate-200">
                Contribution per round
              </label>
              <div className="text-right">
                <span className="text-lg font-bold text-white tabular-nums">
                  {formatUSDC(amount)}
                </span>
                <span className="text-xs text-[#E5A93C] font-medium block">
                  ~ {formatNGN(amount)}
                </span>
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>$10</span>
              <span>$250</span>
              <span>$500</span>
            </div>
          </div>

          {/* Members Count */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label htmlFor="members-slider" className="text-sm font-medium text-slate-200">
                Circle size
              </label>
              <span className="text-base font-bold text-white tabular-nums">
                {members} members
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>2 members</span>
              <span>6 members</span>
              <span>12 members</span>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <span className="block text-sm font-medium text-slate-200 mb-2">
              Round schedule
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Weekly', days: 7 },
                { label: 'Bi-weekly', days: 14 },
                { label: 'Monthly', days: 30 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFrequencyDays(item.days)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                    frequencyDays === item.days
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Summary Card */}
        <div className="md:col-span-5 bg-[#0B0F14] border border-white/[0.1] rounded-2xl p-6 flex flex-col justify-between h-full">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              Your lump-sum payout
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight block">
              {formatUSDC(totalPot)}
            </span>
            <span className="text-sm text-[#E5A93C] font-semibold block mt-1">
              ~ {formatNGN(totalPot)} NGN
            </span>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              You contribute {formatUSDC(amount)} {frequencyLabel} for {members} rounds. When your scheduled turn arrives, you collect the full {formatUSDC(totalPot)} pot in one disbursement.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Total cycle</span>
              <span className="font-semibold text-white">{cycleDurationDays} days</span>
            </div>
            <div>
              <span className="text-slate-500 block">Rounds in circle</span>
              <span className="font-semibold text-white">{members} rounds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
