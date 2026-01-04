'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';

const mockJob = {
  id: '1',
  code: 'CS-20240115-A3B4C',
  mission: 'Troca de Tomada',
  category: 'Elétrica',
  description: 'Tomada com mau contato na sala de estar',
  status: 'IN_PROGRESS',
  statusLabel: 'Em Andamento',
  address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'Bento Gonçalves',
    state: 'RS',
  },
  professional: {
    name: 'João Silva',
    phone: '(54) 99999-9999',
    rating: 4.8,
    totalJobs: 127,
  },
  priceEstimated: 10000,
  priceFinal: null,
  createdAt: '2024-01-15T10:00:00Z',
  scheduledDate: '2024-01-16T14:00:00Z',
};

const statusSteps = [
  { key: 'CREATED', label: 'Chamado Criado', completed: true },
  { key: 'PAID', label: 'Pagamento Confirmado', completed: true },
  { key: 'PRO_ACCEPTED', label: 'Profissional Aceito', completed: true },
  { key: 'IN_PROGRESS', label: 'Em Andamento', completed: true, current: true },
  { key: 'COMPLETED', label: 'Concluído', completed: false },
];

export default function ChamadoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/meus-chamados"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Meus Chamados
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">{mockJob.code}</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
              {mockJob.statusLabel}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{mockJob.mission}</h1>
          <p className="text-gray-500">{mockJob.category}</p>
        </div>

        {/* Status Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Acompanhamento</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${step.current ? 'ring-4 ring-green-100' : ''}`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Professional */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Profissional</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{mockJob.professional.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{mockJob.professional.rating}</span>
                </div>
                <span>{mockJob.professional.totalJobs} servicos</span>
              </div>
            </div>
            <a
              href={`tel:${mockJob.professional.phone}`}
              className="p-3 bg-primary-100 rounded-full text-primary-600 hover:bg-primary-200"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Endereco</h2>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p>
                {mockJob.address.street}, {mockJob.address.number}
              </p>
              <p className="text-gray-500">
                {mockJob.address.neighborhood} - {mockJob.address.city},{' '}
                {mockJob.address.state}
              </p>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Agendamento</h2>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p>16 de Janeiro de 2024</p>
              <p className="text-gray-500">Periodo da tarde (14h - 18h)</p>
            </div>
          </div>
        </Card>

        {/* Price */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Valor</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor estimado</p>
              <p className="text-2xl font-bold">R$ 100,00</p>
            </div>
            <Button size="lg">Aprovar Servico</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
