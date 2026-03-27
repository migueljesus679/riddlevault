import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-shadow-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-brown border border-gold/30 rounded-2xl p-6 max-w-lg w-full mx-4
        shadow-[0_0_40px_rgba(201,168,76,0.15)] animate-fade-slide-in">
        {title && (
          <h2 className="font-cinzel text-xl text-gold mb-4 pb-3 border-b border-gold/15">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
