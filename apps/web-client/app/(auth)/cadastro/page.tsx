'use client';

import Link from 'next/link';
import { FormCadastro } from '@/components/forms/form-cadastro';

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600">
            Casa Segura
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              entre com sua conta existente
            </Link>
          </p>
        </div>
        <FormCadastro />
      </div>
    </div>
  );
}
