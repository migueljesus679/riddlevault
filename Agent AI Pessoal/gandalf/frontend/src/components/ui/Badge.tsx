import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variants = {
  default: 'bg-gold/15 text-gold border-gold/30',
  success: 'bg-green-900/30 text-green-400 border-green-700/30',
  warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  error: 'bg-red-900/30 text-red-400 border-red-700/30',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-cinzel border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
