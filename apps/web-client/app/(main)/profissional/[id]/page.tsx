'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { professionalsApi, reviewsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Star,
  MapPin,
  Phone,
  Award,
  CheckCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
  Snowflake,
  MessageCircle,
  ThumbsUp,
  Clock,
  Shield,
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
    created_at: string;
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

interface Review {
  id: string;
  rating_overall: number;
  rating_punctuality?: number;
  rating_quality?: number;
  rating_friendliness?: number;
  comment?: string;
  created_at: string;
  reviewer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  job: {
    id: string;
    mission: {
      name: string;
    };
  };
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
const levelConfig: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  BRONZE: {
    label: 'Bronze',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Profissional iniciante',
  },
  SILVER: {
    label: 'Prata',
    color: 'text-gray-600',
    bgColor: 'bg-gray-200',
    description: 'Profissional com experiência',
  },
  GOLD: {
    label: 'Ouro',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Profissional altamente recomendado',
  },
  PLATINUM: {
    label: 'Platina',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Elite dos profissionais',
  },
};

export default function ProfissionalPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sobre' | 'avaliacoes'>('sobre');

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar profissional
        const proData = await professionalsApi.getById(userId) as Professional;
        setProfessional(proData);

        // Carregar avaliações
        const reviewsData = await reviewsApi.getByProfessional(userId) as Review[];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Erro ao carregar profissional:', error);
        toast.error('Erro', 'Não foi possível carregar o perfil do profissional');
        router.push('/profissionais');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, router]);

  // Renderizar estrelas
  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star key={i} className={`${sizeClass} fill-yellow-400/50 text-yellow-400`} />
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizeClass} text-gray-300`} />
        );
      }
    }
    return stars;
  };

  // Calcular média por categoria
  const getAverageRatings = () => {
    if (reviews.length === 0) return null;

    const totals = reviews.reduce(
      (acc, review) => ({
        punctuality: acc.punctuality + (review.rating_punctuality || 0),
        quality: acc.quality + (review.rating_quality || 0),
        friendliness: acc.friendliness + (review.rating_friendliness || 0),
        count: {
          punctuality: acc.count.punctuality + (review.rating_punctuality ? 1 : 0),
          quality: acc.count.quality + (review.rating_quality ? 1 : 0),
          friendliness: acc.count.friendliness + (review.rating_friendliness ? 1 : 0),
        },
      }),
      { punctuality: 0, quality: 0, friendliness: 0, count: { punctuality: 0, quality: 0, friendliness: 0 } }
    );

    return {
      punctuality: totals.count.punctuality > 0 ? totals.punctuality / totals.count.punctuality : 0,
      quality: totals.count.quality > 0 ? totals.quality / totals.count.quality : 0,
      friendliness: totals.count.friendliness > 0 ? totals.friendliness / totals.count.friendliness : 0,
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  const level = levelConfig[professional.level] || levelConfig.BRONZE;
  const isFullyVerified = professional.cpf_verified && professional.selfie_verified && professional.address_verified;
  const averageRatings = getAverageRatings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <Avatar
                name={professional.user.name}
                src={professional.user.avatar_url}
                size="xl"
              />
            </div>

            <div className="flex-1">
              {/* Name and Verification */}
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{professional.user.name}</h1>
                {isFullyVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Verificado
                  </span>
                )}
              </div>

              {/* Level Badge */}
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-4 ${level.bgColor} ${level.color}`}>
                <Award className="h-4 w-4" />
                {level.label}
                <span className="text-xs opacity-75 ml-1">- {level.description}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">{renderStars(professional.rating_avg)}</div>
                <span className="text-xl font-bold">{professional.rating_avg.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''})
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  {professional.total_jobs} serviços realizados
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  Atende até {professional.work_radius_km}km
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Membro desde {formatDate(professional.user.created_at).split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 md:w-48">
              <span className={`text-center py-2 rounded-lg font-medium ${
                professional.is_available
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {professional.is_available ? 'Disponível' : 'Indisponível'}
              </span>

              {professional.is_available && (
                <>
                  <Link href="/novo-chamado">
                    <Button className="w-full">
                      Solicitar Serviço
                    </Button>
                  </Link>
                  <a href={`tel:${professional.user.phone}`}>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('sobre')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'sobre'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sobre
          </button>
          <button
            onClick={() => setActiveTab('avaliacoes')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'avaliacoes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Avaliações ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'sobre' && (
          <div className="space-y-6">
            {/* Specialties */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {professional.specialties.map((specialty) => {
                  const Icon = categoryIcons[specialty.category.slug] || Wrench;
                  return (
                    <span
                      key={specialty.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                    >
                      <Icon className="h-4 w-4" />
                      {specialty.name}
                      <span className="text-xs text-gray-500">({specialty.category.name})</span>
                    </span>
                  );
                })}
              </div>
            </Card>

            {/* Verification Status */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Verificações</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  professional.cpf_verified ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <Shield className={`h-5 w-5 ${professional.cpf_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">CPF</p>
                    <p className={`text-sm ${professional.cpf_verified ? 'text-green-600' : 'text-gray-500'}`}>
                      {professional.cpf_verified ? 'Verificado' : 'Não verificado'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  professional.selfie_verified ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${professional.selfie_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">Identidade</p>
                    <p className={`text-sm ${professional.selfie_verified ? 'text-green-600' : 'text-gray-500'}`}>
                      {professional.selfie_verified ? 'Verificada' : 'Não verificada'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  professional.address_verified ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <MapPin className={`h-5 w-5 ${professional.address_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className={`text-sm ${professional.address_verified ? 'text-green-600' : 'text-gray-500'}`}>
                      {professional.address_verified ? 'Verificado' : 'Não verificado'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rating Breakdown */}
            {averageRatings && (
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Avaliações por Categoria</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      Pontualidade
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(averageRatings.punctuality, 'sm')}</div>
                      <span className="font-medium">{averageRatings.punctuality.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <ThumbsUp className="h-4 w-4" />
                      Qualidade
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(averageRatings.quality, 'sm')}</div>
                      <span className="font-medium">{averageRatings.quality.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      Cordialidade
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(averageRatings.friendliness, 'sm')}</div>
                      <span className="font-medium">{averageRatings.friendliness.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'avaliacoes' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sem avaliações ainda</h3>
                <p className="text-gray-500">
                  Este profissional ainda não recebeu avaliações
                </p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={review.reviewer.name}
                      src={review.reviewer.avatar_url}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{review.reviewer.name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        Serviço: {review.job.mission.name}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(review.rating_overall, 'sm')}</div>
                        <span className="font-medium">{review.rating_overall}</span>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          "{review.comment}"
                        </p>
                      )}

                      {/* Individual Ratings */}
                      {(review.rating_punctuality || review.rating_quality || review.rating_friendliness) && (
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                          {review.rating_punctuality && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Pontualidade: {review.rating_punctuality}
                            </span>
                          )}
                          {review.rating_quality && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              Qualidade: {review.rating_quality}
                            </span>
                          )}
                          {review.rating_friendliness && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              Cordialidade: {review.rating_friendliness}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
