import { oauthService, type OAuthConfig } from './oauth.service.js';

const ONEDRIVE_CONFIG: OAuthConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/integrations/microsoft/callback',
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scopes: ['Files.ReadWrite', 'User.Read', 'offline_access'],
};

export class OneDriveService {
  getConfig() { return ONEDRIVE_CONFIG; }

  async listFiles(path = '/') {
    const token = await oauthService.getAccessToken('outlook', ONEDRIVE_CONFIG);
    const endpoint = path === '/' ? 'https://graph.microsoft.com/v1.0/me/drive/root/children' : `https://graph.microsoft.com/v1.0/me/drive/root:${path}:/children`;
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to list files');
    const data = await res.json() as { value: unknown[] };
    return data.value;
  }

  async uploadFile(filename: string, content: Uint8Array) {
    const token = await oauthService.getAccessToken('outlook', ONEDRIVE_CONFIG);
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
      body: content as unknown as BodyInit,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }
}

export const onedriveService = new OneDriveService();
