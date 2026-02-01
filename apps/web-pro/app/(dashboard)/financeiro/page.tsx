'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { paymentsApi } from '@/lib/api';
import { WITHDRAWAL_STATUS_LABELS, WITHDRAWAL_STATUS_COLORS, TRANSACTION_TYPE_LABELS } from '@casa-segura/shared';

export default function FinanceiroPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const [statsData, transData, withData] = await Promise.all([
        paymentsApi.getFinancialStats(token!),
        paymentsApi.getMyTransactions(token!, 0, 10),
        paymentsApi.listWithdrawals(token!, 0, 5),
      ]);

      setStats(statsData);
      setTransactions(transData.data || []);
      setWithdrawals(withData.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const amountCents = Math.floor(parseFloat(withdrawalAmount) * 100);

      if (amountCents < 5000) {
        setError('Valor mínimo de saque: R$ 50,00');
        return;
      }

      if (amountCents > stats.available) {
        setError('Saldo insuficiente');
        return;
      }

      await paymentsApi.createWithdrawal(token!, {
        amount: amountCents,
        pix_key: pixKey,
      });

      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      setPixKey('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar saque');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pro-highlight mx-auto"></div>
          <p className="mt-4 text-pro-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-pro-text mb-6">Financeiro</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <div className="text-sm text-pro-text-secondary mb-2">Saldo Disponível</div>
          <div className="text-3xl font-bold text-pro-highlight">
            R$ {((stats?.available || 0) / 100).toFixed(2)}
          </div>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="mt-4 text-sm text-pro-highlight hover:underline"
          >
            Solicitar Saque
          </button>
        </div>

        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <div className="text-sm text-pro-text-secondary mb-2">Em Garantia</div>
          <div className="text-3xl font-bold text-yellow-400">
            R$ {((stats?.held || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <div className="text-sm text-pro-text-secondary mb-2">Total Ganho</div>
          <div className="text-3xl font-bold text-blue-400">
            R$ {((stats?.total_earned || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <div className="text-sm text-pro-text-secondary mb-2">Total Sacado</div>
          <div className="text-3xl font-bold text-pro-text">
            R$ {((stats?.total_withdrawn || 0) / 100).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-pro-secondary border border-pro-border rounded-lg mb-6">
        <div className="p-6 border-b border-pro-border">
          <h2 className="text-xl font-semibold text-pro-text">Transações Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pro-accent">
              <tr>
                <th className="text-left p-4 text-pro-text">Data</th>
                <th className="text-left p-4 text-pro-text">Tipo</th>
                <th className="text-left p-4 text-pro-text">Descrição</th>
                <th className="text-right p-4 text-pro-text">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-pro-text-secondary">
                    Nenhuma transação
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-t border-pro-border">
                    <td className="p-4 text-pro-text-secondary">
                      {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-pro-text">{TRANSACTION_TYPE_LABELS[t.type]}</td>
                    <td className="p-4 text-pro-text-secondary">{t.description}</td>
                    <td className={`p-4 text-right font-medium ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {t.amount > 0 ? '+' : ''}R$ {(t.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-pro-secondary border border-pro-border rounded-lg">
        <div className="p-6 border-b border-pro-border">
          <h2 className="text-xl font-semibold text-pro-text">Saques</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pro-accent">
              <tr>
                <th className="text-left p-4 text-pro-text">Data</th>
                <th className="text-left p-4 text-pro-text">Valor</th>
                <th className="text-left p-4 text-pro-text">PIX</th>
                <th className="text-left p-4 text-pro-text">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-pro-text-secondary">
                    Nenhum saque
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-pro-border">
                    <td className="p-4 text-pro-text-secondary">
                      {new Date(w.requested_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-pro-text font-medium">R$ {(w.amount / 100).toFixed(2)}</td>
                    <td className="p-4 text-pro-text-secondary">{w.pix_key}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${WITHDRAWAL_STATUS_COLORS[w.status]}`}>
                        {WITHDRAWAL_STATUS_LABELS[w.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-pro-secondary border border-pro-border rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-pro-text mb-4">Solicitar Saque</h2>
            <form onSubmit={handleWithdrawal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-pro-text mb-2">Valor (mínimo R$ 50,00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full bg-pro-accent border border-pro-border rounded-lg p-2 text-pro-text"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-pro-text mb-2">Chave PIX</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Email, telefone ou CPF"
                  className="w-full bg-pro-accent border border-pro-border rounded-lg p-2 text-pro-text"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-300 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 border border-pro-border text-pro-text py-2 rounded-lg hover:bg-pro-accent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pro-highlight text-white py-2 rounded-lg hover:bg-pro-highlight-hover"
                  disabled={submitting}
                >
                  {submitting ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
