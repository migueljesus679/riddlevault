import mongoose, { Schema } from 'mongoose';

const taskStepSchema = new Schema({
  stepId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  result: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
});

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['DRAFT_PLAN', 'WAITING_APPROVAL', 'RUNNING', 'WAITING_FINAL_REVIEW', 'DONE', 'FAILED', 'CANCELLED'],
    default: 'DRAFT_PLAN',
  },
  plan: {
    steps: [taskStepSchema],
  },
  approval: {
    approved: { type: Boolean },
    approvedAt: { type: Date },
    comment: { type: String },
  },
  executionLog: [{ type: String }],
  result: { type: String },
  completedAt: { type: Date },
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
