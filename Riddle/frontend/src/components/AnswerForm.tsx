import { useState } from 'react';
import { FiSend, FiEye, FiEyeOff } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';

interface AnswerFormProps {
  onSubmit: (answer: string) => Promise<void>;
  hint: string;
  disabled?: boolean;
  solved?: boolean;
}

export default function AnswerForm({ onSubmit, hint, disabled, solved }: AnswerFormProps) {
  const { t } = useLang();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || loading || disabled) return;
    setLoading(true);
    try {
      await onSubmit(answer.trim());
      setAnswer('');
    } finally {
      setLoading(false);
    }
  }

  if (solved) {
    return (
      <div className="mt-6 text-center py-8">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-green-neon font-mono font-bold text-xl">SOLVED</p>
        <p className="text-gray-400 text-sm mt-1 font-mono">{t.riddle.alreadySolved}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={t.riddle.yourAnswer}
          className="input-field"
          disabled={disabled || loading}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={!answer.trim() || loading || disabled}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <span className="animate-spin inline-block">⟳</span>
          ) : (
            <><FiSend /> {t.riddle.submitAnswer}</>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setShowHint(!showHint)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-400 font-mono transition-colors"
      >
        {showHint ? <FiEyeOff /> : <FiEye />}
        {showHint ? t.riddle.hideHint : t.riddle.showHint}
      </button>

      {showHint && (
        <div className="bg-amber-900/10 border border-amber-600/30 rounded-lg p-4 animate-fade-in">
          <p className="text-amber-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">{hint}</p>
        </div>
      )}
    </div>
  );
}
