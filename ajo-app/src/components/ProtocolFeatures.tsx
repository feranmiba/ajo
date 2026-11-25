'use client';

import React from 'react';
import { ShieldCheck, Coins, Zap, RefreshCw, Lock, Globe2 } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Soroban Smart Contract Escrow',
    description: 'Funds are held in non-custodial Rust smart contract escrow. Admins cannot withdraw pooled assets outside of settled payouts.',
  },
  {
    icon: Coins,
    title: 'USDC Inflation Resistance',
    description: 'Native USDC stablecoin support prevents local currency inflation and native XLM price volatility from breaking fixed targets.',
  },
  {
    icon: Zap,
    title: 'Instant Stellar Finality',
    description: 'Sub-second transactions with micro-cent gas fees on Stellar network ensure quick contributions and instant round payouts.',
  },
  {
    icon: RefreshCw,
    title: 'Immutable Rotation Order',
    description: 'Payout sequence is locked upon circle start. Rounds advance automatically once all contributions are collected.',
  },
  {
    icon: Lock,
    title: 'Missed Round Protection',
    description: 'If a member misses a round deadline, active contributors can trigger a pro-rata escrow refund and cancel the circle.',
  },
  {
    icon: Globe2,
    title: 'Local NGN Rate Contextualization',
    description: 'Real-time USD/NGN rate feed displays estimated Naira equivalents for Nigerian ROSCA participants.',
  },
];

export const ProtocolFeatures: React.FC = () => {
  return (
    <section className="my-16 sm:my-20">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono inline-block mb-2">
          Protocol Guarantees
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Why Build ROSCAs on Ajo Protocol?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono">
          Replacing traditional manual ledger tracking with verifiable blockchain primitives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-[#18181b] border border-zinc-800 hover:border-zinc-600 p-6 rounded-2xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center mb-4 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-bold text-base text-white mb-2 group-hover:text-zinc-200 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Verified Primitive</span>
                <span className="text-white font-bold">On-Chain</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
