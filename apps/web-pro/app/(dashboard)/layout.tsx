'use client';

import Link from 'next/link';
import { BarChart3, FileText, Home, LogOut, Menu, Settings, User, Wallet } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/chamados', icon: FileText, label: 'Chamados' },
    { href: '/dashboard/meus-servicos', icon: BarChart3, label: 'Meus Serviços' },
    { href: '/dashboard/financeiro', icon: Wallet, label: 'Financeiro' },
    { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
    { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-pro-primary">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-50 w-64 bg-pro-secondary border-r border-pro-border transition-transform duration-300 md:duration-0 h-full flex flex-col`}
      >
        <div className="p-6 border-b border-pro-border">
          <h1 className="text-xl font-bold text-pro-highlight">Casa Segura Pro</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center space-x-3 px-4 py-2 rounded text-pro-text hover:bg-pro-accent hover:text-pro-highlight transition"
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-pro-border">
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded text-pro-text hover:bg-red-900/20 hover:text-red-400 transition">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-pro-secondary border-b border-pro-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-pro-text hover:text-pro-highlight"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1"></div>
          <div className="text-pro-text-secondary text-sm">
            👋 Bem-vindo, Profissional
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
