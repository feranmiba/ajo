import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

export const metadata: Metadata = {
  title: 'Ajo | Community Rotating Savings on Stellar',
  description: 'Automated rotating savings and credit circles (Ajo / Esusu) on Stellar using Soroban smart contracts and USDC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#0B0F14] text-[#F8FAFC]">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
