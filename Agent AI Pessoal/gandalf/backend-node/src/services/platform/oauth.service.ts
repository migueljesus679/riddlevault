import { OAuthToken } from '../../models/oauthToken.model.js';
import { encrypt, decrypt, type EncryptedData } from '../encryption.service.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  email?: string;
}

export class OAuthService {
  async getAuthUrl(config: OAuthConfig, state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `${config.authUrl}?${params.toString()}`;
  }

  async exchangeCode(config: OAuthConfig, code: string): Promise<TokenData> {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      accessToken: data.access_token as string,
      refreshToken: data.refresh_token as string | undefined,
      expiresIn: data.expires_in as number | undefined,
    };
  }

  async refreshAccessToken(config: OAuthConfig, refreshToken: string): Promise<TokenData> {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json() as Record<string, unknown>;
    return {
      accessToken: data.access_token as string,
      refreshToken: (data.refresh_token as string | undefined) || refreshToken,
      expiresIn: data.expires_in as number | undefined,
    };
  }

  async saveTokens(platform: string, tokens: TokenData): Promise<void> {
    const accessEncrypted = encrypt(tokens.accessToken);
    const refreshEncrypted = tokens.refreshToken ? encrypt(tokens.refreshToken) : undefined;
    const expiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : undefined;

    await OAuthToken.findOneAndUpdate(
      { platform },
      {
        platform,
        accessToken: accessEncrypted,
        refreshToken: refreshEncrypted,
        expiresAt,
        email: tokens.email,
      },
      { upsert: true, new: true }
    );
  }

  async getAccessToken(platform: string, config: OAuthConfig): Promise<string> {
    const stored = await OAuthToken.findOne({ platform }).lean();
    if (!stored) throw new Error(`No tokens for ${platform}`);

    const accessToken = decrypt(stored.accessToken as unknown as EncryptedData);

    if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
      if (!stored.refreshToken?.ciphertext) throw new Error(`Token expired and no refresh token for ${platform}`);
      const refreshToken = decrypt(stored.refreshToken as unknown as EncryptedData);
      const newTokens = await this.refreshAccessToken(config, refreshToken);
      await this.saveTokens(platform, newTokens);
      return newTokens.accessToken;
    }

    return accessToken;
  }

  async isConnected(platform: string): Promise<boolean> {
    const token = await OAuthToken.findOne({ platform }).lean();
    return !!token;
  }

  async disconnect(platform: string): Promise<void> {
    await OAuthToken.findOneAndDelete({ platform });
  }

  async listConnected(): Promise<Array<{ platform: string; email?: string; connectedAt?: string }>> {
    const tokens = await OAuthToken.find().lean();
    return tokens.map(t => ({
      platform: t.platform,
      email: t.email || undefined,
      connectedAt: (t as any).createdAt?.toISOString(),
    }));
  }
}

export const oauthService = new OAuthService();
