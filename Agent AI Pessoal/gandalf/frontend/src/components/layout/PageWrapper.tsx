import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <main className="ml-64 min-h-screen p-8 animate-fade-slide-in">
      {children}
    </main>
  );
}
