import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-cinzel text-sm text-gold">{label}</label>}
      <input
        ref={ref}
        className={`bg-midnight-blue border border-gold/20 rounded-lg px-4 py-2.5 
          text-parchment font-crimson placeholder:text-mithril/40
          focus:outline-none focus:border-gold/60 focus:shadow-[0_0_10px_rgba(201,168,76,0.15)]
          transition-all duration-300 ${error ? 'border-red-700/60' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-red-400 text-sm font-crimson">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
