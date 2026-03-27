import { Task } from '../models/task.model.js';
import { providerRegistry } from './ai/provider.registry.js';

export class TaskService {
  async list() {
    return Task.find().sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    return Task.findById(id);
  }

  async create(title: string, description: string) {
    const task = await Task.create({
      title,
      description,
      status: 'DRAFT_PLAN',
      plan: { steps: [] },
      executionLog: [],
    });
    return task;
  }

  async generatePlan(taskId: string, onProgress?: (event: string, data: unknown) => void) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'DRAFT_PLAN') throw new Error('Task is not in DRAFT_PLAN status');

    onProgress?.('task:planning', { taskId, message: 'A gerar plano...' });

    try {
      const ai = providerRegistry.get();
      const prompt = `You are a task planner. Given this task, create a step-by-step execution plan.
Task: ${task.title}
Description: ${task.description}

Respond with a JSON array of steps. Each step has: "title" (string) and "description" (string).
Example: [{"title":"Step 1","description":"Do this first"},{"title":"Step 2","description":"Then do this"}]
Respond ONLY with the JSON array, no other text.`;

      const response = await ai.sendMessage(
        [{ role: 'user', content: prompt }],
        { model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 2048 }
      );

      let steps: Array<{ title: string; description: string }> = [];
      try {
        const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        steps = JSON.parse(cleaned);
      } catch {
        steps = [{ title: 'Passo 1', description: response.slice(0, 200) }];
      }

      task.set('plan', {
        steps: steps.map((s, i) => ({
          stepId: `step-${i + 1}`,
          title: s.title,
          description: s.description,
          status: 'pending',
        })),
      });
      task.status = 'WAITING_APPROVAL';
      await task.save();

      onProgress?.('task:plan-ready', { taskId, plan: task.plan });
      return task;
    } catch (err) {
      task.status = 'FAILED';
      task.executionLog.push(`Plan generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      await task.save();
      onProgress?.('task:failed', { taskId, error: 'Plan generation failed' });
      throw err;
    }
  }

  async approvePlan(taskId: string, approved: boolean, comment?: string) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'WAITING_APPROVAL') throw new Error('Task is not waiting for approval');

    task.approval = { approved, approvedAt: new Date(), comment: comment || '' };

    if (approved) {
      task.status = 'RUNNING';
    } else {
      task.status = 'CANCELLED';
    }
    await task.save();
    return task;
  }

  async executeTask(taskId: string, onProgress?: (event: string, data: unknown) => void) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'RUNNING') throw new Error('Task is not in RUNNING status');

    const steps = task.plan?.steps || [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      step.status = 'running';
      step.startedAt = new Date();
      await task.save();
      onProgress?.('task:step-started', { taskId, stepId: step.stepId, stepIndex: i, title: step.title });

      try {
        const ai = providerRegistry.get();
        const result = await ai.sendMessage(
          [{ role: 'user', content: `Execute this task step and provide the result:\n\nTask: ${task.title}\nStep: ${step.title}\nDescription: ${step.description}\n\nProvide a concise result of executing this step.` }],
          { model: 'gpt-4o-mini', temperature: 0.5, maxTokens: 1024 }
        );

        step.status = 'completed';
        step.result = result;
        step.completedAt = new Date();
        task.executionLog.push(`Step "${step.title}" completed`);
        await task.save();
        onProgress?.('task:step-completed', { taskId, stepId: step.stepId, stepIndex: i, result });
      } catch (err) {
        step.status = 'failed';
        step.result = err instanceof Error ? err.message : 'Failed';
        step.completedAt = new Date();
        task.status = 'FAILED';
        task.executionLog.push(`Step "${step.title}" failed: ${step.result}`);
        await task.save();
        onProgress?.('task:failed', { taskId, stepId: step.stepId, error: step.result });
        return task;
      }
    }

    task.status = 'WAITING_FINAL_REVIEW';
    task.executionLog.push('All steps completed, waiting for review');
    await task.save();
    onProgress?.('task:review-ready', { taskId });
    return task;
  }

  async finalReview(taskId: string, approved: boolean, comment?: string) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'WAITING_FINAL_REVIEW') throw new Error('Task is not waiting for final review');

    if (approved) {
      task.status = 'DONE';
      task.completedAt = new Date();
      task.result = comment || 'Approved';
    } else {
      task.status = 'RUNNING';
      task.executionLog.push(`Review rejected: ${comment || 'No comment'}`);
    }
    await task.save();
    return task;
  }

  async delete(id: string) {
    await Task.findByIdAndDelete(id);
  }
}

export const taskService = new TaskService();
