'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hammer } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16213e] border border-[#2a2a40] rounded-lg p-8 shadow-xl">
      <div className="flex justify-center mb-6">
        <div className="bg-[#4ecca3] p-3 rounded-lg">
          <Hammer size={32} className="text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2 text-gray-100">Casa Segura Pro</h1>
      <p className="text-center text-gray-400 mb-6">Plataforma para profissionais</p>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2 bg-[#1a1a2e] border border-[#2a2a40] rounded text-gray-100 placeholder-gray-500 focus:border-[#4ecca3] focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-[#1a1a2e] border border-[#2a2a40] rounded text-gray-100 placeholder-gray-500 focus:border-[#4ecca3] focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4ecca3] hover:bg-[#53d0a3] text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-[#4ecca3] hover:text-[#53d0a3]">
          Cadastre-se aqui
        </Link>
      </p>
    </div>
  );
}
