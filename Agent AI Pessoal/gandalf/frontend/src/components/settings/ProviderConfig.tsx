import { useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button, Card, Badge } from '../ui';

export default function ProviderConfig() {
  const { providers, loadProviders, setActiveProvider } = useSettingsStore();

  useEffect(() => { loadProviders(); }, [loadProviders]);

  return (
    <div className="space-y-4">
      <h2 className="font-cinzel text-xl text-gold">Provider Ativo</h2>
      {providers.registered.length === 0 ? (
        <p className="font-crimson text-mithril/50 italic">Nenhum provider registado. Adiciona uma chave API primeiro.</p>
      ) : (
        <div className="space-y-2">
          {providers.registered.map((p) => (
            <Card key={p} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-cinzel text-parchment capitalize">{p}</span>
                {providers.active === p && <Badge variant="success">Ativo</Badge>}
              </div>
              {providers.active !== p && (
                <Button size="sm" variant="secondary" onClick={() => setActiveProvider(p)}>
                  Ativar
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
