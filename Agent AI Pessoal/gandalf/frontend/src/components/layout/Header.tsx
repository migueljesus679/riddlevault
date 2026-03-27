interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-cinzel text-3xl text-gold">{title}</h1>
      {subtitle && (
        <p className="font-crimson text-mithril/70 mt-1">{subtitle}</p>
      )}
      <div className="mt-3 h-px bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />
    </header>
  );
}
