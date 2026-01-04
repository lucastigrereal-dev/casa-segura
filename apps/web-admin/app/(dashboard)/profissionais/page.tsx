'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Star, MoreHorizontal, CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertCircle, Loader2, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { professionalsApi, Professional } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfessionals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalsApi.list({
        page,
        limit,
        search: search || undefined,
        verified: verifiedFilter ? verifiedFilter === 'true' : undefined,
      });
      setProfessionals(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, verifiedFilter]);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  useEffect(() => {
    setPage(1);
  }, [search, verifiedFilter]);

  const handleVerify = async () => {
    if (!selectedProfessional) return;
    try {
      setIsSaving(true);
      if (selectedProfessional.is_verified) {
        await professionalsApi.unverify(selectedProfessional.id);
      } else {
        await professionalsApi.verify(selectedProfessional.id);
      }
      setIsVerifyOpen(false);
      loadProfessionals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar verificacao');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailable = async (professional: Professional) => {
    try {
      await professionalsApi.toggleAvailable(professional.id);
      loadProfessionals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar disponibilidade');
    }
  };

  const openVerifyModal = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsVerifyOpen(true);
  };

  const columns = [
    {
      header: 'Profissional',
      accessor: 'user' as const,
      cell: (_: unknown, row: Professional) => (
        <div>
          <p className="font-medium">{row.user?.name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{row.user?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Avaliacao',
      accessor: 'rating' as const,
      cell: (value: number | undefined) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span>{value?.toFixed(1) || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Servicos',
      accessor: 'total_jobs' as const,
      cell: (value: number) => value || 0,
    },
    {
      header: 'Experiencia',
      accessor: 'experience_years' as const,
      cell: (value: number | undefined) => value ? `${value} anos` : '-',
    },
    {
      header: 'Disponivel',
      accessor: 'is_available' as const,
      cell: (value: boolean) =>
        value ? (
          <Badge variant="default">Sim</Badge>
        ) : (
          <Badge variant="secondary">Nao</Badge>
        ),
    },
    {
      header: 'Verificado',
      accessor: 'is_verified' as const,
      cell: (value: boolean) =>
        value ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        ),
    },
    {
      header: 'Desde',
      accessor: 'created_at' as const,
      cell: (value: string) => formatDate(value),
    },
    {
      header: '',
      accessor: 'id' as const,
      cell: (_: string, row: Professional) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openVerifyModal(row)}>
              {row.is_verified ? 'Remover verificacao' : 'Verificar profissional'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleAvailable(row)}>
              {row.is_available ? 'Marcar indisponivel' : 'Marcar disponivel'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profissionais</h1>
        <p className="text-muted-foreground">
          Gerenciar profissionais da plataforma ({total} total)
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 px-3 border rounded-md bg-background text-sm"
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Verificados</option>
              <option value="false">Nao verificados</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={professionals} />
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

      {/* Verify Confirmation Modal */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedProfessional?.is_verified ? 'Remover Verificacao' : 'Verificar Profissional'}
            </DialogTitle>
            <DialogDescription>
              {selectedProfessional?.is_verified
                ? `Tem certeza que deseja remover a verificacao de ${selectedProfessional?.user?.name}?`
                : `Confirma a verificacao do profissional ${selectedProfessional?.user?.name}? Isso indica que os documentos foram validados.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={selectedProfessional?.is_verified ? 'destructive' : 'default'}
              onClick={handleVerify}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedProfessional?.is_verified ? 'Remover' : 'Verificar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
