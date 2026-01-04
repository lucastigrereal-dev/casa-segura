import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Loading({ size = 'md', className = '' }: LoadingProps) {
  return (
    <Loader2 className={`animate-spin text-primary-600 ${sizes[size]} ${className}`} />
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" />
        <p className="text-gray-500">Carregando...</p>
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
      <Loading size="lg" />
    </div>
  );
}
