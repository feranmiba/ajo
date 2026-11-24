'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { RiskBanner } from '@/components/RiskBanner';
import { CircleCard } from '@/components/CircleCard';
import { CreateCircleModal } from '@/components/CreateCircleModal';
import { CircleDetailModal } from '@/components/CircleDetailModal';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { ProtocolFeatures } from '@/components/ProtocolFeatures';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { CircleData, formatUSDC, formatNGN, formatAddress } from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { Plus, ArrowDown, Users, Check, ArrowRight } from 'lucide-react';

const INITIAL_CIRCLES: CircleData[] = [
  {
    id: 101,
    admin: 'GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BAGGGH',
    token: 'USDC (Stellar Testnet)',
    amount: 50,
    periodSecs: 604800, // 7 days
    maxMembers: 4,
    status: 'Active',
    currentRound: 0,
    members: [
      'GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BAGGGH',
      'GCDK94LVMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BWXYZ',
      'GABC11K7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B1234',
      'GXYZ88JFMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B9876',
    ],
    payoutOrder: [
      'GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BAGGGH',
      'GCDK94LVMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BWXYZ',
      'GABC11K7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B1234',
      'GXYZ88JFMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B9876',
    ],
  },
  {
    id: 102,
    admin: 'GCDK55RTMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BTESTNET',
    token: 'USDC (Stellar Testnet)',
    amount: 100,
    periodSecs: 2592000, // 30 days
    maxMembers: 5,
    status: 'Created',
    currentRound: 0,
    members: [
      'GCDK55RTMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BTESTNET',
      'GDEF33VBMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B5678',
    ],
    payoutOrder: [
      'GCDK55RTMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BTESTNET',
      'GDEF33VBMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B5678',
    ],
  },
  {
    id: 103,
    admin: 'GXYZ99WQMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BSAVINGS',
    token: 'USDC (Stellar Testnet)',
    amount: 25,
    periodSecs: 604800, // 7 days
    maxMembers: 3,
    status: 'Active',
    currentRound: 1,
    members: [
      'GXYZ99WQMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BSAVINGS',
      'GABC11K7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B1234',
      'GHIJ77ZXMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B4321',
    ],
    payoutOrder: [
      'GXYZ99WQMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BSAVINGS',
      'GABC11K7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B1234',
      'GHIJ77ZXMDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5B4321',
    ],
  },
];

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [circles, setCircles] = useState<CircleData[]>(INITIAL_CIRCLES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<CircleData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Created'>('All');
  const [previewTurn, setPreviewTurn] = useState<number>(0);

  const handleCreateSuccess = (newCircle: CircleData) => {
    setCircles([newCircle, ...circles]);
  };

  const handleUpdateCircle = (updated: CircleData) => {
    setCircles(circles.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCircle(updated);
  };

  const filteredCircles = circles.filter((c) => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  const totalValueLocked = circles.reduce(
    (acc, c) => acc + c.amount * c.members.length,
    0
  );

  const activeCount = circles.filter((c) => c.status === 'Active').length;

  const scrollToExplorer = () => {
    const element = document.getElementById('circle-explorer');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // 4-member preview cycle for hero live demonstration
  const sampleMembers = [
    { label: 'Member 1 (Admin)', address: 'GBBD47...GGGH', payoutRound: 0 },
    { label: 'Member 2', address: 'GCDK94...WXYZ', payoutRound: 1 },
    { label: 'Member 3', address: 'GABC11...1234', payoutRound: 2 },
    { label: 'Member 4', address: 'GXYZ88...9876', payoutRound: 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F14] text-[#F8FAFC]">
      <RiskBanner />
      <Navbar onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
              <span>Nigerian ROSCA tradition on Stellar blockchain</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Save together. Collect your turn.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Ajo digitizes traditional community savings (esusu) using Soroban smart contracts. Pool weekly or monthly contributions in USDC to hedge against local currency inflation, with automated disbursements held in non-custodial escrow.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToExplorer}
                className="px-6 py-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#F5BE58] text-black font-semibold text-sm transition shadow-sm flex items-center gap-2"
              >
                <span>Browse circles</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.12] font-semibold text-sm transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start a circle</span>
              </button>
            </div>

            {/* Protocol Metrics */}
            <div className="pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6 text-xs max-w-lg">
              <div>
                <span className="text-slate-400 block mb-1">Pooled escrow</span>
                <span className="text-lg font-bold text-white tabular-nums block">
                  {formatUSDC(totalValueLocked)}
                </span>
                <span className="text-xs text-[#E5A93C] font-medium block mt-0.5">
                  ~ {formatNGN(totalValueLocked)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Active circles</span>
                <span className="text-lg font-bold text-white tabular-nums block">
                  {activeCount}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Across Stellar testnet
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Disbursement</span>
                <span className="text-lg font-bold text-white block">
                  Automated
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Direct to wallet
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Rotation Pass */}
          <div className="lg:col-span-5">
            <div className="bg-[#121821] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs text-slate-400 block">Demonstration</span>
                  <h3 className="text-base font-bold text-white">How a 4-member circle rotates</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">$50 / week</span>
                  <span className="text-xs font-semibold text-[#E5A93C]">$200 total pot</span>
                </div>
              </div>

              {/* Pot Vault */}
              <div className="my-5 p-4 rounded-2xl bg-[#0B0F14] border border-white/[0.08] text-center">
                <span className="text-xs text-slate-400 block">
                  Round {previewTurn + 1} Escrow Vault
                </span>
                <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight block my-1">
                  $200.00 USDC
                </span>
                <span className="text-xs text-[#E5A93C] font-medium block">
                  ~ ₦310,000 NGN
                </span>
              </div>

              {/* Member Rotation List */}
              <div className="space-y-2">
                {sampleMembers.map((m, idx) => {
                  const isRecipient = previewTurn === idx;
                  const isPast = previewTurn > idx;
                  return (
                    <div
                      key={m.label}
                      onClick={() => setPreviewTurn(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isRecipient
                          ? 'bg-[#182333] border-[#E5A93C] text-white shadow-sm'
                          : 'bg-[#0B0F14] border-white/[0.06] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          isRecipient
                            ? 'bg-[#E5A93C] text-black'
                            : isPast
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-white/[0.08] text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className={`font-semibold block ${isRecipient ? 'text-white' : 'text-slate-300'}`}>
                            {m.label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {m.address}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isRecipient ? (
                          <span className="text-[11px] font-bold text-[#E5A93C]">
                            Collects $200 pot
                          </span>
                        ) : isPast ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Payout settled
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Pays $50 round {previewTurn + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rotation Stepper Controls */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Click a member or step through rounds:
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      onClick={() => setPreviewTurn(r)}
                      className={`w-6 h-6 rounded-lg text-xs font-semibold transition ${
                        previewTurn === r
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      {r + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main id="circle-explorer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        {/* Explorer Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Savings circles
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active and open ROSCA circles deployed on Stellar Testnet.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121821] p-1 rounded-xl border border-white/[0.08]">
            {(['All', 'Active', 'Created'] as const).map((tab) => {
              const label = tab === 'All' ? 'All circles' : tab === 'Active' ? 'Active' : 'Open to join';
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === tab
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              onSelect={(c) => setSelectedCircle(c)}
            />
          ))}
        </div>

        {/* Workflow Visualizer */}
        <WorkflowVisualizer />

        {/* Savings Planner Calculator */}
        <SavingsCalculator />

        {/* Protocol Guarantees */}
        <ProtocolFeatures />
      </main>

      {/* Modals */}
      <CreateCircleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />

      <CircleDetailModal
        circle={selectedCircle}
        onClose={() => setSelectedCircle(null)}
        onUpdateCircle={handleUpdateCircle}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#080B0F] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-300">Ajo Protocol &copy; 2026</p>
            <p className="text-slate-400 mt-0.5">Rotating savings and credit automation on Stellar Soroban.</p>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a
              href="/TRUST_ASSUMPTIONS.md"
              className="hover:text-white transition"
            >
              Trust assumptions
            </a>
            <a
              href="/CONTRIBUTING.md"
              className="hover:text-white transition"
            >
              Contributing
            </a>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Stellar.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
