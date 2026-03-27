import mongoose, { Schema } from 'mongoose';

const apiKeySchema = new Schema({
  provider: { type: String, required: true, unique: true },
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  keyVersion: { type: Number, default: 1 },
}, { timestamps: true });

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
