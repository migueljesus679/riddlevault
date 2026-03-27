import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const messageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new Schema({
  title: { type: String, default: 'Nova conversa' },
  messages: [messageSchema],
  provider: { type: String, default: 'openai' },
  aiModel: { type: String, default: 'gpt-4o-mini' },
}, { timestamps: true });

export type IMessage = InferSchemaType<typeof messageSchema>;
export type IConversation = mongoose.InferSchemaType<typeof conversationSchema> & { _id: mongoose.Types.ObjectId };

export const Conversation = mongoose.model('Conversation', conversationSchema);
