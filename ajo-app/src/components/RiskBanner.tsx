'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const RiskBanner = () => {
  return (
    <aside aria-label="Network and safety notice" className="bg-[#18181b] border-b border-zinc-800 text-zinc-300 px-4 py-2.5 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
          <span>
            <strong className="text-white">Experimental Testnet:</strong> Smart contracts manage escrow and rotation. Peer default risk remains. Testnet USDC only.
          </span>
        </div>
        <a
          href="/TRUST_ASSUMPTIONS.md"
          className="underline text-white hover:text-zinc-300 shrink-0 font-medium hidden sm:inline py-1"
        >
          Trust assumptions
        </a>
      </div>
    </aside>
  );
};
