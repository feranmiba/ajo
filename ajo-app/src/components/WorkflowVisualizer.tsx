'use client';

import React, { useState } from 'react';
import { Plus, UserCheck, ShieldCheck, ArrowRight, Check } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: 'Create and set terms',
    summary: 'The organizer chooses the contribution amount, member capacity, and round frequency (such as $50 USDC every week).',
    detail: 'Parameters are stored on-chain in the Soroban contract. The organizer automatically occupies the first slot in the circle.',
  },
  {
    step: '2',
    title: 'Fill the roster',
    summary: 'Invited participants connect their Stellar wallets and join the circle until the target member count is reached.',
    detail: 'Once full, the organizer locks the roster. The contract permanently fixes the rotation sequence so turn orders cannot be swapped.',
  },
  {
    step: '3',
    title: 'Deposit each round',
    summary: 'Members authorize their contribution in USDC each period directly to the Soroban contract escrow.',
    detail: 'Funds never touch any private intermediary wallet. If a member misses a round deadline, active contributors can trigger a pro-rata refund.',
  },
  {
    step: '4',
    title: 'Collect the pot',
    summary: 'As soon as the round pool is complete, the contract disburses 100% of the funds directly to that round’s recipient.',
    detail: 'Rounds advance automatically until every participant has received their payout turn, completing the cycle.',
  },
];

export const WorkflowVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="my-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How an Ajo circle runs
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          From first setup to final payout: automated rotation without an organizer holding the pool.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {STEPS.map((s, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isCurrent
                    ? 'bg-[#161F2B] border-white/30 text-white shadow-sm'
                    : 'bg-[#10161E] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isCurrent ? 'bg-[#E5A93C] text-black font-bold' : 'bg-white/[0.06] text-slate-400'
                  }`}>
                    Phase {s.step}
                  </span>
                </div>
                <h3 className={`text-xs sm:text-sm font-semibold leading-snug ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                  {s.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Step Explainer Card */}
        <div className="bg-[#121821] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl">
            <span className="text-xs text-[#E5A93C] font-semibold tracking-wide">
              Step {STEPS[activeStep].step} of 4
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
              {STEPS[activeStep].title}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {STEPS[activeStep].summary}
            </p>
            <div className="mt-5 pt-4 border-t border-white/[0.08] text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">On-chain mechanism:</strong> {STEPS[activeStep].detail}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
