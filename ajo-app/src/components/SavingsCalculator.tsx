'use client';

import React, { useState } from 'react';
import { formatUSDC, formatNGN } from '@/lib/stellar';
import { Calculator, DollarSign, Users, Calendar } from 'lucide-react';

export const SavingsCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(50);
  const [members, setMembers] = useState<number>(5);
  const [frequencyDays, setFrequencyDays] = useState<number>(7);

  const totalPot = amount * members;
  const cycleDurationDays = frequencyDays * members;

  return (
    <div className="my-16 max-w-4xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-white">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ROSCA Savings Calculator</h3>
            <p className="text-xs text-zinc-400 font-mono">Simulate your turn payout & local currency returns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                <span className="text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-white" /> Contribution
                </span>
                <div className="text-right">
                  <span className="font-bold text-white text-sm">{formatUSDC(amount)}</span>
                  <span className="text-[10px] text-zinc-400 block font-mono">~ {formatNGN(amount)}</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                <span className="text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-white" /> Circle Size
                </span>
                <span className="font-bold text-white text-sm">{members} Members</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={members}
                onChange={(e) => setMembers(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono mb-1.5 flex items-center gap-1">
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
                    onClick={() => setFrequencyDays(item.days)}
                    className={`py-2 rounded-lg border font-medium transition ${
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

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl text-center flex flex-col justify-between h-full relative font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">
                Your Lump-Sum Payout
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white my-2 block">
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
      </div>
    </div>
  );
};
