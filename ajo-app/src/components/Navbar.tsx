'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { formatAddress } from '@/lib/stellar';
import { Wallet, LogOut, Plus } from 'lucide-react';

export const Navbar = ({ onOpenCreate }: { onOpenCreate: () => void }) => {
  const { address, isConnected, isConnecting, connect, disconnect, network } = useWallet();

  return (
    <header className="border-b border-white/[0.08] bg-[#0B0F14]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-900 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Ajo emblem"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-white tracking-tight">Ajo</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Rotating Savings on Stellar</span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Stellar {network}</span>
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start a circle</span>
          </button>

          {isConnected ? (
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.12] rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-slate-200">{formatAddress(address!)}</span>
              <button
                onClick={disconnect}
                className="text-slate-400 hover:text-white p-0.5 transition"
                title="Disconnect wallet"
                aria-label="Disconnect wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#E5A93C] text-black hover:bg-[#F5BE58] transition shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
