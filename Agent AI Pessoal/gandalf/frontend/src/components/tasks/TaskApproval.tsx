import { useState } from 'react';
import { Card, Button, Textarea } from '../ui';
import type { TaskItem } from '../../stores/taskStore';

interface TaskApprovalProps {
  task: TaskItem;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
}

export default function TaskApproval({ task, onApprove, onReject }: TaskApprovalProps) {
  const [comment, setComment] = useState('');

  return (
    <Card className="space-y-4 border-2 border-gold/30">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center">
          <span className="text-2xl">&#9978;</span>
        </div>
        <h3 className="font-cinzel text-xl text-gold">Revisao Final</h3>
        <p className="font-crimson text-sm text-mithril/60 mt-1">
          Todos os passos foram executados. Revisa o resultado antes de concluir.
        </p>
      </div>

      <div className="bg-shadow-black/20 rounded-lg p-4">
        <h4 className="font-cinzel text-sm text-gold/80 mb-2">Resultado dos passos:</h4>
        {task.plan.steps.map((step) => (
          <div key={step.stepId} className="mb-2 last:mb-0">
            <p className="font-cinzel text-xs text-parchment/80">{step.title}</p>
            {step.result && (
              <p className="font-crimson text-xs text-mithril/50 mt-0.5">{step.result}</p>
            )}
          </div>
        ))}
      </div>

      <Textarea
        label="Comentario (opcional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Adiciona um comentario..."
        className="min-h-[80px]"
      />

      <div className="flex gap-3">
        <Button onClick={() => onApprove(comment)} className="flex-1">
          Aprovar e Concluir
        </Button>
        <Button variant="danger" onClick={() => onReject(comment)} className="flex-1">
          Rejeitar (Re-executar)
        </Button>
      </div>
    </Card>
  );
}
