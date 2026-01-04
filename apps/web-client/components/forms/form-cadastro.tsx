'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { User, Mail, Phone, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function FormCadastro() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Nome deve ter no minimo 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email obrigatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }

    const phoneNumbers = unformatPhone(formData.phone);
    if (!phoneNumbers || phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      newErrors.phone = 'Telefone invalido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha obrigatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no minimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas nao conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: unformatPhone(formData.phone),
        password: formData.password,
        role: isProfessional ? 'PROFESSIONAL' : 'CLIENT',
      });

      toast.success('Conta criada', `Bem-vindo, ${user.name}!`);
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      setErrors({ general: message });
      toast.error('Erro no cadastro', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {errors.general && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              className="pl-10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="(54) 99999-9999"
              className="pl-10"
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              disabled={isLoading}
              maxLength={15}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              className="pl-10"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Professional Option */}
        <div
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            isProfessional
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setIsProfessional(!isProfessional)}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isProfessional}
              onChange={(e) => setIsProfessional(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-gray-900">Sou profissional</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Quero oferecer meus servicos na plataforma
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-primary-600 mt-1"
          required
        />
        <span className="ml-2 text-sm text-gray-600">
          Li e aceito os{' '}
          <a href="/termos" className="text-primary-600 hover:underline">
            Termos de Uso
          </a>{' '}
          e a{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">
            Politica de Privacidade
          </a>
        </span>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  );
}
