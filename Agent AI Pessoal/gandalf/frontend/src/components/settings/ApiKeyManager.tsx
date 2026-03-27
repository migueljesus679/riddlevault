import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button, Input, Card } from '../ui';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
];

export default function ApiKeyManager() {
  const { apiKeys, loading, error, loadApiKeys, saveApiKey, deleteApiKey } = useSettingsStore();
  const [editProvider, setEditProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => { loadApiKeys(); }, [loadApiKeys]);

  const handleSave = async () => {
    if (!editProvider || !keyInput.trim()) return;
    await saveApiKey(editProvider, keyInput.trim());
    setEditProvider(null);
    setKeyInput('');
  };

  return (
    <div className="space-y-4">
      <h2 className="font-cinzel text-xl text-gold">Chaves API</h2>
      {error && <p className="text-red-400 font-crimson text-sm">{error}</p>}
      {PROVIDERS.map((prov) => {
        const stored = apiKeys.find(k => k.provider === prov.id);
        const isEditing = editProvider === prov.id;

        return (
          <Card key={prov.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-cinzel text-base text-parchment">{prov.name}</h3>
                {stored && !isEditing && (
                  <p className="font-fira text-sm text-mithril/60 mt-1">{stored.maskedKey}</p>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={loading}>Guardar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditProvider(null); setKeyInput(''); }}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => { setEditProvider(prov.id); setKeyInput(''); }}>
                      {stored ? 'Alterar' : 'Adicionar'}
                    </Button>
                    {stored && (
                      <Button size="sm" variant="danger" onClick={() => deleteApiKey(prov.id)}>Remover</Button>
                    )}
                  </>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-3">
                <Input
                  type="password"
                  placeholder={prov.placeholder}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
