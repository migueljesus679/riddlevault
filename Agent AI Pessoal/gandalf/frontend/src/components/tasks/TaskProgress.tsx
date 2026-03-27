import { useEffect, useRef } from 'react';
import { Card, Badge } from '../ui';
import type { TaskItem } from '../../stores/taskStore';
import { useTaskStore } from '../../stores/taskStore';

interface TaskProgressProps {
  task: TaskItem;
}

const stepStatusConfig = {
  pending: { color: 'text-mithril/40', bg: 'bg-mithril/10', label: 'Pendente' },
  running: { color: 'text-gold', bg: 'bg-gold/15', label: 'Em curso' },
  completed: { color: 'text-green-400', bg: 'bg-green-900/20', label: 'Concluido' },
  failed: { color: 'text-red-400', bg: 'bg-red-900/20', label: 'Falhou' },
};

export default function TaskProgress({ task }: TaskProgressProps) {
  const pollTask = useTaskStore(s => s.pollTask);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (task.status === 'RUNNING') {
      intervalRef.current = setInterval(() => pollTask(task._id), 2000);
      return () => clearInterval(intervalRef.current);
    }
  }, [task.status, task._id, pollTask]);

  const completedSteps = task.plan.steps.filter(s => s.status === 'completed').length;
  const totalSteps = task.plan.steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel text-lg text-gold">Progresso</h3>
        <span className="font-crimson text-sm text-mithril/60">{completedSteps}/{totalSteps} passos</span>
      </div>

      <div className="w-full bg-shadow-black/40 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {task.plan.steps.map((step, i) => {
          const cfg = stepStatusConfig[step.status];
          return (
            <div key={step.stepId} className={`flex gap-3 items-start p-3 rounded-lg ${cfg.bg} transition-all duration-300`}>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                step.status === 'running' ? 'border-gold animate-pulse' :
                step.status === 'completed' ? 'border-green-500' :
                step.status === 'failed' ? 'border-red-500' : 'border-mithril/30'
              }`}>
                {step.status === 'completed' && <span className="text-green-400 text-xs">&#10003;</span>}
                {step.status === 'failed' && <span className="text-red-400 text-xs">&#10007;</span>}
                {step.status === 'running' && <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />}
                {step.status === 'pending' && <span className="text-mithril/30 text-xs">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-cinzel text-sm ${cfg.color}`}>{step.title}</p>
                  <Badge variant={step.status === 'completed' ? 'success' : step.status === 'failed' ? 'error' : step.status === 'running' ? 'warning' : 'default'}>
                    {cfg.label}
                  </Badge>
                </div>
                {step.result && (
                  <p className="font-crimson text-xs text-mithril/50 mt-1 line-clamp-2">{step.result}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
