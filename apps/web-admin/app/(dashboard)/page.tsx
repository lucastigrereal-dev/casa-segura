'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/layout/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Wrench, FileText, DollarSign, TrendingUp, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { usersApi, professionalsApi, jobsApi, Job, PaginatedResponse } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalProfessionals: number;
  pendingJobs: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProfessionals: 0,
    pendingJobs: 0,
    totalRevenue: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data in parallel
        const [usersRes, professionalsRes, jobsRes] = await Promise.all([
          usersApi.list({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
          professionalsApi.list({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
          jobsApi.list({ limit: 5 }).catch(() => ({ data: [], meta: { total: 0 } })),
        ]);

        setStats({
          totalUsers: (usersRes as PaginatedResponse<unknown>).meta?.total || 0,
          totalProfessionals: (professionalsRes as PaginatedResponse<unknown>).meta?.total || 0,
          pendingJobs: (jobsRes as PaginatedResponse<unknown>).meta?.total || 0,
          totalRevenue: 45231, // This would come from a real endpoint
        });

        setRecentJobs((jobsRes as PaginatedResponse<Job>).data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statsCards = [
    { title: 'Total de Usuarios', value: stats.totalUsers.toLocaleString('pt-BR'), change: '+12%', icon: Users },
    { title: 'Profissionais Ativos', value: stats.totalProfessionals.toLocaleString('pt-BR'), change: '+5%', icon: Wrench },
    { title: 'Chamados', value: stats.pendingJobs.toLocaleString('pt-BR'), change: '+18%', icon: FileText },
    { title: 'Receita do Mes', value: formatCurrency(stats.totalRevenue), change: '+25%', icon: DollarSign },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visao geral do sistema</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visao geral do sistema</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Verifique se o servidor da API esta rodando em http://localhost:3333
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Chamados Recentes
            </CardTitle>
            <Link href="/chamados">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum chamado encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.code} - {job.client?.name || 'Cliente'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Conclusao</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2" style={{ width: '94%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Satisfacao do Cliente</span>
                <span className="font-medium">4.8/5.0</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 rounded-full h-2" style={{ width: '96%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tempo Medio de Resposta</span>
                <span className="font-medium">2.5 horas</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-yellow-500 rounded-full h-2" style={{ width: '75%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
