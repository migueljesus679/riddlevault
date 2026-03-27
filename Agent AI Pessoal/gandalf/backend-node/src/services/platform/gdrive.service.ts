import { oauthService, type OAuthConfig } from './oauth.service.js';

const GDRIVE_CONFIG: OAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/integrations/google/callback',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'],
};

export class GDriveService {
  getConfig() { return GDRIVE_CONFIG; }

  async listFiles(maxResults = 20) {
    const token = await oauthService.getAccessToken('gmail', GDRIVE_CONFIG);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&fields=files(id,name,mimeType,size,modifiedTime)`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to list files');
    const data = await res.json() as { files: unknown[] };
    return data.files;
  }

  async uploadFile(filename: string, content: Buffer, mimeType: string) {
    const token = await oauthService.getAccessToken('gmail', GDRIVE_CONFIG);
    const metadata = JSON.stringify({ name: filename });
    const boundary = '---gandalf-upload';
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n${content.toString('base64')}\r\n--${boundary}--`;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }

  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    const token = await oauthService.getAccessToken('gmail', GDRIVE_CONFIG);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to download file');
    return res.arrayBuffer();
  }
}

export const gdriveService = new GDriveService();
