'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { referralsApi } from '@/lib/api';
import { Share2, Copy, CheckCircle2, Gift, Users, TrendingUp, MessageCircle } from 'lucide-react';

interface ReferralStats {
  code: string;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_earned: number;
  next_milestone: {
    count: number;
    remaining: number;
    bonus: number;
    message: string;
  } | null;
  referrals: Array<{
    id: string;
    referred_name: string;
    referred_email: string;
    status: string;
    bonus_amount: number;
    created_at: string;
    completed_at: string | null;
  }>;
}

export default function ConvideAmigosPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!token) return;

    try {
      const data = await referralsApi.getMyStats(token);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!stats) return;

    await navigator.clipboard.writeText(stats.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `🏠 Opa! Descobri um app INCRÍVEL pra achar profissionais!\n\nCasa Segura - elétrica, hidráulica, reforma, etc.\n\nUsa meu código: ${stats?.code}\nA gente GANHA R$ 50 cada! 💰\n\nDownload: ${window.location.origin}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ganhe R$ 100 por amigo!
          </h1>
          <p className="text-gray-600">
            Convide amigos e ambos ganham R$ 50 no cadastro + R$ 50 no 1º job!
          </p>
        </div>

        {/* Código de Indicação */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 mb-6 text-white">
          <p className="text-sm font-medium mb-2 opacity-90">Seu código de indicação:</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 rounded-lg px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold tracking-wider">{stats.code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-white text-blue-600 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar
                </>
              )}
            </button>
          </div>

          {/* Botões de Compartilhamento */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={handleShareFacebook}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Facebook
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total_referrals}</p>
                <p className="text-sm text-gray-600">Indicações</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {stats.completed_referrals} completadas, {stats.pending_referrals} pendentes
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_earned)}
                </p>
                <p className="text-sm text-gray-600">Ganhos</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Total acumulado em créditos</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.next_milestone ? stats.next_milestone.remaining : '🎉'}
                </p>
                <p className="text-sm text-gray-600">
                  {stats.next_milestone ? 'Próximo bônus' : 'Completou!'}
                </p>
              </div>
            </div>
            {stats.next_milestone && (
              <p className="text-xs text-gray-500">
                Faltam {stats.next_milestone.remaining} para {formatCurrency(stats.next_milestone.bonus)}!
              </p>
            )}
          </div>
        </div>

        {/* Próximo Marco */}
        {stats.next_milestone && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6 text-white">
            <h3 className="font-bold text-lg mb-2">🎯 Próximo Marco</h3>
            <p className="text-white/90 mb-3">
              {stats.next_milestone.message.replace('{remaining}', stats.next_milestone.remaining.toString())}
            </p>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((stats.next_milestone.count - stats.next_milestone.remaining) / stats.next_milestone.count) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Lista de Indicações */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Suas Indicações</h3>
          </div>

          {stats.referrals.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Nenhuma indicação ainda</p>
              <p className="text-sm text-gray-500">Compartilhe seu código e comece a ganhar!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.referrals.map((referral) => (
                <div key={referral.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{referral.referred_name}</p>
                      <p className="text-sm text-gray-600">{referral.referred_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cadastro: {formatDate(referral.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {referral.status === 'COMPLETED' ? (
                        <>
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Completo
                          </div>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(referral.bonus_amount * 2)}
                          </p>
                          <p className="text-xs text-gray-500">R$ 50 + R$ 50 bônus</p>
                        </>
                      ) : (
                        <>
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-1">
                            Pendente
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(referral.bonus_amount)}
                          </p>
                          <p className="text-xs text-gray-500">Aguardando 1º job</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Como Funciona */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">📋 Como funciona?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Compartilhe seu código</p>
                <p className="text-sm text-gray-600">
                  Envie para amigos via WhatsApp, Facebook ou copie o link
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Amigo se cadastra</p>
                <p className="text-sm text-gray-600">
                  Vocês dois ganham R$ 50 de crédito imediatamente!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Amigo completa 1º job</p>
                <p className="text-sm text-gray-600">
                  Você ganha MAIS R$ 50 de bônus! Total: R$ 100 por amigo
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-2">🏆 Bônus Especiais:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5 indicações completas = <strong>R$ 1.000</strong> + Badge Ouro</li>
              <li>
                • 10 indicações completas = <strong>R$ 2.500</strong> + 0% comissão por 30 dias!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
