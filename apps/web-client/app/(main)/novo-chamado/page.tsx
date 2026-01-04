'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Droplets, Paintbrush, Wrench, Snowflake, ArrowLeft, ArrowRight } from 'lucide-react';

const categories = [
  { id: '1', name: 'Elétrica', slug: 'eletrica', icon: Zap, color: 'bg-amber-500' },
  { id: '2', name: 'Hidráulica', slug: 'hidraulica', icon: Droplets, color: 'bg-blue-500' },
  { id: '3', name: 'Pintura', slug: 'pintura', icon: Paintbrush, color: 'bg-pink-500' },
  { id: '4', name: 'Montagem', slug: 'montagem', icon: Wrench, color: 'bg-purple-500' },
  { id: '5', name: 'Clima Frio', slug: 'clima-frio', icon: Snowflake, color: 'bg-cyan-500' },
];

const missions: Record<string, Array<{ id: string; name: string; price: string }>> = {
  '1': [
    { id: '1', name: 'Troca de Tomada', price: 'R$ 100' },
    { id: '2', name: 'Instalação de Luminária', price: 'R$ 150' },
    { id: '3', name: 'Troca de Disjuntor', price: 'R$ 200' },
  ],
  '2': [
    { id: '4', name: 'Desentupimento de Pia', price: 'R$ 120' },
    { id: '5', name: 'Troca de Torneira', price: 'R$ 100' },
    { id: '6', name: 'Conserto de Descarga', price: 'R$ 150' },
  ],
  '3': [
    { id: '7', name: 'Pintura de Parede', price: 'R$ 350' },
    { id: '8', name: 'Pintura de Porta', price: 'R$ 200' },
    { id: '9', name: 'Retoque de Pintura', price: 'R$ 120' },
  ],
  '4': [
    { id: '10', name: 'Montagem de Móvel', price: 'R$ 200' },
    { id: '11', name: 'Instalação de Prateleira', price: 'R$ 100' },
    { id: '12', name: 'Instalação de TV', price: 'R$ 150' },
  ],
  '5': [
    { id: '13', name: 'Limpeza de Ar Condicionado', price: 'R$ 180' },
    { id: '14', name: 'Instalação de Aquecedor', price: 'R$ 300' },
    { id: '15', name: 'Manutenção de Lareira', price: 'R$ 350' },
  ],
};

export default function NovoChamadoPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleMissionSelect = (missionId: string) => {
    setSelectedMission(missionId);
    setStep(3);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Category */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Qual tipo de servico voce precisa?
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedCategory === category.id ? 'ring-2 ring-primary-600' : ''
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div
                      className={`${category.color} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-center">{category.name}</h3>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Mission */}
        {step === 2 && selectedCategory && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Qual servico voce precisa?
            </h1>
            <div className="space-y-4">
              {missions[selectedCategory]?.map((mission) => (
                <Card
                  key={mission.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow flex items-center justify-between ${
                    selectedMission === mission.id ? 'ring-2 ring-primary-600' : ''
                  }`}
                  onClick={() => handleMissionSelect(mission.id)}
                >
                  <div>
                    <h3 className="font-semibold">{mission.name}</h3>
                    <p className="text-sm text-gray-500">
                      A partir de {mission.price}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Onde sera o servico?
            </h1>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <Input placeholder="00000-000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <Input placeholder="Nome da rua" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero
                    </label>
                    <Input placeholder="123" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <Input placeholder="Apto, bloco, etc (opcional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <Input placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <Input placeholder="Cidade" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => setStep(4)}>
                  Continuar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div>
            <button
              onClick={() => setStep(3)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Confirme seu chamado
            </h1>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700">Servico</h3>
                  <p>Troca de Tomada</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700">Endereco</h3>
                  <p>Rua das Flores, 123</p>
                  <p className="text-sm text-gray-500">Centro - Bento Goncalves</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700">Valor estimado</h3>
                  <p className="text-2xl font-bold text-primary-600">R$ 100,00</p>
                  <p className="text-sm text-gray-500">
                    O valor final sera confirmado pelo profissional
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Confirmar Chamado
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
