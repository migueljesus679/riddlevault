interface ProgressBarProps {
  solved: number;
  total: number;
  color?: string;
}

export default function ProgressBar({ solved, total, color = 'bg-green-neon' }: ProgressBarProps) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
        <span>{solved}/{total} solved</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
