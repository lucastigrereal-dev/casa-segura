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
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle, Loader2, Target } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { missionsApi, Mission } from '@/lib/api';
import { formatDate, getStatusLabel } from '@/lib/utils';

const typeLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DAILY: { label: 'Diaria', variant: 'default' },
  WEEKLY: { label: 'Semanal', variant: 'secondary' },
  MONTHLY: { label: 'Mensal', variant: 'outline' },
  ONE_TIME: { label: 'Unica', variant: 'destructive' },
};

export default function MissoesPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 0,
    type: 'DAILY',
  });

  const loadMissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await missionsApi.list({
        page,
        limit,
        type: typeFilter || undefined,
      });
      setMissions(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar missoes');
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  const handleOpenCreate = () => {
    setSelectedMission(null);
    setFormData({ title: '', description: '', points: 0, type: 'DAILY' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mission: Mission) => {
    setSelectedMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      points: mission.points,
      type: mission.type,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (selectedMission) {
        await missionsApi.update(selectedMission.id, formData);
      } else {
        await missionsApi.create(formData);
      }
      setIsModalOpen(false);
      loadMissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar missao');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMission) return;
    try {
      setIsSaving(true);
      await missionsApi.delete(selectedMission.id);
      setIsDeleteOpen(false);
      loadMissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir missao');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (mission: Mission) => {
    try {
      await missionsApi.toggleActive(mission.id);
      loadMissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  const filteredMissions = missions.filter(
    (mission) =>
      mission.title.toLowerCase().includes(search.toLowerCase()) ||
      mission.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Titulo', accessor: 'title' as const },
    {
      header: 'Descricao',
      accessor: 'description' as const,
      cell: (value: string) => (
        <span className="line-clamp-2 max-w-xs">{value}</span>
      ),
    },
    {
      header: 'Pontos',
      accessor: 'points' as const,
      cell: (value: number) => (
        <span className="font-medium">{value} pts</span>
      ),
    },
    {
      header: 'Tipo',
      accessor: 'type' as const,
      cell: (value: string) => {
        const type = typeLabels[value] || { label: value, variant: 'outline' as const };
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: 'is_active' as const,
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      header: 'Criado em',
      accessor: 'created_at' as const,
      cell: (value: string) => formatDate(value),
    },
    {
      header: '',
      accessor: 'id' as const,
      cell: (_: string, row: Mission) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenEdit(row)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row)}>
              {row.is_active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleOpenDelete(row)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missoes</h1>
          <p className="text-muted-foreground">
            Gerenciar missoes e desafios ({total} total)
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Missao
        </Button>
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
                placeholder="Buscar por titulo ou descricao..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 px-3 border rounded-md bg-background text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="DAILY">Diaria</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensal</option>
              <option value="ONE_TIME">Unica</option>
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
              <DataTable columns={columns} data={filteredMissions} />
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

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedMission ? 'Editar Missao' : 'Nova Missao'}
            </DialogTitle>
            <DialogDescription>
              {selectedMission ? 'Atualize as informacoes da missao' : 'Preencha os dados da nova missao'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titulo</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titulo da missao"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao</label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-sm resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descricao da missao"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pontos</label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-background text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensal</option>
                  <option value="ONE_TIME">Unica</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedMission ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusao</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a missao &quot;{selectedMission?.title}&quot;? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
