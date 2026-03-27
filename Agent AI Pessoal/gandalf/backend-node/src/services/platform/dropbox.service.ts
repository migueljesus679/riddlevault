import { oauthService, type OAuthConfig } from './oauth.service.js';

const DROPBOX_CONFIG: OAuthConfig = {
  clientId: process.env.DROPBOX_CLIENT_ID || '',
  clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
  redirectUri: process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3001/integrations/dropbox/callback',
  authUrl: 'https://www.dropbox.com/oauth2/authorize',
  tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
  scopes: [],
};

export class DropboxService {
  getConfig() { return DROPBOX_CONFIG; }

  async getAuthUrl(state: string) {
    return oauthService.getAuthUrl(DROPBOX_CONFIG, state);
  }

  async handleCallback(code: string) {
    const tokens = await oauthService.exchangeCode(DROPBOX_CONFIG, code);
    const profile = await this.getProfile(tokens.accessToken);
    tokens.email = profile.email;
    await oauthService.saveTokens('dropbox', tokens);
    return { email: profile.email };
  }

  private async getProfile(accessToken: string) {
    const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json() as Promise<{ email: string }>;
  }

  async listFiles(path = '') {
    const token = await oauthService.getAccessToken('dropbox', DROPBOX_CONFIG);
    const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path || '', limit: 50 }),
    });
    if (!res.ok) throw new Error('Failed to list files');
    const data = await res.json() as { entries: unknown[] };
    return data.entries;
  }

  async uploadFile(path: string, content: Uint8Array) {
    const token = await oauthService.getAccessToken('dropbox', DROPBOX_CONFIG);
    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', autorename: true }),
      },
      body: content as unknown as BodyInit,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }
}

export const dropboxService = new DropboxService();
