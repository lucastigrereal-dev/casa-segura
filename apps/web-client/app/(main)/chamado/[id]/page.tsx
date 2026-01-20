'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/ui/loading';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { jobsApi, reviewsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  FileText,
  AlertCircle,
  XCircle,
  Truck,
  CreditCard,
  Shield,
  AlertTriangle,
  Play,
  ThumbsUp,
  Image,
  MessageCircle,
} from 'lucide-react';

// Tipos
interface Job {
  id: string;
  code: string;
  status: string;
  price_estimated: number;
  price_final?: number;
  price_additional?: number;
  scheduled_date?: string;
  scheduled_window?: string;
  diagnosis_answers?: { description?: string };
  photos_before?: string[];
  photos_after?: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  guarantee_until?: string;
  mission: {
    id: string;
    name: string;
    description: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  address: {
    id: string;
    label?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  pro?: {
    id: string;
    name: string;
    phone: string;
    avatar_url?: string;
    professional?: {
      rating_avg: number;
      total_jobs: number;
      level: string;
    };
  };
  review?: {
    id: string;
    rating_overall: number;
    comment?: string;
  };
}

// Configuração de status
const statusConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  CREATED: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Aguardando orçamento' },
  QUOTED: { icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Orçamento recebido' },
  PENDING_PAYMENT: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Aguardando pagamento' },
  PAID: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Pagamento confirmado' },
  ASSIGNED: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Profissional designado' },
  PRO_ACCEPTED: { icon: ThumbsUp, color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Profissional aceitou' },
  PRO_ON_WAY: { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Profissional a caminho' },
  IN_PROGRESS: { icon: Play, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Em andamento' },
  PENDING_APPROVAL: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Aguardando aprovação' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Concluído' },
  IN_GUARANTEE: { icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Em garantia' },
  CLOSED: { icon: CheckCircle, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Fechado' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Cancelado' },
  DISPUTED: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Em disputa' },
};

// Timeline de status
const statusOrder = [
  'CREATED', 'QUOTED', 'PENDING_PAYMENT', 'PAID', 'ASSIGNED',
  'PRO_ACCEPTED', 'PRO_ON_WAY', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED'
];

// Janelas de horário
const timeWindows: Record<string, string> = {
  manha: 'Manhã (8h - 12h)',
  tarde: 'Tarde (13h - 18h)',
  noite: 'Noite (18h - 21h)',
  flexivel: 'Horário Flexível',
};

export default function ChamadoPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de avaliação
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewPunctuality, setReviewPunctuality] = useState(5);
  const [reviewQuality, setReviewQuality] = useState(5);
  const [reviewFriendliness, setReviewFriendliness] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.warning('Atenção', 'Você precisa estar logado para ver este chamado');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar chamado
  useEffect(() => {
    const loadJob = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const data = await jobsApi.getById(jobId, token) as Job;
        setJob(data);
      } catch (error) {
        console.error('Erro ao carregar chamado:', error);
        toast.error('Erro', 'Não foi possível carregar o chamado');
        router.push('/meus-chamados');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && jobId) {
      loadJob();
    }
  }, [token, jobId, router]);

  // Obter índice do status atual
  const getCurrentStatusIndex = () => {
    if (!job) return -1;
    return statusOrder.indexOf(job.status);
  };

  // Verificar se pode avaliar
  const canReview = () => {
    if (!job) return false;
    return ['COMPLETED', 'IN_GUARANTEE', 'CLOSED'].includes(job.status) && !job.review;
  };

  // Submeter avaliação
  const handleSubmitReview = async () => {
    if (!job || !token) return;

    setIsSubmittingReview(true);
    try {
      await reviewsApi.create({
        job_id: job.id,
        reviewed_id: job.pro?.id,
        rating_overall: reviewRating,
        rating_punctuality: reviewPunctuality,
        rating_quality: reviewQuality,
        rating_friendliness: reviewFriendliness,
        comment: reviewComment || undefined,
      }, token);

      toast.success('Avaliação enviada!', 'Obrigado por avaliar o serviço');
      setShowReviewModal(false);

      // Recarregar chamado
      const updatedJob = await jobsApi.getById(jobId, token) as Job;
      setJob(updatedJob);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro', 'Não foi possível enviar a avaliação');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Renderizar estrelas selecionáveis
  const renderSelectableStars = (
    value: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const status = statusConfig[job.status] || statusConfig.CREATED;
  const StatusIcon = status.icon;
  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/meus-chamados"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Meus Chamados
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-gray-500">{job.code}</span>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </div>
          </div>
          <h1 className="text-2xl font-bold">{job.mission.name}</h1>
          <p className="text-gray-500">{job.mission.category.name}</p>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Acompanhamento</h2>
          <div className="relative">
            {/* Linha de conexão */}
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" />

            <div className="space-y-4 relative">
              {statusOrder.slice(0, Math.min(currentStatusIndex + 2, statusOrder.length)).map((statusKey, index) => {
                const stepStatus = statusConfig[statusKey];
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StepIcon = stepStatus.icon;

                return (
                  <div key={statusKey} className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                        isCompleted || isCurrent
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <StepIcon className="h-3 w-3" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`font-medium ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {stepStatus.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-green-600 mt-1">Status atual</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Description */}
        {job.diagnosis_answers?.description && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Descrição do Problema
            </h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {job.diagnosis_answers.description}
            </p>
          </Card>
        )}

        {/* Photos */}
        {job.photos_before && job.photos_before.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Fotos do Problema
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {job.photos_before.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Professional */}
        {job.pro && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">Profissional</h2>
            <div className="flex items-center gap-4">
              <Avatar
                name={job.pro.name}
                src={job.pro.avatar_url}
                size="lg"
              />
              <div className="flex-1">
                <Link
                  href={`/profissional/${job.pro.id}`}
                  className="font-semibold text-lg hover:text-primary-600"
                >
                  {job.pro.name}
                </Link>
                {job.pro.professional && (
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{job.pro.professional.rating_avg.toFixed(1)}</span>
                    </div>
                    <span>{job.pro.professional.total_jobs} serviços</span>
                  </div>
                )}
              </div>
              <a
                href={`tel:${job.pro.phone}`}
                className="p-3 bg-primary-100 rounded-full text-primary-600 hover:bg-primary-200 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </Card>
        )}

        {/* Address */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </h2>
          <div className="pl-7">
            <p>{job.address.street}, {job.address.number}</p>
            {job.address.complement && (
              <p className="text-gray-500">{job.address.complement}</p>
            )}
            <p className="text-gray-500">
              {job.address.neighborhood} - {job.address.city}, {job.address.state}
            </p>
          </div>
        </Card>

        {/* Schedule */}
        {(job.scheduled_date || job.scheduled_window) && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamento
            </h2>
            <div className="pl-7">
              {job.scheduled_date && (
                <p>{formatDate(job.scheduled_date)}</p>
              )}
              {job.scheduled_window && (
                <p className="text-gray-500">{timeWindows[job.scheduled_window] || job.scheduled_window}</p>
              )}
            </div>
          </Card>
        )}

        {/* Price */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Valor</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {job.price_final ? 'Valor final' : 'Valor estimado'}
              </p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(job.price_final || job.price_estimated)}
              </p>
              {job.price_additional && job.price_additional > 0 && (
                <p className="text-sm text-orange-600">
                  + {formatCurrency(job.price_additional)} (adicional)
                </p>
              )}
            </div>

            {/* Actions based on status */}
            {job.status === 'PENDING_APPROVAL' && (
              <Button size="lg" onClick={() => {
                // TODO: Implementar aprovação
                toast.info('Em breve', 'Funcionalidade de aprovação em desenvolvimento');
              }}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Aprovar Serviço
              </Button>
            )}
          </div>
        </Card>

        {/* Review Section */}
        {job.review ? (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Sua Avaliação
            </h2>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= job.review!.rating_overall
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="font-medium ml-2">{job.review.rating_overall}/5</span>
            </div>
            {job.review.comment && (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                "{job.review.comment}"
              </p>
            )}
          </Card>
        ) : canReview() && (
          <Card className="p-6 mb-6 border-2 border-dashed border-primary-200 bg-primary-50">
            <div className="text-center">
              <Star className="h-12 w-12 text-primary-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Avalie o serviço</h3>
              <p className="text-gray-600 mb-4">
                Sua avaliação ajuda outros usuários e o profissional
              </p>
              <Button onClick={() => setShowReviewModal(true)}>
                <Star className="h-4 w-4 mr-2" />
                Avaliar Agora
              </Button>
            </div>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Criado em</span>
              <span>{formatDate(job.created_at)}</span>
            </div>
            {job.started_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Iniciado em</span>
                <span>{formatDate(job.started_at)}</span>
              </div>
            )}
            {job.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Concluído em</span>
                <span>{formatDate(job.completed_at)}</span>
              </div>
            )}
            {job.guarantee_until && (
              <div className="flex justify-between">
                <span className="text-gray-500">Garantia até</span>
                <span className="text-green-600">{formatDate(job.guarantee_until)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Avaliar Serviço"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Como foi sua experiência com {job.pro?.name}?
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Avaliação Geral
            </label>
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= reviewRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Detalhamento</p>
            {renderSelectableStars(reviewPunctuality, setReviewPunctuality, 'Pontualidade')}
            {renderSelectableStars(reviewQuality, setReviewQuality, 'Qualidade do serviço')}
            {renderSelectableStars(reviewFriendliness, setReviewFriendliness, 'Cordialidade')}
          </div>

          <Textarea
            label="Comentário (opcional)"
            placeholder="Conte como foi sua experiência..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowReviewModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Avaliação'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
