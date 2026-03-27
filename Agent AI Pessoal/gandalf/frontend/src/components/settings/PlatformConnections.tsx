import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../ui';
import { api } from '../../services/api';

interface Connection {
  platform: string;
  email?: string;
  connectedAt?: string;
}

const PLATFORMS = [
  { id: 'gmail', name: 'Gmail', icon: '📧', provider: 'google' },
  { id: 'outlook', name: 'Outlook', icon: '📨', provider: 'microsoft' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', provider: 'dropbox' },
];

export default function PlatformConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data = await api.get<{ connected: Connection[] }>('/integrations/status');
      setConnections(data.connected);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleConnect = async (provider: string) => {
    setLoading(true);
    try {
      const data = await api.get<{ url: string }>(`/integrations/${provider}/authorize`);
      window.location.href = data.url;
    } catch { setLoading(false); }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      await api.post(`/integrations/${platform}/disconnect`, {});
      await load();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-cinzel text-xl text-gold">Plataformas</h2>
      {PLATFORMS.map(plat => {
        const conn = connections.find(c => c.platform === plat.id);
        return (
          <Card key={plat.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{plat.icon}</span>
              <div>
                <h3 className="font-cinzel text-base text-parchment">{plat.name}</h3>
                {conn && (
                  <p className="font-crimson text-xs text-mithril/60">{conn.email || 'Conectado'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {conn ? (
                <>
                  <Badge variant="success">Conectado</Badge>
                  <Button size="sm" variant="danger" onClick={() => handleDisconnect(plat.id)}>
                    Desligar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => handleConnect(plat.provider)} disabled={loading}>
                  Conectar
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
