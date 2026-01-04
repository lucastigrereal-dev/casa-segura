'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const mockJobs = [
  {
    id: '1',
    code: 'CS-20240115-A3B4C',
    mission: 'Troca de Tomada',
    category: 'Elétrica',
    status: 'IN_PROGRESS',
    statusLabel: 'Em Andamento',
    address: 'Rua das Flores, 123 - Centro',
    date: '15/01/2024',
    price: 'R$ 100,00',
  },
  {
    id: '2',
    code: 'CS-20240110-X7Y8Z',
    mission: 'Desentupimento de Pia',
    category: 'Hidráulica',
    status: 'COMPLETED',
    statusLabel: 'Concluído',
    address: 'Av. Brasil, 456 - Bairro Alto',
    date: '10/01/2024',
    price: 'R$ 150,00',
  },
  {
    id: '3',
    code: 'CS-20240105-M1N2O',
    mission: 'Montagem de Móvel',
    category: 'Montagem',
    status: 'PENDING_PAYMENT',
    statusLabel: 'Aguardando Pagamento',
    address: 'Rua XV de Novembro, 789',
    date: '05/01/2024',
    price: 'R$ 200,00',
  },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  IN_PROGRESS: { icon: Clock, color: 'text-orange-500' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500' },
  PENDING_PAYMENT: { icon: AlertCircle, color: 'text-yellow-500' },
};

export default function MeusChamadosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Meus Chamados</h1>
          <Link href="/novo-chamado">
            <Button>Novo Chamado</Button>
          </Link>
        </div>

        {mockJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              Voce ainda nao tem nenhum chamado
            </p>
            <Link href="/novo-chamado">
              <Button>Criar Primeiro Chamado</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockJobs.map((job) => {
              const StatusIcon = statusConfig[job.status]?.icon || Clock;
              const statusColor = statusConfig[job.status]?.color || 'text-gray-500';

              return (
                <Link key={job.id} href={`/chamado/${job.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">{job.code}</span>
                          <span className="text-sm text-gray-300">|</span>
                          <span className="text-sm text-gray-500">{job.date}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{job.mission}</h3>
                        <p className="text-sm text-gray-500">{job.category}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.address}</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${statusColor}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{job.statusLabel}</span>
                        </div>
                        <p className="text-lg font-bold mt-2">{job.price}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 ml-4 self-center" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
