import { useState, useEffect } from 'react';
import { PageWrapper, Header } from '../components/layout';
import { TaskPlanView, TaskProgress, TaskApproval } from '../components/tasks';
import { Button, Card, Badge, Input, Textarea, Modal } from '../components/ui';
import { useTaskStore, type TaskStatus } from '../stores/taskStore';

const statusLabels: Record<TaskStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  DRAFT_PLAN: { label: 'Rascunho', variant: 'default' },
  WAITING_APPROVAL: { label: 'Aguarda Aprovacao', variant: 'warning' },
  RUNNING: { label: 'Em Execucao', variant: 'warning' },
  WAITING_FINAL_REVIEW: { label: 'Aguarda Revisao', variant: 'warning' },
  DONE: { label: 'Concluida', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'error' },
  CANCELLED: { label: 'Cancelada', variant: 'error' },
};

export default function TasksPage() {
  const { tasks, activeTask, loading, loadTasks, loadTask, createTask, generatePlan, approvePlan, finalReview, deleteTask } = useTaskStore();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask(newTitle.trim(), newDesc.trim());
    setShowNew(false);
    setNewTitle('');
    setNewDesc('');
    const task = useTaskStore.getState().activeTask;
    if (task) await generatePlan(task._id);
  };

  return (
    <PageWrapper>
      <Header title="Missoes" subtitle="Tarefas e planos de execucao" />

      <div className="flex gap-6">
        <div className="w-80 flex-shrink-0 space-y-3">
          <Button onClick={() => setShowNew(true)} className="w-full">Nova Missao</Button>
          {tasks.map(task => {
            const cfg = statusLabels[task.status];
            return (
              <Card
                key={task._id}
                hover
                className={`cursor-pointer ${activeTask?._id === task._id ? 'border-gold/50' : ''}`}
                onClick={() => loadTask(task._id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-cinzel text-sm text-parchment truncate flex-1">{task.title}</h4>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <p className="font-crimson text-xs text-mithril/40 mt-1">
                  {new Date(task.createdAt).toLocaleDateString('pt-PT')}
                </p>
              </Card>
            );
          })}
          {tasks.length === 0 && !loading && (
            <p className="font-crimson text-mithril/40 text-center italic py-8">Nenhuma missao ainda.</p>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {!activeTask && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">&#9876;&#65039;</span>
              <p className="font-cinzel text-xl text-gold/60">Seleciona uma missao</p>
              <p className="font-crimson text-mithril/40 mt-2">Ou cria uma nova para comecar.</p>
            </div>
          )}

          {activeTask && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-cinzel text-2xl text-gold">{activeTask.title}</h2>
                  {activeTask.description && (
                    <p className="font-crimson text-mithril/60 mt-1">{activeTask.description}</p>
                  )}
                </div>
                <Button size="sm" variant="danger" onClick={() => deleteTask(activeTask._id)}>Eliminar</Button>
              </div>

              {activeTask.status === 'WAITING_APPROVAL' && (
                <TaskPlanView
                  task={activeTask}
                  onApprove={() => approvePlan(activeTask._id, true)}
                  onReject={() => approvePlan(activeTask._id, false, 'Rejected by user')}
                />
              )}

              {(activeTask.status === 'RUNNING' || activeTask.status === 'DONE' || activeTask.status === 'FAILED') && (
                <TaskProgress task={activeTask} />
              )}

              {activeTask.status === 'WAITING_FINAL_REVIEW' && (
                <>
                  <TaskProgress task={activeTask} />
                  <TaskApproval
                    task={activeTask}
                    onApprove={(c) => finalReview(activeTask._id, true, c)}
                    onReject={(c) => finalReview(activeTask._id, false, c)}
                  />
                </>
              )}

              {activeTask.status === 'DONE' && (
                <Card className="border-2 border-green-700/30 text-center py-6">
                  <span className="text-4xl block mb-2">&#10003;</span>
                  <p className="font-cinzel text-lg text-green-400">Missao Concluida</p>
                </Card>
              )}

              {activeTask.executionLog.length > 0 && (
                <Card>
                  <h4 className="font-cinzel text-sm text-gold/80 mb-2">Registo de Execucao</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {activeTask.executionLog.map((log, i) => (
                      <p key={i} className="font-fira text-xs text-mithril/50">{log}</p>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nova Missao">
        <div className="space-y-4">
          <Input label="Titulo da missao" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Analisar relatorio trimestral..." />
          <Textarea label="Descricao (opcional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descreve o que pretendes..." className="min-h-[100px]" />
          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={!newTitle.trim() || loading}>
              {loading ? 'A criar...' : 'Criar e Planear'}
            </Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
