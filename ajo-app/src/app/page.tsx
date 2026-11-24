'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { RiskBanner } from '@/components/RiskBanner';
import { CircleCard } from '@/components/CircleCard';
import { CreateCircleModal } from '@/components/CreateCircleModal';
import { CircleDetailModal } from '@/components/CircleDetailModal';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { ProtocolFeatures } from '@/components/ProtocolFeatures';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { CircleData, formatUSDC, formatNGN } from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { Coins, Users, ShieldCheck, Sparkles, TrendingUp, PlusCircle, ArrowRight, ShieldAlert, Layers, ArrowDown } from 'lucide-react';

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
      'GCDK...WXYZ',
      'GABC...1234',
      'GXYZ...9876',
    ],
    payoutOrder: [
      'GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TW45A6BO5BAGGGH',
      'GCDK...WXYZ',
      'GABC...1234',
      'GXYZ...9876',
    ],
  },
  {
    id: 102,
    admin: 'GCDK55...TESTNET',
    token: 'USDC (Stellar Testnet)',
    amount: 100,
    periodSecs: 2592000, // 30 days
    maxMembers: 5,
    status: 'Created',
    currentRound: 0,
    members: ['GCDK55...TESTNET', 'GDEF...5678'],
    payoutOrder: ['GCDK55...TESTNET', 'GDEF...5678'],
  },
  {
    id: 103,
    admin: 'GXYZ99...SAVINGS',
    token: 'USDC (Stellar Testnet)',
    amount: 25,
    periodSecs: 86400, // 1 day
    maxMembers: 3,
    status: 'Active',
    currentRound: 1,
    members: ['GXYZ99...SAVINGS', 'GABC...1234', 'GHIJ...4321'],
    payoutOrder: ['GXYZ99...SAVINGS', 'GABC...1234', 'GHIJ...4321'],
  },
];

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [circles, setCircles] = useState<CircleData[]>(INITIAL_CIRCLES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<CircleData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Created'>('All');

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

  const scrollToExplorer = () => {
    const element = document.getElementById('circle-explorer');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white selection:text-black font-sans">
      <RiskBanner />
      <Navbar onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Full Viewport First Screen Hero Section */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-black relative">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12">
          
          {/* Left Column: Naira, Dollar & Stablecoins Image Graphic */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden border border-zinc-700 bg-zinc-950 p-2 shadow-2xl group">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black">
                <Image
                  src="/hero-currencies.jpg"
                  alt="Naira, Dollar, and USDC Stablecoin Savings Loop"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>

              {/* Floating Badges overlaying image */}
              <div className="absolute top-6 left-6 bg-black/85 backdrop-blur-md border border-zinc-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-mono font-bold shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>₦ NGN / $ USD / ₮ USDC</span>
              </div>

              <div className="absolute bottom-6 right-6 bg-black/85 backdrop-blur-md border border-zinc-700 text-white text-xs px-4 py-2 rounded-xl font-mono font-bold shadow-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Soroban Escrow</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Headline & Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Rotating Savings Protocol (Ajo / Esusu / ROSCA)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans">
              Decentralized Savings on <span className="underline decoration-zinc-500 underline-offset-8">Stellar</span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Automate community ROSCA savings circles with zero middleman risk. Pool funds in USDC, protect against local inflation, and disburse full round pots on-chain.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToExplorer}
                className="px-8 py-4 rounded-xl bg-white text-black font-extrabold text-sm uppercase tracking-wider hover:bg-zinc-200 shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-sm uppercase tracking-wider transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Circle</span>
              </button>
            </div>

            {/* Protocol Metrics Bar */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Pooled Escrow</span>
                <span className="text-base font-bold text-white block">{formatUSDC(totalValueLocked)}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">~ {formatNGN(totalValueLocked)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Active Circles</span>
                <span className="text-base font-bold text-white">
                  {circles.filter((c) => c.status === 'Active').length}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Settlement</span>
                <span className="text-base font-bold text-white">&lt; 5 seconds</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Main Content Area */}
      <main id="circle-explorer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
              <Layers className="w-6 h-6 text-white" />
              Savings Circles Explorer
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Browse active and open ROSCA circles deployed on Stellar Testnet</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 font-mono">
            {(['All', 'Active', 'Created'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === tab
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
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

        {/* Calculator */}
        <SavingsCalculator />

        {/* Protocol Features */}
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
      <footer className="border-t border-zinc-800 bg-black py-8 text-center text-xs text-zinc-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Ajo Protocol &copy; 2026 &bull; Soroban Smart Contracts on Stellar Testnet</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Contract ID: CB4G...SBLO</span>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Stellar.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
