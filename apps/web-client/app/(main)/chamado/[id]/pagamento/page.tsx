'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi, paymentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [installments, setInstallments] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadJob();
    }
  }, [token]);

  const loadJob = async () => {
    try {
      const data = await jobsApi.getById(params.id as string, token!);
      setJob(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const paymentData = await paymentsApi.create(
        {
          job_id: job.id,
          method: selectedMethod,
          installments: selectedMethod === 'CREDIT_CARD' ? installments : undefined,
        },
        token!
      );

      setPayment(paymentData);

      // If credit card, redirect to success (mock approval)
      if (selectedMethod === 'CREDIT_CARD') {
        setTimeout(() => {
          router.push(`/chamado/${job.id}?payment=success`);
        }, 2000);
      }
      // If PIX, stay on page to show QR code
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
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

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Job não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link href={`/chamado/${job.id}`} className="text-blue-600 hover:underline">
          ← Voltar para o chamado
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Pagamento</h1>

      {/* Resumo do Pedido */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Serviço:</span>
            <span className="font-medium">{job.mission?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Código:</span>
            <span className="font-mono text-sm">{job.code}</span>
          </div>
          {job.pro && (
            <div className="flex justify-between">
              <span className="text-gray-600">Profissional:</span>
              <span className="font-medium">{job.pro.name}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total:</span>
            <span className="text-green-600">R$ {((job.price_final || 0) / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formulário de Pagamento */}
      {!payment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>

          <div className="space-y-4 mb-6">
            {/* PIX */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment-method"
                value="PIX"
                checked={selectedMethod === 'PIX'}
                onChange={(e) => setSelectedMethod(e.target.value as 'PIX')}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-lg">PIX</div>
                <div className="text-sm text-gray-500">Pagamento instantâneo via QR Code</div>
              </div>
              <div className="text-green-600 font-bold">Aprovação imediata</div>
            </label>

            {/* Cartão de Crédito */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment-method"
                value="CREDIT_CARD"
                checked={selectedMethod === 'CREDIT_CARD'}
                onChange={(e) => setSelectedMethod(e.target.value as 'CREDIT_CARD')}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-lg">Cartão de Crédito</div>
                <div className="text-sm text-gray-500">Parcele em até 12x sem juros</div>
              </div>
            </label>
          </div>

          {/* Seletor de Parcelas (apenas para cartão) */}
          {selectedMethod === 'CREDIT_CARD' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Número de Parcelas</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
                  const installmentValue = (job.price_final || 0) / n / 100;
                  return (
                    <option key={n} value={n}>
                      {n}x de R$ {installmentValue.toFixed(2)}
                      {n === 1 ? ' à vista' : ' sem juros'}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
              <p className="font-medium">Erro ao processar pagamento</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Botão de Confirmação */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              'Confirmar Pagamento'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Ao confirmar, você concorda com os termos de serviço da Casa Segura
          </p>
        </div>
      )}

      {/* Tela de PIX QR Code */}
      {payment && selectedMethod === 'PIX' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Pagamento via PIX</h2>
            <p className="text-gray-600">Escaneie o QR Code abaixo ou copie o código</p>
          </div>

          {payment.qr_code_base64 && (
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={`data:image/png;base64,${payment.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            </div>
          )}

          {payment.qr_code && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX Copia e Cola:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payment.qr_code}
                  readOnly
                  className="w-full p-3 pr-24 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(payment.qr_code);
                    alert('Código PIX copiado!');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {payment.expires_at && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Este código PIX expira em{' '}
                {new Date(payment.expires_at).toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Como pagar:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento de R$ {((job.price_final || 0) / 100).toFixed(2)}</li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={`/chamado/${job.id}`}
              className="text-blue-600 hover:underline"
            >
              Voltar para o chamado
            </Link>
          </div>
        </div>
      )}

      {/* Tela de Sucesso (Cartão) */}
      {payment && selectedMethod === 'CREDIT_CARD' && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Pagamento Aprovado!</h2>
          <p className="text-gray-600 mb-6">
            Seu pagamento foi processado com sucesso.
            <br />
            Redirecionando...
          </p>
        </div>
      )}
    </div>
  );
}
