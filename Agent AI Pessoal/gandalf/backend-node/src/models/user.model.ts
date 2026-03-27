import mongoose, { Schema } from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  isSetup: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.statics.hashPassword = function (password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
};

export const User = mongoose.model('User', userSchema);
