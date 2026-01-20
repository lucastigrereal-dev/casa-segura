'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { jobsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  XCircle,
  Truck,
  CreditCard,
  Shield,
  AlertTriangle,
  Play,
  ThumbsUp,
} from 'lucide-react';

// Tipos
interface Job {
  id: string;
  code: string;
  status: string;
  price_estimated: number;
  price_final?: number;
  scheduled_date?: string;
  scheduled_window?: string;
  created_at: string;
  completed_at?: string;
  mission: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  address: {
    id: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
  pro?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

// Configuração de status
const statusConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  CREATED: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Aguardando orçamento',
  },
  QUOTED: {
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Orçamento recebido',
  },
  PENDING_PAYMENT: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Aguardando pagamento',
  },
  PAID: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Pagamento confirmado',
  },
  ASSIGNED: {
    icon: Truck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    label: 'Profissional designado',
  },
  PRO_ACCEPTED: {
    icon: ThumbsUp,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    label: 'Profissional aceitou',
  },
  PRO_ON_WAY: {
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Profissional a caminho',
  },
  IN_PROGRESS: {
    icon: Play,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Em andamento',
  },
  PENDING_APPROVAL: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Aguardando aprovação',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Concluído',
  },
  IN_GUARANTEE: {
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Em garantia',
  },
  CLOSED: {
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Fechado',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Cancelado',
  },
  DISPUTED: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Em disputa',
  },
};

// Filtros de status
const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'cancelled', label: 'Cancelados' },
];

const activeStatuses = ['CREATED', 'QUOTED', 'PENDING_PAYMENT', 'PAID', 'ASSIGNED', 'PRO_ACCEPTED', 'PRO_ON_WAY', 'IN_PROGRESS', 'PENDING_APPROVAL', 'IN_GUARANTEE'];
const completedStatuses = ['COMPLETED', 'CLOSED'];
const cancelledStatuses = ['CANCELLED', 'DISPUTED'];

export default function MeusChamadosPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.warning('Atenção', 'Você precisa estar logado para ver seus chamados');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar chamados
  const loadJobs = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await jobsApi.list(token) as Job[];
      // Ordenar por data de criação (mais recentes primeiro)
      const sortedJobs = data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setJobs(sortedJobs);
      applyFilter(activeFilter, sortedJobs);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error('Erro', 'Não foi possível carregar seus chamados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadJobs();
    }
  }, [token]);

  // Aplicar filtro
  const applyFilter = (filter: string, jobsList: Job[] = jobs) => {
    setActiveFilter(filter);

    switch (filter) {
      case 'active':
        setFilteredJobs(jobsList.filter(j => activeStatuses.includes(j.status)));
        break;
      case 'completed':
        setFilteredJobs(jobsList.filter(j => completedStatuses.includes(j.status)));
        break;
      case 'cancelled':
        setFilteredJobs(jobsList.filter(j => cancelledStatuses.includes(j.status)));
        break;
      default:
        setFilteredJobs(jobsList);
    }
  };

  // Formatar janela de horário
  const formatTimeWindow = (window?: string) => {
    const windows: Record<string, string> = {
      manha: 'Manhã',
      tarde: 'Tarde',
      noite: 'Noite',
      flexivel: 'Flexível',
    };
    return window ? windows[window] || window : '';
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Meus Chamados</h1>
            <p className="text-gray-500 text-sm mt-1">
              {jobs.length} chamado{jobs.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadJobs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Link href="/novo-chamado">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chamado
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => applyFilter(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {filter.value === 'all' && ` (${jobs.length})`}
              {filter.value === 'active' && ` (${jobs.filter(j => activeStatuses.includes(j.status)).length})`}
              {filter.value === 'completed' && ` (${jobs.filter(j => completedStatuses.includes(j.status)).length})`}
              {filter.value === 'cancelled' && ` (${jobs.filter(j => cancelledStatuses.includes(j.status)).length})`}
            </button>
          ))}
        </div>

        {/* Lista de Chamados */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            {jobs.length === 0 ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhum chamado ainda</h3>
                <p className="text-gray-500 mb-6">
                  Você ainda não solicitou nenhum serviço
                </p>
                <Link href="/novo-chamado">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Chamado
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-500">
                  Nenhum chamado encontrado com o filtro selecionado
                </p>
                <button
                  onClick={() => applyFilter('all')}
                  className="text-primary-600 hover:underline mt-2"
                >
                  Ver todos os chamados
                </button>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const status = statusConfig[job.status] || statusConfig.CREATED;
              const StatusIcon = status.icon;

              return (
                <Link key={job.id} href={`/chamado/${job.id}`}>
                  <Card className="p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`p-2.5 rounded-lg ${status.bgColor} flex-shrink-0`}>
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-gray-500">{job.code}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(job.created_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg truncate">
                          {job.mission.name}
                        </h3>

                        {/* Category */}
                        <p className="text-sm text-gray-500 mb-2">
                          {job.mission.category.name}
                        </p>

                        {/* Info Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.address.street}, {job.address.number} - {job.address.neighborhood}
                          </span>

                          {job.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(job.scheduled_date)}
                              {job.scheduled_window && ` (${formatTimeWindow(job.scheduled_window)})`}
                            </span>
                          )}
                        </div>

                        {/* Professional */}
                        {job.pro && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Profissional: </span>
                            <span className="font-medium">{job.pro.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Side */}
                      <div className="text-right flex-shrink-0">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </div>

                        {/* Price */}
                        <p className="text-lg font-bold mt-2">
                          {formatCurrency(job.price_final || job.price_estimated)}
                        </p>
                        {job.price_final && job.price_final !== job.price_estimated && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(job.price_estimated)}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-gray-300 self-center flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {jobs.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">
                {jobs.filter(j => activeStatuses.includes(j.status)).length}
              </p>
              <p className="text-sm text-gray-500">Em andamento</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(j => completedStatuses.includes(j.status)).length}
              </p>
              <p className="text-sm text-gray-500">Concluídos</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {formatCurrency(
                  jobs
                    .filter(j => completedStatuses.includes(j.status))
                    .reduce((sum, j) => sum + (j.price_final || j.price_estimated), 0)
                )}
              </p>
              <p className="text-sm text-gray-500">Total gasto</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {jobs.filter(j => j.status === 'PENDING_PAYMENT').length}
              </p>
              <p className="text-sm text-gray-500">Aguardando pgto</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
