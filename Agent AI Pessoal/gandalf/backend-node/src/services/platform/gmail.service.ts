import { oauthService, type OAuthConfig } from './oauth.service.js';

const GMAIL_CONFIG: OAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/integrations/google/callback',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'],
};

export class GmailService {
  getConfig() { return GMAIL_CONFIG; }

  async getAuthUrl(state: string) {
    return oauthService.getAuthUrl(GMAIL_CONFIG, state);
  }

  async handleCallback(code: string) {
    const tokens = await oauthService.exchangeCode(GMAIL_CONFIG, code);
    const profile = await this.getProfile(tokens.accessToken);
    tokens.email = profile.email;
    await oauthService.saveTokens('gmail', tokens);
    return { email: profile.email };
  }

  private async getProfile(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json() as Promise<{ email: string }>;
  }

  async listMessages(maxResults = 10) {
    const token = await oauthService.getAccessToken('gmail', GMAIL_CONFIG);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to list messages');
    const data = await res.json() as { messages?: Array<{ id: string }> };
    return data.messages || [];
  }

  async getMessage(messageId: string) {
    const token = await oauthService.getAccessToken('gmail', GMAIL_CONFIG);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to get message');
    return res.json();
  }

  async sendMessage(to: string, subject: string, body: string) {
    const token = await oauthService.getAccessToken('gmail', GMAIL_CONFIG);
    const raw = btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`)
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
}

export const gmailService = new GmailService();
