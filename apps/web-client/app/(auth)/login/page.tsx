'use client';

import Link from 'next/link';
import { FormLogin } from '@/components/forms/form-login';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600">
            Casa Segura
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/cadastro"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              crie uma conta gratuita
            </Link>
          </p>
        </div>
        <FormLogin />
      </div>
    </div>
  );
}
