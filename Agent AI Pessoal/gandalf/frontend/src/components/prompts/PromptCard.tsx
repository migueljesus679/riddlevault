import { Card, Badge, Button } from '../ui';
import type { Prompt } from '../../stores/promptStore';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUse: () => void;
}

export default function PromptCard({ prompt, onEdit, onDelete, onToggleFavorite, onUse }: PromptCardProps) {
  return (
    <Card hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel text-lg text-gold truncate">{prompt.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{prompt.category}</Badge>
            {prompt.isFavorite && <Badge variant="warning">Favorito</Badge>}
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className={`text-xl transition-colors ${prompt.isFavorite ? 'text-gold' : 'text-mithril/30 hover:text-gold/60'}`}
        >
          {prompt.isFavorite ? '\u2605' : '\u2606'}
        </button>
      </div>

      <p className="font-crimson text-parchment/70 text-sm line-clamp-3 whitespace-pre-wrap">{prompt.content}</p>

      {prompt.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {prompt.tags.map(t => <Badge key={t} variant="default">{t}</Badge>)}
        </div>
      )}

      {prompt.variables.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {prompt.variables.map(v => <Badge key={v} variant="success">{`{{${v}}}`}</Badge>)}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-gold/10">
        <Button size="sm" onClick={onUse}>Usar</Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>Editar</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Eliminar</Button>
      </div>
    </Card>
  );
}
