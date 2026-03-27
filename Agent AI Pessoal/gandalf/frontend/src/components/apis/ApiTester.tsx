import { useState } from 'react';
import { Card, Button, Badge } from '../ui';
import { api } from '../../services/api';

interface ApiTesterProps {
  apiId: string;
  endpoints: Array<{ method: string; path: string; description: string }>;
  baseUrl: string;
}

export default function ApiTester({ apiId, endpoints, baseUrl }: ApiTesterProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [result, setResult] = useState<{ status: number; body: unknown; elapsed: number } | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<{ status: number; body: unknown; elapsed: number }>(
        `/custom-apis/${apiId}/test/${selectedIdx}`, {}
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="space-y-3">
      <h4 className="font-cinzel text-sm text-gold">Testar Endpoint</h4>
      <div className="flex gap-2 items-center">
        <select
          value={selectedIdx}
          onChange={e => { setSelectedIdx(Number(e.target.value)); setResult(null); }}
          className="bg-midnight-blue border border-gold/20 rounded-lg px-3 py-2 text-parchment font-crimson text-sm focus:outline-none flex-1"
        >
          {endpoints.map((ep, i) => (
            <option key={i} value={i}>{ep.method} {ep.path} {ep.description ? `- ${ep.description}` : ''}</option>
          ))}
        </select>
        <Button size="sm" onClick={handleTest} disabled={testing || endpoints.length === 0}>
          {testing ? 'A testar...' : 'Testar'}
        </Button>
      </div>
      {endpoints.length > 0 && (
        <p className="font-fira text-xs text-mithril/40">{baseUrl}{endpoints[selectedIdx]?.path}</p>
      )}
      {error && <p className="text-red-400 font-crimson text-sm">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Badge variant={result.status < 400 ? 'success' : 'error'}>{result.status}</Badge>
            <Badge variant="default">{result.elapsed}ms</Badge>
          </div>
          <pre className="bg-shadow-black/40 rounded-lg p-3 font-fira text-xs text-parchment/70 overflow-auto max-h-60">
            {typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
