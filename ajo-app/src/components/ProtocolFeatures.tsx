'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Undo2, Coins } from 'lucide-react';

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: 'Non-custodial escrow',
    description: 'Deposits live inside the Soroban contract. The circle organizer cannot withdraw or redirect funds to private wallets.',
  },
  {
    icon: RefreshCw,
    title: 'Immutable payout order',
    description: 'The rotation schedule is locked the moment the circle activates. Turn orders cannot be skipped or rescheduled.',
  },
  {
    icon: Undo2,
    title: 'Missed-round refunds',
    description: 'If a round deadline expires with missing contributions, active contributors can trigger a pro-rata refund and close the circle.',
  },
  {
    icon: Coins,
    title: 'Inflation protection',
    description: 'Saving in USDC shields the group from domestic currency volatility, while live Naira estimations keep savings targets clear.',
  },
];

export const ProtocolFeatures: React.FC = () => {
  return (
    <section className="my-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How Soroban protects your circle
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Replacing handwritten books and informal cash holding with verifiable code on Stellar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {GUARANTEES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-[#121821] border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#E5A93C] mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
