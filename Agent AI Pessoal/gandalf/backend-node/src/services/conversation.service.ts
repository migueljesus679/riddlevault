import { Conversation } from '../models/conversation.model.js';

export class ConversationService {
  async list() {
    return Conversation.find().sort({ updatedAt: -1 }).lean();
  }

  async getById(id: string) {
    return Conversation.findById(id);
  }

  async create(title?: string) {
    return Conversation.create({ title: title || 'Nova conversa', messages: [] });
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: { role, content, timestamp: new Date() } } },
      { new: true }
    );
  }

  async updateTitle(id: string, title: string) {
    return Conversation.findByIdAndUpdate(id, { title }, { new: true });
  }

  async delete(id: string): Promise<void> {
    await Conversation.findByIdAndDelete(id);
  }
}

export const conversationService = new ConversationService();
