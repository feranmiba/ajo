'use client';

import React, { useState } from 'react';
import { PlusCircle, UserPlus, Coins, Gift } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: PlusCircle,
    title: '1. Create Circle',
    subtitle: 'Admin Setup',
    description: 'Circle creator defines contribution amount in USDC, member limit (e.g. 5 members), and round frequency (e.g. Weekly).',
    badge: 'Soroban Init',
    detail: 'Deploys circle state on-chain with deterministic parameters.',
  },
  {
    id: 2,
    icon: UserPlus,
    title: '2. Join Roster',
    subtitle: 'Member Onboarding',
    description: 'Group members connect Freighter wallet and execute join(circle_id). Membership locks when max limit is reached.',
    badge: 'require_auth()',
    detail: 'Contract verifies unique member addresses & locks rotation.',
  },
  {
    id: 3,
    icon: Coins,
    title: '3. Periodic Contribution',
    subtitle: 'Escrow Pool',
    description: 'Each round, members approve and transfer their fixed contribution into the Soroban smart contract escrow.',
    badge: 'USDC SAC',
    detail: 'Stellar Asset Contract handles token transfers securely.',
  },
  {
    id: 4,
    icon: Gift,
    title: '4. Automated Payout',
    subtitle: 'Round Settlement',
    description: 'Once all contributions arrive, the smart contract disburses the entire round pot (~500 USDC) to the current turn recipient.',
    badge: 'Auto Turn',
    detail: 'Rounds advance automatically until every member receives their turn.',
  },
];

export const WorkflowVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="my-16 sm:my-20">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono inline-block mb-2">
          Protocol Architecture
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          How Ajo Protocol Works
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono">
          Digitizing traditional ROSCAs on Stellar Soroban with transparent smart contract mechanics.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl text-left border transition-all min-h-[96px] touch-target flex flex-col justify-between ${
                  isActive
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isActive ? 'bg-black text-white' : 'bg-zinc-800 text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    isActive ? 'bg-zinc-200 text-black border-zinc-300' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}>
                    0{step.id}
                  </span>
                </div>

                <div>
                  <h4 className={`font-bold text-xs sm:text-sm ${isActive ? 'text-black' : 'text-white'}`}>
                    {step.subtitle}
                  </h4>
                  <p className={`text-[11px] font-mono mt-0.5 ${isActive ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    {step.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Explainer Card */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl font-mono">
            <span className="text-xs text-zinc-400 uppercase tracking-wider block">
              Step 0{STEPS[activeStep].id} Details
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3 font-sans">
              {STEPS[activeStep].title} — {STEPS[activeStep].subtitle}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans mb-4">
              {STEPS[activeStep].description}
            </p>
            <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>{STEPS[activeStep].detail}</span>
              <span className="bg-black px-2.5 py-1 rounded border border-zinc-700 text-white font-bold">
                {STEPS[activeStep].badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
