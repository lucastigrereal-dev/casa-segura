'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { professionalsApi, categoriesApi } from '@/lib/api';
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  Filter,
  ChevronDown,
  Award,
  CheckCircle,
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
  Snowflake,
  X,
} from 'lucide-react';

// Tipos
interface Professional {
  id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
    phone: string;
  };
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rating_avg: number;
  total_jobs: number;
  is_available: boolean;
  work_radius_km: number;
  cpf_verified: boolean;
  selfie_verified: boolean;
  address_verified: boolean;
  specialties: Array<{
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Mapa de ícones por slug da categoria
const categoryIcons: Record<string, React.ElementType> = {
  eletrica: Zap,
  hidraulica: Droplets,
  pintura: Paintbrush,
  montagem: Wrench,
  'clima-frio': Snowflake,
};

// Configuração de níveis
const levelConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  BRONZE: { label: 'Bronze', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  SILVER: { label: 'Prata', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  GOLD: { label: 'Ouro', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  PLATINUM: { label: 'Platina', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

// Cidades da Serra Gaúcha
const cities = [
  'Todas as cidades',
  'Bento Gonçalves',
  'Caxias do Sul',
  'Garibaldi',
  'Carlos Barbosa',
  'Farroupilha',
  'Flores da Cunha',
  'Nova Prata',
  'Veranópolis',
];

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'name'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.list() as Category[];
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  // Carregar profissionais
  useEffect(() => {
    const loadProfessionals = async () => {
      setIsLoading(true);
      try {
        const params: { categoryId?: string; city?: string } = {};
        if (selectedCategory) params.categoryId = selectedCategory;
        if (selectedCity && selectedCity !== 'Todas as cidades') params.city = selectedCity;

        const response = await professionalsApi.list(params) as { data: Professional[]; meta: unknown };
        setProfessionals(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        toast.error('Erro', 'Não foi possível carregar os profissionais');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfessionals();
  }, [selectedCategory, selectedCity]);

  // Filtrar e ordenar profissionais
  const filteredProfessionals = professionals
    .filter((pro) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        pro.user.name.toLowerCase().includes(search) ||
        pro.specialties.some(s => s.name.toLowerCase().includes(search)) ||
        pro.specialties.some(s => s.category.name.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating_avg - a.rating_avg;
        case 'jobs':
          return b.total_jobs - a.total_jobs;
        case 'name':
          return a.user.name.localeCompare(b.user.name);
        default:
          return 0;
      }
    });

  // Renderizar estrelas
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setSortBy('rating');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCity;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profissionais</h1>
          <p className="text-gray-500">
            Encontre profissionais qualificados para seus serviços
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-gray-100' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'jobs' | 'name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="rating">Melhor avaliação</option>
                    <option value="jobs">Mais serviços</option>
                    <option value="name">Nome (A-Z)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Busca: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCity && selectedCity !== 'Todas as cidades' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {selectedCity}
                  <button onClick={() => setSelectedCity('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          {isLoading ? (
            'Carregando...'
          ) : (
            `${filteredProfessionals.length} profissional${filteredProfessionals.length !== 1 ? 'is' : ''} encontrado${filteredProfessionals.length !== 1 ? 's' : ''}`
          )}
        </div>

        {/* Professionals Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loading size="lg" />
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhum profissional encontrado</h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros de busca
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((pro) => {
              const level = levelConfig[pro.level] || levelConfig.BRONZE;
              const isFullyVerified = pro.cpf_verified && pro.selfie_verified && pro.address_verified;

              return (
                <Link key={pro.id} href={`/profissional/${pro.user_id}`}>
                  <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar
                        name={pro.user.name}
                        src={pro.user.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{pro.user.name}</h3>
                          {isFullyVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" title="Verificado" />
                          )}
                        </div>

                        {/* Level Badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${level.bgColor} ${level.color}`}>
                          <Award className="h-3 w-3" />
                          {level.label}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(pro.rating_avg)}</div>
                      <span className="font-medium">{pro.rating_avg.toFixed(1)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {pro.total_jobs} serviço{pro.total_jobs !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {pro.specialties.slice(0, 3).map((specialty) => {
                          const Icon = categoryIcons[specialty.category.slug] || Wrench;
                          return (
                            <span
                              key={specialty.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              <Icon className="h-3 w-3" />
                              {specialty.name}
                            </span>
                          );
                        })}
                        {pro.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{pro.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {pro.work_radius_km}km
                      </span>
                      <span className={`flex items-center gap-1 ${pro.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${pro.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {pro.is_available ? 'Disponível' : 'Indisponível'}
                      </span>
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
