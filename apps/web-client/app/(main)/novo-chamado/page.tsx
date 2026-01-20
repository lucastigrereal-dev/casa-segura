'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/ui/loading';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { categoriesApi, missionsApi, addressesApi, jobsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
  Snowflake,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Plus,
  Check,
  X,
  Home,
  FileText,
} from 'lucide-react';

// Tipos
interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

interface Mission {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price_min: number;
  price_max: number;
  price_default: number;
  duration_min: number;
  duration_max: number;
  requires_photo: boolean;
  is_active: boolean;
}

interface Address {
  id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

// Mapa de ícones por slug da categoria
const categoryIcons: Record<string, React.ElementType> = {
  eletrica: Zap,
  hidraulica: Droplets,
  pintura: Paintbrush,
  montagem: Wrench,
  'clima-frio': Snowflake,
};

// Mapa de cores por slug da categoria
const categoryColors: Record<string, string> = {
  eletrica: 'bg-amber-500',
  hidraulica: 'bg-blue-500',
  pintura: 'bg-pink-500',
  montagem: 'bg-purple-500',
  'clima-frio': 'bg-cyan-500',
};

// Janelas de horário disponíveis
const timeWindows = [
  { value: 'manha', label: 'Manhã (8h - 12h)' },
  { value: 'tarde', label: 'Tarde (13h - 18h)' },
  { value: 'noite', label: 'Noite (18h - 21h)' },
  { value: 'flexivel', label: 'Horário Flexível' },
];

export default function NovoChamadoPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

  // Estados do wizard
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados das APIs
  const [categories, setCategories] = useState<Category[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Seleções do usuário
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);

  // Formulário de descrição (Step 3)
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Formulário de novo endereço
  const [newAddress, setNewAddress] = useState({
    label: '',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'RS',
  });

  // Agendamento (Step 4)
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledWindow, setScheduledWindow] = useState('');

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.warning('Atenção', 'Você precisa estar logado para solicitar um serviço');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.list() as Category[];
        setCategories(data.filter(c => c.is_active));
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast.error('Erro', 'Não foi possível carregar as categorias');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  // Carregar missões quando categoria é selecionada
  useEffect(() => {
    const loadMissions = async () => {
      if (!selectedCategory) return;

      setIsLoading(true);
      try {
        const data = await missionsApi.list(selectedCategory.id) as Mission[];
        setMissions(data.filter(m => m.is_active));
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error('Erro', 'Não foi possível carregar os serviços');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCategory) {
      loadMissions();
    }
  }, [selectedCategory]);

  // Carregar endereços do usuário
  useEffect(() => {
    const loadAddresses = async () => {
      if (!token) return;

      try {
        const data = await addressesApi.list(token) as Address[];
        setAddresses(data);
        // Selecionar endereço padrão automaticamente
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
      }
    };

    if (token && step === 4) {
      loadAddresses();
    }
  }, [token, step]);

  // Handlers de navegação
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedMission(null);
    setStep(2);
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
    setStep(3);
  };

  const handleDescriptionNext = () => {
    if (selectedMission?.requires_photo && photos.length === 0) {
      toast.warning('Foto obrigatória', 'Este serviço requer pelo menos uma foto do problema');
      return;
    }
    setStep(4);
  };

  const handleAddressNext = () => {
    if (!selectedAddress && !isNewAddress) {
      toast.warning('Endereço obrigatório', 'Selecione ou cadastre um endereço');
      return;
    }
    if (isNewAddress && (!newAddress.street || !newAddress.number || !newAddress.city)) {
      toast.warning('Campos obrigatórios', 'Preencha rua, número e cidade');
      return;
    }
    setStep(5);
  };

  // Simular upload de foto (por enquanto apenas placeholder)
  const handlePhotoUpload = () => {
    // TODO: Implementar upload real para S3/storage
    const mockPhotoUrl = `https://placehold.co/400x300?text=Foto+${photos.length + 1}`;
    setPhotos([...photos, mockPhotoUrl]);
    toast.success('Foto adicionada', 'Foto carregada com sucesso');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Buscar CEP
  const handleCepSearch = async () => {
    const cep = newAddress.zip_code.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.warning('CEP inválido', 'Digite um CEP válido com 8 dígitos');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado', 'Verifique o CEP digitado');
        return;
      }

      setNewAddress({
        ...newAddress,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || 'RS',
      });
      toast.success('CEP encontrado', 'Endereço preenchido automaticamente');
    } catch (error) {
      toast.error('Erro', 'Não foi possível buscar o CEP');
    }
  };

  // Submeter chamado
  const handleSubmit = async () => {
    if (!selectedMission || !token) return;

    setIsSubmitting(true);

    try {
      let addressId = selectedAddress?.id;

      // Se for novo endereço, criar primeiro
      if (isNewAddress) {
        const createdAddress = await addressesApi.create({
          label: newAddress.label || 'Endereço do serviço',
          street: newAddress.street,
          number: newAddress.number,
          complement: newAddress.complement,
          neighborhood: newAddress.neighborhood,
          city: newAddress.city,
          state: newAddress.state,
          zip_code: newAddress.zip_code.replace(/\D/g, ''),
        }, token) as Address;
        addressId = createdAddress.id;
      }

      if (!addressId) {
        toast.error('Erro', 'Endereço não encontrado');
        setIsSubmitting(false);
        return;
      }

      // Criar o chamado
      const jobData = {
        mission_id: selectedMission.id,
        address_id: addressId,
        scheduled_date: scheduledDate || undefined,
        scheduled_window: scheduledWindow || undefined,
        diagnosis_answers: description ? { description } : undefined,
        photos_before: photos.length > 0 ? photos : undefined,
      };

      const createdJob = await jobsApi.create(jobData, token) as { id: string; code: string };

      toast.success('Chamado criado!', `Código: ${createdJob.code}`);
      router.push(`/chamado/${createdJob.id}`);
    } catch (error: unknown) {
      console.error('Erro ao criar chamado:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível criar o chamado';
      toast.error('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular data mínima (amanhã)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (authLoading || (isLoading && step === 1)) {
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
      <div className="max-w-3xl mx-auto">
        {/* Indicador de Progresso */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Categoria' },
            { num: 2, label: 'Serviço' },
            { num: 3, label: 'Detalhes' },
            { num: 4, label: 'Endereço' },
            { num: 5, label: 'Confirmar' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s.num
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span className="text-xs mt-1 text-gray-500 hidden sm:block">{s.label}</span>
              </div>
              {i < 4 && (
                <div
                  className={`w-8 sm:w-16 h-1 mx-1 transition-colors ${
                    step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Selecionar Categoria */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2 text-center">
              Qual tipo de serviço você precisa?
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Selecione a categoria que melhor descreve o problema
            </p>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma categoria disponível no momento
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const Icon = categoryIcons[category.slug] || Wrench;
                  const color = category.color || categoryColors[category.slug] || 'bg-gray-500';

                  return (
                    <Card
                      key={category.id}
                      className={`p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
                        selectedCategory?.id === category.id ? 'ring-2 ring-primary-600' : ''
                      }`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div
                        className={`${color} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-center">{category.name}</h3>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Selecionar Serviço/Missão */}
        {step === 2 && selectedCategory && (
          <div>
            <button
              onClick={() => {
                setStep(1);
                setSelectedCategory(null);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para categorias
            </button>

            <h1 className="text-2xl font-bold mb-2 text-center">
              Qual serviço você precisa?
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Categoria: <span className="font-medium text-gray-700">{selectedCategory.name}</span>
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loading size="lg" />
              </div>
            ) : missions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum serviço disponível nesta categoria
              </div>
            ) : (
              <div className="space-y-3">
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    className={`p-4 cursor-pointer hover:shadow-lg transition-all flex items-center justify-between ${
                      selectedMission?.id === mission.id ? 'ring-2 ring-primary-600' : ''
                    }`}
                    onClick={() => handleMissionSelect(mission)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{mission.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-primary-600">
                          A partir de {formatCurrency(mission.price_default)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {mission.duration_min}-{mission.duration_max} min
                        </span>
                        {mission.requires_photo && (
                          <span className="text-xs text-orange-500 flex items-center gap-1">
                            <Camera className="h-3 w-3" /> Foto obrigatória
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-4" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Descrição e Fotos */}
        {step === 3 && selectedMission && (
          <div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para serviços
            </button>

            <h1 className="text-2xl font-bold mb-2 text-center">
              Descreva o problema
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Quanto mais detalhes, melhor o orçamento
            </p>

            <Card className="p-6">
              <div className="space-y-6">
                {/* Serviço selecionado */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium">{selectedMission.name}</p>
                      <p className="text-sm text-gray-500">{selectedCategory?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Textarea
                    label="Descrição do problema"
                    placeholder="Descreva o que está acontecendo, quando começou, tentativas de reparo anteriores, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Fotos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos do problema {selectedMission.requires_photo && <span className="text-red-500">*</span>}
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {photos.length < 5 && (
                      <button
                        onClick={handlePhotoUpload}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary-500 hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Adicionar</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Máximo de 5 fotos. Formatos: JPG, PNG
                  </p>
                </div>

                <Button className="w-full" onClick={handleDescriptionNext}>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Endereço e Agendamento */}
        {step === 4 && (
          <div>
            <button
              onClick={() => setStep(3)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>

            <h1 className="text-2xl font-bold mb-2 text-center">
              Onde será o serviço?
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Selecione ou cadastre um endereço
            </p>

            <div className="space-y-6">
              {/* Endereços existentes */}
              {addresses.length > 0 && !isNewAddress && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <Card
                      key={address.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                        selectedAddress?.id === address.id ? 'ring-2 ring-primary-600' : ''
                      }`}
                      onClick={() => {
                        setSelectedAddress(address);
                        setIsNewAddress(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Home className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{address.label || 'Endereço'}</h3>
                            {address.is_default && (
                              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                Padrão
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {address.neighborhood} - {address.city}/{address.state}
                          </p>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <Check className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Botão para novo endereço */}
              {!isNewAddress && (
                <button
                  onClick={() => {
                    setIsNewAddress(true);
                    setSelectedAddress(null);
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Cadastrar novo endereço</span>
                </button>
              )}

              {/* Formulário de novo endereço */}
              {isNewAddress && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Novo Endereço</h3>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => {
                          setIsNewAddress(false);
                          const defaultAddr = addresses.find(a => a.is_default);
                          if (defaultAddr) setSelectedAddress(defaultAddr);
                        }}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Usar endereço existente
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Nome do endereço (opcional)"
                      placeholder="Ex: Casa, Trabalho, Apartamento"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    />

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          label="CEP"
                          placeholder="00000-000"
                          value={newAddress.zip_code}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                            const formatted = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
                            setNewAddress({ ...newAddress, zip_code: formatted });
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={handleCepSearch}
                      >
                        Buscar
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Input
                          label="Rua"
                          placeholder="Nome da rua"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Número"
                        placeholder="123"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Complemento (opcional)"
                      placeholder="Apto, bloco, etc"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Bairro"
                        placeholder="Bairro"
                        value={newAddress.neighborhood}
                        onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      />
                      <Input
                        label="Cidade"
                        placeholder="Cidade"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Agendamento */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Agendamento (opcional)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data preferida
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário preferido
                    </label>
                    <select
                      value={scheduledWindow}
                      onChange={(e) => setScheduledWindow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione...</option>
                      {timeWindows.map((tw) => (
                        <option key={tw.value} value={tw.value}>
                          {tw.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  O profissional entrará em contato para confirmar a disponibilidade
                </p>
              </Card>

              <Button className="w-full" onClick={handleAddressNext}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {step === 5 && selectedMission && (
          <div>
            <button
              onClick={() => setStep(4)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>

            <h1 className="text-2xl font-bold mb-2 text-center">
              Confirme seu chamado
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Revise os detalhes antes de confirmar
            </p>

            <Card className="p-6">
              <div className="space-y-6">
                {/* Serviço */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Serviço
                  </h3>
                  <p className="font-medium">{selectedMission.name}</p>
                  <p className="text-sm text-gray-500">{selectedCategory?.name}</p>
                  {description && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                      "{description}"
                    </p>
                  )}
                  {photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {photos.map((_, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Foto {i + 1}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Endereço */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </h3>
                  {isNewAddress ? (
                    <>
                      <p>{newAddress.street}, {newAddress.number}</p>
                      <p className="text-sm text-gray-500">
                        {newAddress.neighborhood} - {newAddress.city}/{newAddress.state}
                      </p>
                    </>
                  ) : selectedAddress && (
                    <>
                      <p>{selectedAddress.street}, {selectedAddress.number}</p>
                      <p className="text-sm text-gray-500">
                        {selectedAddress.neighborhood} - {selectedAddress.city}/{selectedAddress.state}
                      </p>
                    </>
                  )}
                </div>

                {/* Agendamento */}
                {(scheduledDate || scheduledWindow) && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Agendamento
                    </h3>
                    <div className="flex gap-4">
                      {scheduledDate && (
                        <p>
                          <span className="text-gray-500">Data:</span>{' '}
                          {new Date(scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {scheduledWindow && (
                        <p>
                          <span className="text-gray-500">Horário:</span>{' '}
                          {timeWindows.find(tw => tw.value === scheduledWindow)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Valor */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Valor estimado</h3>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(selectedMission.price_default)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    O valor final será confirmado pelo profissional após avaliação
                  </p>
                </div>

                {/* Botão de confirmação */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Criando chamado...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Confirmar Chamado
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Ao confirmar, você concorda com nossos termos de serviço
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
