'use client';

import { BarChart3, Clock, DollarSign, Star, TrendingUp, FileText } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Ganhos do Mês', value: 'R$ 1.240,00', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { label: 'Ganhos da Semana', value: 'R$ 320,00', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
    { label: 'Chamados Pendentes', value: '3', icon: FileText, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Taxa de Aceite', value: '85%', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { label: 'Avaliação Média', value: '4.8 ⭐', icon: Star, color: 'from-pink-500 to-pink-600' },
    { label: 'Total de Serviços', value: '127', icon: Clock, color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pro-text mb-2">Dashboard</h1>
        <p className="text-pro-text-secondary">Bem-vindo à sua área profissional</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-pro-secondary border border-pro-border rounded-lg p-6 hover:border-pro-highlight transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg group-hover:scale-110 transition`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-pro-text-secondary text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-pro-highlight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-pro-text mb-4">Últimos Chamados</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-pro-primary rounded border border-pro-border hover:border-pro-highlight transition cursor-pointer">
                <p className="text-pro-text font-medium">CS-2024-{i.toString().padStart(4, '0')}</p>
                <p className="text-pro-text-secondary text-sm">Instalação de Luminária</p>
                <p className="text-pro-highlight text-sm mt-1">📍 3.2 km de distância</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-pro-secondary border border-pro-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-pro-text mb-4">Status Geral</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-pro-text">Disponibilidade</span>
                <span className="text-pro-highlight">✓ Ativo</span>
              </div>
              <div className="w-full bg-pro-primary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-pro-text">Raio de Atuação</span>
                <span className="text-pro-text-secondary">20 km</span>
              </div>
              <div className="w-full bg-pro-primary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-pro-text">Perfil Completo</span>
                <span className="text-pro-highlight">95%</span>
              </div>
              <div className="w-full bg-pro-primary rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
