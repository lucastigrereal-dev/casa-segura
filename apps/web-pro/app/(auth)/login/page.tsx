'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hammer } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement login
      console.log('Login:', { email, password });
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pro-secondary border border-pro-border rounded-lg p-8 shadow-xl">
      <div className="flex justify-center mb-6">
        <div className="bg-pro-highlight p-3 rounded-lg">
          <Hammer size={32} className="text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2 text-pro-text">Casa Segura Pro</h1>
      <p className="text-center text-pro-text-secondary mb-6">Plataforma para profissionais</p>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-pro-text mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2 bg-pro-primary border border-pro-border rounded text-pro-text placeholder-pro-text-secondary focus:border-pro-highlight focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pro-text mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-pro-primary border border-pro-border rounded text-pro-text placeholder-pro-text-secondary focus:border-pro-highlight focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pro-highlight hover:bg-pro-highlight-hover text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-pro-text-secondary text-sm mt-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-pro-highlight hover:text-pro-highlight-hover">
          Cadastre-se aqui
        </Link>
      </p>
    </div>
  );
}
