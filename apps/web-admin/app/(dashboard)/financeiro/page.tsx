'use client';

import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';

export default function FinanceiroAdminPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, [selectedStatus]);

  const loadWithdrawals = async () => {
    try {
      const params: any = { skip: 0, take: 50 };
      if (selectedStatus) params.status = selectedStatus;

      const data = await paymentsApi.listWithdrawals(params);
      setWithdrawals(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar saques');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Deseja aprovar este saque?')) return;

    setSubmitting(true);
    setError('');

    try {
      await paymentsApi.approveWithdrawal(withdrawalId, { approve: true });
      await loadWithdrawals();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar saque');
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    setSubmitting(true);
    setError('');

    try {
      await paymentsApi.approveWithdrawal(selectedWithdrawal.id, {
        approve: false,
        rejection_reason: rejectionReason,
      });
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      await loadWithdrawals();
    } catch (err: any) {
      setError(err.message || 'Erro ao rejeitar saque');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      APPROVED: { color: 'bg-blue-100 text-blue-800', label: 'Aprovado' },
      PROCESSING: { color: 'bg-purple-100 text-purple-800', label: 'Processando' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      FAILED: { color: 'bg-gray-100 text-gray-800', label: 'Falhou' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestão Financeira</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="PROCESSING">Processando</option>
            <option value="COMPLETED">Concluído</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="FAILED">Falhou</option>
          </select>
        </div>
      </div>

      {/* Tabela de Saques */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Solicitações de Saque</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Profissional</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Valor</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Chave PIX</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Data Solicitação</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Nenhum saque encontrado
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {w.professional?.user?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {w.professional?.user?.email || ''}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      R$ {(w.amount / 100).toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-mono">
                      {w.pix_key}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(w.requested_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(w.requested_at).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(w.status)}
                    </td>
                    <td className="p-4">
                      {w.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(w.id)}
                            disabled={submitting}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => openRejectModal(w)}
                            disabled={submitting}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                      {w.status === 'REJECTED' && w.rejection_reason && (
                        <div className="text-xs text-red-600">
                          Motivo: {w.rejection_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Rejeição */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rejeitar Saque</h2>
            <form onSubmit={handleReject}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Profissional: <strong>{selectedWithdrawal.professional?.user?.name}</strong>
                  <br />
                  Valor: <strong>R$ {(selectedWithdrawal.amount / 100).toFixed(2)}</strong>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Rejeição *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedWithdrawal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? 'Rejeitando...' : 'Confirmar Rejeição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
