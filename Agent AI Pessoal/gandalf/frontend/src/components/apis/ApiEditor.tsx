import { useState } from 'react';
import { Button, Input, Card } from '../ui';

interface Endpoint {
  method: string;
  path: string;
  description: string;
}

interface ApiEditorProps {
  initial?: { name: string; description: string; baseUrl: string; auth: { type: string; key?: string; value?: string }; endpoints: Endpoint[] };
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ApiEditor({ initial, onSave, onCancel }: ApiEditorProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl || '');
  const [authType, setAuthType] = useState(initial?.auth?.type || 'none');
  const [authKey, setAuthKey] = useState(initial?.auth?.key || '');
  const [authValue, setAuthValue] = useState(initial?.auth?.value || '');
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initial?.endpoints || []);

  const addEndpoint = () => {
    setEndpoints([...endpoints, { method: 'GET', path: '/', description: '' }]);
  };

  const updateEndpoint = (i: number, field: keyof Endpoint, value: string) => {
    const updated = [...endpoints];
    updated[i] = { ...updated[i], [field]: value };
    setEndpoints(updated);
  };

  const removeEndpoint = (i: number) => setEndpoints(endpoints.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!name.trim() || !baseUrl.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      baseUrl: baseUrl.trim(),
      auth: { type: authType, key: authKey, value: authValue },
      endpoints,
    });
  };

  return (
    <div className="space-y-4">
      <Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Weather API" />
      <Input label="Descricao" value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descricao..." />
      <Input label="URL Base" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://api.example.com" />

      <div>
        <label className="font-cinzel text-sm text-gold block mb-1">Autenticacao</label>
        <div className="flex gap-2">
          {['none', 'apikey', 'bearer'].map(t => (
            <button key={t} onClick={() => setAuthType(t)}
              className={`px-3 py-1 rounded-full text-sm font-crimson border transition-all ${authType === t ? 'bg-gold/20 border-gold/40 text-gold' : 'border-gold/15 text-mithril/60 hover:border-gold/30'}`}>
              {t === 'none' ? 'Nenhuma' : t === 'apikey' ? 'API Key' : 'Bearer'}
            </button>
          ))}
        </div>
        {authType !== 'none' && (
          <div className="flex gap-2 mt-2">
            {authType === 'apikey' && <Input placeholder="Header name" value={authKey} onChange={e => setAuthKey(e.target.value)} className="flex-1" />}
            <Input type="password" placeholder={authType === 'bearer' ? 'Token' : 'Valor'} value={authValue} onChange={e => setAuthValue(e.target.value)} className="flex-1" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-cinzel text-sm text-gold">Endpoints</label>
          <Button size="sm" variant="secondary" onClick={addEndpoint}>+ Endpoint</Button>
        </div>
        {endpoints.map((ep, i) => (
          <Card key={i} className="flex gap-2 items-center mb-2">
            <select value={ep.method} onChange={e => updateEndpoint(i, 'method', e.target.value)}
              className="bg-midnight-blue border border-gold/20 rounded-lg px-2 py-2 text-parchment font-fira text-sm focus:outline-none">
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Input value={ep.path} onChange={e => updateEndpoint(i, 'path', e.target.value)} placeholder="/endpoint" className="flex-1" />
            <Input value={ep.description} onChange={e => updateEndpoint(i, 'description', e.target.value)} placeholder="Descricao" className="flex-1" />
            <Button size="sm" variant="danger" onClick={() => removeEndpoint(i)}>X</Button>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={!name.trim() || !baseUrl.trim()}>Guardar</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
