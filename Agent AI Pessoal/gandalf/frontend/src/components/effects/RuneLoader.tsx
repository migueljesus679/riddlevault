export default function RuneLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-20 h-20' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`absolute inset-0 border-2 border-gold/30 rounded-full animate-rune-spin`} />
        <div className={`absolute inset-1 border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-rune-spin`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-gold ${textSizes[size]} font-cinzel`}>G</span>
        </div>
      </div>
    </div>
  );
}
