'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { creditsApi } from '@/lib/api';
import { Coins, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function CreditsBadge() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [balanceFormatted, setBalanceFormatted] = useState('R$ 0,00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();

    // Atualiza a cada 30 segundos
    const interval = setInterval(loadBalance, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const loadBalance = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await creditsApi.getBalance(token);
      setBalance(data.balance);
      setBalanceFormatted(data.balance_formatted);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || loading) {
    return null;
  }

  if (balance === 0) {
    // Se não tem créditos, mostra link para convite de amigos
    return (
      <Link
        href="/convide-amigos"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
      >
        <Coins className="w-4 h-4" />
        <span className="text-sm font-medium">Ganhe R$ 100!</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/convide-amigos"
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
    >
      <Coins className="w-4 h-4" />
      <span className="text-sm font-medium">{balanceFormatted}</span>
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}
