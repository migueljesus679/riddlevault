import crypto from 'node:crypto';
import { User } from '../models/user.model.js';

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

function signJwt(payload: Record<string, unknown>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change-me-generate-with-script') {
    throw new Error('JWT_SECRET not configured');
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string): Record<string, unknown> | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const signature = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if (signature !== parts[2]) return null;
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export class AuthService {
  async isSetup(): Promise<boolean> {
    const count = await User.countDocuments();
    return count > 0;
  }

  async setup(username: string, password: string): Promise<string> {
    const existing = await User.countDocuments();
    if (existing > 0) throw new Error('Already setup');
    const { hash, salt } = hashPassword(password);
    const user = await User.create({ username, passwordHash: hash, salt, isSetup: true });
    return signJwt({ userId: user._id.toString(), username });
  }

  async login(username: string, password: string): Promise<string> {
    const user = await User.findOne({ username });
    if (!user) throw new Error('Invalid credentials');
    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) throw new Error('Invalid credentials');
    return signJwt({ userId: user._id.toString(), username });
  }

  verifyToken(token: string): Record<string, unknown> | null {
    return verifyJwt(token);
  }
}

export const authService = new AuthService();
