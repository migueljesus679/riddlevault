import { Card, Badge, Button } from '../ui';
import type { TaskItem } from '../../stores/taskStore';

interface TaskPlanViewProps {
  task: TaskItem;
  onApprove: () => void;
  onReject: () => void;
}

export default function TaskPlanView({ task, onApprove, onReject }: TaskPlanViewProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel text-xl text-gold">Plano de Execucao</h3>
        <Badge variant="warning">Aguarda Aprovacao</Badge>
      </div>

      <div className="space-y-3">
        {task.plan.steps.map((step, i) => (
          <div key={step.stepId} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="font-cinzel text-sm text-gold">{i + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-cinzel text-sm text-parchment">{step.title}</p>
              {step.description && (
                <p className="font-crimson text-xs text-mithril/60 mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gold/15">
        <Button onClick={onApprove} className="flex-1">
          Aprovar e Executar
        </Button>
        <Button variant="danger" onClick={onReject} className="flex-1">
          Rejeitar
        </Button>
      </div>
    </Card>
  );
}
