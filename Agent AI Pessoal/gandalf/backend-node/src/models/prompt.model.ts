import mongoose, { Schema } from 'mongoose';

const promptSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Geral' },
  tags: [{ type: String }],
  variables: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

promptSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Prompt = mongoose.model('Prompt', promptSchema);
