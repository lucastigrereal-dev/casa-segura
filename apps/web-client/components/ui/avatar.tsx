import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  if (name) {
    return (
      <div
        className={`rounded-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center ${sizes[size]} ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-gray-100 text-gray-500 flex items-center justify-center ${sizes[size]} ${className}`}
    >
      <User className={iconSizes[size]} />
    </div>
  );
}
