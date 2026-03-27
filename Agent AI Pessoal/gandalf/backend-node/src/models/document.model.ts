import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema({
  fileId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  processing: { type: Schema.Types.Mixed },
  analysis: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const DocumentModel = mongoose.model('Document', documentSchema);
