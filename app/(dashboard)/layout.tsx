'use client';

import Link from 'next/link';
import { BarChart3, FileText, Home, LogOut, Menu, Settings, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/chamados', icon: FileText, label: 'Chamados' },
    { href: '/meus-servicos', icon: BarChart3, label: 'Meus Serviços' },
    { href: '/financeiro', icon: Wallet, label: 'Financeiro' },
    { href: '/perfil', icon: User, label: 'Perfil' },
    { href: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-[#1a1a2e]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative md:translate-x-0 z-50 w-64 bg-[#16213e] border-r border-[#2a2a40] transition-transform duration-300 md:duration-0 h-full flex flex-col`}
        >
          <div className="p-6 border-b border-[#2a2a40]">
            <h1 className="text-xl font-bold text-[#4ecca3]">Casa Segura Pro</h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-3 px-4 py-2 rounded text-gray-300 hover:bg-[#0f3460] hover:text-[#4ecca3] transition"
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#2a2a40]">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-[#16213e] border-b border-[#2a2a40] p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-300 hover:text-[#4ecca3]"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1"></div>
            <div className="text-gray-400 text-sm">
              👋 Bem-vindo, {user?.name || 'Profissional'}
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
