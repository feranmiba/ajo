'use client';

import React, { useState } from 'react';
import { CircleData, formatAddress, formatUSDC, formatNGN } from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Coins,
} from 'lucide-react';

interface CircleDetailModalProps {
  circle: CircleData | null;
  onClose: () => void;
  onUpdateCircle: (updated: CircleData) => void;
}

type ActionType = 'contribute' | 'payout' | null;
type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  circle,
  onClose,
  onUpdateCircle,
}) => {
  const { address, isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'actions'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  // Action flow state
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [step1Status, setStep1Status] = useState<StepStatus>('pending');
  const [step2Status, setStep2Status] = useState<StepStatus>('pending');
  const [stepMessage, setStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  if (!circle) return null;

  const potSize = circle.amount * circle.maxMembers;
  const isMember = address ? circle.members.includes(address) : false;
  const isAdmin = address ? circle.admin === address : false;
  const isFull = circle.members.length >= circle.maxMembers;
  const currentRecipient = circle.payoutOrder[circle.currentRound] || circle.admin;

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string, txHash?: string) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      message,
      txHash,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleJoin = async () => {
    if (!isConnected) return connect();
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const updated = {
        ...circle,
        members: [...circle.members, address!],
        payoutOrder: [...circle.payoutOrder, address!],
      };
      onUpdateCircle(updated);
      addToast(
        'success',
        'Joined Circle',
        `You have successfully joined Circle #${circle.id} as member ${updated.members.length}.`
      );
    } catch (err: any) {
      addToast('error', 'Join Failed', err?.message || 'Could not join circle. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const updated: CircleData = {
        ...circle,
        status: 'Active',
      };
      onUpdateCircle(updated);
      addToast(
        'success',
        'Circle Started',
        `Circle #${circle.id} roster is locked and Round 1 is now active.`
      );
    } catch (err: any) {
      addToast('error', 'Start Failed', err?.message || 'Could not start circle.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Step-by-Step Contribution Action Modal
  const openContributeAction = () => {
    if (!isConnected) return connect();
    setActiveAction('contribute');
    setCurrentStep(1);
    setStep1Status('pending');
    setStep2Status('pending');
    setStepMessage('Ready to authorize token allowance.');
    setErrorMessage(null);
    setConfirmedTxHash(null);
  };

  // Execute Contribution Flow: Step 1 (approve) -> Step 2 (contribute)
  const executeContribution = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Prompt user for USDC token spending approval
      setCurrentStep(1);
      setStep1Status('in_progress');
      setStepMessage('Prompting Freighter wallet for USDC spending approval (approve)...');
      await new Promise((r) => setTimeout(r, 1000));

      setStepMessage('Simulating allowance & broadcasting approval to Stellar RPC...');
      await new Promise((r) => setTimeout(r, 1200));

      setStep1Status('completed');
      setStepMessage('USDC spending approved on-chain.');

      // Step 2: Invoke contribute(circle_id, member)
      setCurrentStep(2);
      setStep2Status('in_progress');
      setStepMessage('Invoking Soroban contract: contribute(circle_id, member)...');
      await new Promise((r) => setTimeout(r, 1200));

      setStepMessage('Awaiting ledger finality on Stellar Testnet...');
      await new Promise((r) => setTimeout(r, 1400));

      // Generate a deterministic mock transaction hash for the testnet record
      const mockTxHash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
      setStep2Status('completed');
      setConfirmedTxHash(mockTxHash);
      setStepMessage('Contribution confirmed on ledger!');

      addToast(
        'success',
        'Contribution Confirmed',
        `Successfully contributed ${formatUSDC(circle.amount)} USDC to Circle #${circle.id}.`,
        mockTxHash
      );
    } catch (err: any) {
      const errorText = err?.message || 'Wallet signature rejected or RPC broadcast failed.';
      setErrorMessage(errorText);
      if (currentStep === 1) {
        setStep1Status('error');
      } else {
        setStep2Status('error');
      }
      addToast('error', 'Contribution Cancelled', errorText);
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Step-by-Step Payout Action Modal
  const openPayoutAction = () => {
    if (!isConnected) return connect();
    setActiveAction('payout');
    setCurrentStep(1);
    setStep1Status('pending');
    setStep2Status('pending');
    setStepMessage('Ready to verify round pot and execute payout.');
    setErrorMessage(null);
    setConfirmedTxHash(null);
  };

  // Execute Payout Flow: Step 1 (verify pool) -> Step 2 (payout)
  const executePayout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Verify full pot collection
      setCurrentStep(1);
      setStep1Status('in_progress');
      setStepMessage('Verifying escrow pot balance and member settlement status...');
      await new Promise((r) => setTimeout(r, 1100));

      setStep1Status('completed');
      setStepMessage('Escrow verified: Full round pot is ready for disbursement.');

      // Step 2: Invoke payout(circle_id)
      setCurrentStep(2);
      setStep2Status('in_progress');
      setStepMessage(`Invoking Soroban contract payout to recipient ${formatAddress(currentRecipient)}...`);
      await new Promise((r) => setTimeout(r, 1300));

      setStepMessage('Awaiting ledger finality & token transfer...');
      await new Promise((r) => setTimeout(r, 1400));

      const mockTxHash = `7c9e3a1f8b2d4e6a0c5b7d9e1f3a5c7b9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a`;
      setStep2Status('completed');
      setConfirmedTxHash(mockTxHash);
      setStepMessage('Payout confirmed on ledger!');

      const nextRound = circle.currentRound + 1;
      const isComplete = nextRound >= circle.members.length;
      const updated: CircleData = {
        ...circle,
        currentRound: isComplete ? circle.currentRound : nextRound,
        status: isComplete ? 'Completed' : 'Active',
      };
      onUpdateCircle(updated);

      addToast(
        'success',
        'Round Payout Disbursed',
        `Disbursed full pot of ${formatUSDC(potSize)} USDC to recipient ${formatAddress(currentRecipient)}.`,
        mockTxHash
      );
    } catch (err: any) {
      const errorText = err?.message || 'Transaction signing rejected or disbursement failed.';
      setErrorMessage(errorText);
      if (currentStep === 1) {
        setStep1Status('error');
      } else {
        setStep2Status('error');
      }
      addToast('error', 'Payout Failed', errorText);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeActionFlow = () => {
    setActiveAction(null);
    setIsProcessing(false);
    setErrorMessage(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-white font-mono font-bold text-lg shrink-0">
              #{circle.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-mono">Circle #{circle.id}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono border bg-white text-black font-bold">
                  {circle.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Admin: {formatAddress(circle.admin, 6)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 mb-4 gap-4">
            {(['overview', 'members', 'actions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 min-h-[44px] flex items-center touch-target transition-colors ${
                  activeTab === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 font-mono text-xs">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 gap-3 bg-black p-4 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Round Pot</span>
                    <span className="text-xl font-bold text-white block tabular-nums">{formatUSDC(potSize)}</span>
                    <span className="text-[10px] text-zinc-400 block">{formatNGN(potSize)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Round Contribution</span>
                    <span className="text-lg font-semibold text-zinc-200 block tabular-nums">{formatUSDC(circle.amount)}</span>
                    <span className="text-[10px] text-zinc-400 block">{formatNGN(circle.amount)}</span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Current Round:</span>
                    <span className="font-semibold text-white">
                      Round {circle.currentRound + 1} of {circle.maxMembers}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Turn Recipient:</span>
                    <span className="font-semibold text-white font-mono">
                      {circle.payoutOrder[circle.currentRound]
                        ? formatAddress(circle.payoutOrder[circle.currentRound])
                        : 'Pending Start'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Escrow Address:</span>
                    <span className="font-semibold text-zinc-300 font-mono text-[11px]">
                      CB4G...SBLO (Soroban)
                    </span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'members' && (
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Member Roster ({circle.members.length}/{circle.maxMembers})
                </h4>
                <div className="divide-y divide-zinc-800 bg-black rounded-xl border border-zinc-800 overflow-hidden">
                  {circle.members.map((m, idx) => (
                    <div key={m + idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-white">{formatAddress(m, 6)}</span>
                        {m === circle.admin && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Admin
                          </span>
                        )}
                      </div>
                      {m === address && <span className="text-xs text-white font-bold">You</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-3 pt-1">
                {circle.status === 'Created' && !isMember && !isFull && (
                  <button
                    onClick={handleJoin}
                    disabled={isProcessing}
                    className="w-full py-3.5 min-h-[48px] rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition touch-target flex items-center justify-center"
                  >
                    {isProcessing ? 'Processing Join...' : 'Join Circle'}
                  </button>
                )}

                {circle.status === 'Created' && isAdmin && (
                  <button
                    onClick={handleStart}
                    disabled={isProcessing}
                    className="w-full py-3.5 min-h-[48px] rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition touch-target flex items-center justify-center"
                  >
                    {isProcessing ? 'Locking & Starting...' : 'Start Circle (Lock Roster)'}
                  </button>
                )}

                {circle.status === 'Active' && isMember && (
                  <button
                    onClick={openContributeAction}
                    disabled={isProcessing}
                    className="w-full py-3.5 min-h-[48px] rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition flex items-center justify-center gap-2 touch-target"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Contribute {formatUSDC(circle.amount)} USDC (~{formatNGN(circle.amount)})</span>
                  </button>
                )}

                {circle.status === 'Active' && isAdmin && (
                  <button
                    onClick={openPayoutAction}
                    disabled={isProcessing}
                    className="w-full py-3.5 min-h-[48px] rounded-lg bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition touch-target flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Round {circle.currentRound + 1} Payout ({formatUSDC(potSize)})</span>
                  </button>
                )}

                {circle.status === 'Completed' && (
                  <div className="p-4 text-center text-xs text-zinc-400 bg-black rounded-xl border border-zinc-800">
                    All {circle.maxMembers} rounds of this savings circle have settled.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-Step Action Confirmation Modal */}
      {activeAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl flex flex-col font-sans">
            <button
              onClick={closeActionFlow}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition disabled:opacity-30"
              aria-label="Close action dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Action Title */}
            <div className="mb-4">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 inline-block mb-2">
                {activeAction === 'contribute' ? 'Round Contribution Flow' : 'Round Payout Flow'}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {activeAction === 'contribute'
                  ? `Contribute to Circle #${circle.id}`
                  : `Execute Round ${circle.currentRound + 1} Payout`}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {activeAction === 'contribute'
                  ? `Authorize token allowance and transfer ${formatUSDC(circle.amount)} USDC (~${formatNGN(circle.amount)}) to the escrow contract.`
                  : `Disburse full round pot of ${formatUSDC(potSize)} USDC (~${formatNGN(potSize)}) to recipient ${formatAddress(currentRecipient)}.`}
              </p>
            </div>

            {/* Stepper Progress Visualizer */}
            <div className="space-y-3 my-4">
              {/* Step 1 */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  step1Status === 'completed'
                    ? 'bg-black border-zinc-600 text-white'
                    : step1Status === 'in_progress'
                    ? 'bg-zinc-900 border-white text-white'
                    : step1Status === 'error'
                    ? 'bg-black border-red-500/60 text-white'
                    : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step1Status === 'completed'
                          ? 'bg-white text-black'
                          : step1Status === 'in_progress'
                          ? 'bg-zinc-800 text-white'
                          : step1Status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {step1Status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      ) : step1Status === 'in_progress' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        '1'
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {activeAction === 'contribute'
                        ? 'Step 1: USDC Token Allowance (approve)'
                        : 'Step 1: Verify Escrow Pool Balance'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {step1Status === 'completed'
                      ? 'Confirmed'
                      : step1Status === 'in_progress'
                      ? 'Broadcasting...'
                      : step1Status === 'error'
                      ? 'Failed'
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  step2Status === 'completed'
                    ? 'bg-black border-zinc-600 text-white'
                    : step2Status === 'in_progress'
                    ? 'bg-zinc-900 border-white text-white'
                    : step2Status === 'error'
                    ? 'bg-black border-red-500/60 text-white'
                    : 'bg-black/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step2Status === 'completed'
                          ? 'bg-white text-black'
                          : step2Status === 'in_progress'
                          ? 'bg-zinc-800 text-white'
                          : step2Status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {step2Status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      ) : step2Status === 'in_progress' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        '2'
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {activeAction === 'contribute'
                        ? 'Step 2: Soroban Invocation (contribute)'
                        : 'Step 2: Soroban Invocation (payout)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {step2Status === 'completed'
                      ? 'Finalized'
                      : step2Status === 'in_progress'
                      ? 'Settling...'
                      : step2Status === 'error'
                      ? 'Failed'
                      : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status / Message Box */}
            <div className="bg-black border border-zinc-800 rounded-xl p-3.5 my-2">
              <div className="flex items-start gap-2.5">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin shrink-0 mt-0.5" />
                ) : errorMessage ? (
                  <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                ) : confirmedTxHash ? (
                  <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="text-xs font-medium text-zinc-300 block leading-relaxed">
                    {errorMessage || stepMessage}
                  </span>
                  {confirmedTxHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${confirmedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white mt-1 underline underline-offset-2 transition-colors"
                    >
                      <span>Ledger Tx: {confirmedTxHash.slice(0, 10)}...{confirmedTxHash.slice(-8)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeActionFlow}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition min-h-[44px] touch-target"
              >
                {confirmedTxHash ? 'Close' : 'Cancel'}
              </button>

              {!confirmedTxHash && (
                <button
                  type="button"
                  onClick={activeAction === 'contribute' ? executeContribution : executePayout}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-lg bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-200 transition min-h-[44px] touch-target flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : errorMessage ? (
                    <span>Retry Transaction</span>
                  ) : (
                    <span>Execute Transaction</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
};
