import { Prompt } from '../models/prompt.model.js';

export class PromptService {
  async list(filters?: { category?: string; search?: string; favorite?: boolean }) {
    const query: Record<string, unknown> = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.favorite) query.isFavorite = true;
    if (filters?.search) query.$text = { $search: filters.search };
    return Prompt.find(query).sort({ updatedAt: -1 }).lean();
  }

  async getById(id: string) {
    return Prompt.findById(id).lean();
  }

  async create(data: { title: string; content: string; category?: string; tags?: string[]; variables?: string[] }) {
    const variables = this.extractVariables(data.content);
    return Prompt.create({ ...data, variables });
  }

  async update(id: string, data: Partial<{ title: string; content: string; category: string; tags: string[]; isFavorite: boolean }>) {
    const updates: Record<string, unknown> = { ...data };
    if (data.content) updates.variables = this.extractVariables(data.content);
    return Prompt.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async delete(id: string) {
    await Prompt.findByIdAndDelete(id);
  }

  async toggleFavorite(id: string) {
    const prompt = await Prompt.findById(id);
    if (!prompt) return null;
    prompt.isFavorite = !prompt.isFavorite;
    await prompt.save();
    return prompt.toObject();
  }

  private extractVariables(content: string): string[] {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.slice(2, -2)))];
  }
}

export const promptService = new PromptService();
