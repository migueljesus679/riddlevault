import mongoose, { Schema } from 'mongoose';

const oauthTokenSchema = new Schema({
  platform: { type: String, required: true, unique: true },
  accessToken: {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    keyVersion: { type: Number, default: 1 },
  },
  refreshToken: {
    ciphertext: String,
    iv: String,
    authTag: String,
    keyVersion: Number,
  },
  expiresAt: { type: Date },
  scopes: [{ type: String }],
  email: { type: String },
}, { timestamps: true });

export const OAuthToken = mongoose.model('OAuthToken', oauthTokenSchema);
