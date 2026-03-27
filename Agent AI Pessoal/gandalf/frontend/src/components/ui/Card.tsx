import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-midnight-blue/80 border border-gold/15 rounded-xl p-5
        shadow-[0_4px_20px_rgba(13,13,13,0.6)]
        ${hover ? 'animate-breathe hover:border-gold/40 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] transition-all duration-500 cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
