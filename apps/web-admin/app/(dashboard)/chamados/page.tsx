'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { jobsApi, Job } from '@/lib/api';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';

const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'QUOTED', label: 'Orcado' },
  { value: 'ACCEPTED', label: 'Aceito' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluido' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export default function ChamadosPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await jobsApi.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setJobs(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chamados');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleOpenStatusChange = (job: Job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsStatusOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedJob || !newStatus) return;
    try {
      setIsSaving(true);
      await jobsApi.updateStatus(selectedJob.id, newStatus);
      setIsStatusOpen(false);
      loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Codigo', accessor: 'code' as const },
    { header: 'Servico', accessor: 'title' as const },
    {
      header: 'Cliente',
      accessor: 'client' as const,
      cell: (_: unknown, row: Job) => row.client?.name || '-',
    },
    {
      header: 'Profissional',
      accessor: 'professional' as const,
      cell: (_: unknown, row: Job) => row.professional?.user?.name || <span className="text-muted-foreground">-</span>,
    },
    {
      header: 'Categoria',
      accessor: 'category' as const,
      cell: (_: unknown, row: Job) => row.category?.name || '-',
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      header: 'Valor',
      accessor: 'final_price' as const,
      cell: (value: number | undefined, row: Job) => {
        const price = value || row.quoted_price;
        return price ? formatCurrency(price) : '-';
      },
    },
    {
      header: 'Data',
      accessor: 'created_at' as const,
      cell: (value: string) => formatDate(value),
    },
    {
      header: '',
      accessor: 'id' as const,
      cell: (_: string, row: Job) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenStatusChange(row)}>
              Alterar status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chamados</h1>
        <p className="text-muted-foreground">
          Gerenciar chamados da plataforma ({total} total)
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">Em Andamento</TabsTrigger>
          <TabsTrigger value="COMPLETED">Concluidos</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelados</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por codigo, cliente ou servico..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DataTable columns={columns} data={jobs} />
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Pagina {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Status Change Modal */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Chamado: {selectedJob?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Novo Status</label>
            <select
              className="w-full h-10 px-3 mt-2 border rounded-md bg-background text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
