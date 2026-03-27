import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-gold text-dark-brown hover:bg-gold/90 btn-gold-glow',
  secondary: 'bg-midnight-blue border border-gold/30 text-parchment hover:border-gold/60',
  ghost: 'text-parchment hover:bg-parchment/10',
  danger: 'bg-red-900/60 border border-red-700/40 text-parchment hover:bg-red-900/80',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`font-cinzel font-semibold rounded-lg transition-all duration-300 
        ${variants[variant]} ${sizes[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
