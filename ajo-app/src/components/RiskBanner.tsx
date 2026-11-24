'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export const RiskBanner = () => {
  return (
    <aside aria-label="Network and safety notice" className="bg-[#101720] border-b border-white/[0.08] text-slate-300 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
          <p>
            <span className="font-semibold text-white">Stellar Testnet:</span> Smart contracts automate escrow and payouts, but cannot eliminate peer default risk. Use testnet USDC only.
          </p>
        </div>
        <a
          href="/TRUST_ASSUMPTIONS.md"
          className="text-xs text-slate-300 hover:text-white underline underline-offset-2 shrink-0 hidden sm:inline"
        >
          Trust assumptions
        </a>
      </div>
    </aside>
  );
};
