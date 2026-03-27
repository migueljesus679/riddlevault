import { oauthService, type OAuthConfig } from './oauth.service.js';

const OUTLOOK_CONFIG: OAuthConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/integrations/microsoft/callback',
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scopes: ['Mail.Read', 'Mail.Send', 'User.Read', 'offline_access'],
};

export class OutlookService {
  getConfig() { return OUTLOOK_CONFIG; }

  async getAuthUrl(state: string) {
    return oauthService.getAuthUrl(OUTLOOK_CONFIG, state);
  }

  async handleCallback(code: string) {
    const tokens = await oauthService.exchangeCode(OUTLOOK_CONFIG, code);
    const profile = await this.getProfile(tokens.accessToken);
    tokens.email = profile.mail || profile.userPrincipalName;
    await oauthService.saveTokens('outlook', tokens);
    return { email: tokens.email };
  }

  private async getProfile(accessToken: string) {
    const res = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json() as Promise<{ mail: string; userPrincipalName: string }>;
  }

  async listMessages(top = 10) {
    const token = await oauthService.getAccessToken('outlook', OUTLOOK_CONFIG);
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/messages?$top=${top}&$orderby=receivedDateTime desc`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to list messages');
    return res.json();
  }

  async sendMessage(to: string, subject: string, body: string) {
    const token = await oauthService.getAccessToken('outlook', OUTLOOK_CONFIG);
    const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'Text', content: body },
          toRecipients: [{ emailAddress: { address: to } }],
        },
      }),
    });
    if (!res.ok) throw new Error('Failed to send message');
  }
}

export const outlookService = new OutlookService();
