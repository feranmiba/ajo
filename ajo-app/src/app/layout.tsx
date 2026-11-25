import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

export const metadata: Metadata = {
  title: 'Ajo Protocol | Decentralized Rotating Savings on Stellar',
  description: 'Automated ROSCA savings circles using Soroban smart contracts & USDC on Stellar blockchain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#050505] text-white">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
