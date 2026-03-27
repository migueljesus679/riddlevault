import { useState, useEffect } from 'react';
import { PageWrapper, Header } from '../components/layout';
import { ApiEditor, ApiTester } from '../components/apis';
import { Button, Card, Badge, Modal } from '../components/ui';
import { api as apiClient } from '../services/api';

interface CustomApiData {
  _id: string;
  name: string;
  description: string;
  baseUrl: string;
  auth: { type: string; key?: string; value?: string };
  endpoints: Array<{ method: string; path: string; description: string }>;
  isActive: boolean;
  createdAt: string;
}

export default function ApisPage() {
  const [apis, setApis] = useState<CustomApiData[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<CustomApiData | null>(null);

  const load = async () => {
    try {
      const data = await apiClient.get<CustomApiData[]>('/custom-apis');
      setApis(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Record<string, unknown>) => {
    if (editingId) {
      await apiClient.put(`/custom-apis/${editingId}`, data);
    } else {
      await apiClient.post('/custom-apis', data);
    }
    setShowEditor(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/custom-apis/${id}`);
    if (selectedApi?._id === id) setSelectedApi(null);
    load();
  };

  const editing = editingId ? apis.find(a => a._id === editingId) : undefined;

  return (
    <PageWrapper>
      <Header title="APIs" subtitle="Integracoes personalizadas" />

      <div className="flex gap-6">
        <div className="w-80 flex-shrink-0 space-y-3">
          <Button onClick={() => { setEditingId(null); setShowEditor(true); }} className="w-full">Nova API</Button>
          {apis.map(a => (
            <Card key={a._id} hover className={`cursor-pointer ${selectedApi?._id === a._id ? 'border-gold/50' : ''}`} onClick={() => setSelectedApi(a)}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-cinzel text-sm text-parchment truncate flex-1">{a.name}</h4>
                <Badge variant={a.isActive ? 'success' : 'default'}>{a.isActive ? 'Ativo' : 'Inativo'}</Badge>
              </div>
              <p className="font-fira text-xs text-mithril/40 mt-1 truncate">{a.baseUrl}</p>
              <p className="font-crimson text-xs text-mithril/40">{a.endpoints.length} endpoint(s)</p>
            </Card>
          ))}
          {apis.length === 0 && (
            <p className="font-crimson text-mithril/40 text-center italic py-8">Nenhuma API configurada.</p>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {!selectedApi && (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔗</span>
              <p className="font-cinzel text-xl text-gold/60">Seleciona uma API</p>
            </div>
          )}

          {selectedApi && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-cinzel text-2xl text-gold">{selectedApi.name}</h2>
                  {selectedApi.description && <p className="font-crimson text-mithril/60 mt-1">{selectedApi.description}</p>}
                  <p className="font-fira text-sm text-mithril/40 mt-1">{selectedApi.baseUrl}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setEditingId(selectedApi._id); setShowEditor(true); }}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(selectedApi._id)}>Eliminar</Button>
                </div>
              </div>

              {selectedApi.endpoints.length > 0 && (
                <Card>
                  <h3 className="font-cinzel text-sm text-gold mb-3">Endpoints</h3>
                  <div className="space-y-2">
                    {selectedApi.endpoints.map((ep, i) => (
                      <div key={i} className="flex items-center gap-3 bg-shadow-black/20 rounded-lg px-3 py-2">
                        <Badge variant={['GET'].includes(ep.method) ? 'success' : ep.method === 'DELETE' ? 'error' : 'warning'}>{ep.method}</Badge>
                        <span className="font-fira text-sm text-parchment/80">{ep.path}</span>
                        {ep.description && <span className="font-crimson text-xs text-mithril/40">- {ep.description}</span>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {selectedApi.endpoints.length > 0 && (
                <ApiTester apiId={selectedApi._id} endpoints={selectedApi.endpoints} baseUrl={selectedApi.baseUrl} />
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={showEditor} onClose={() => { setShowEditor(false); setEditingId(null); }} title={editingId ? 'Editar API' : 'Nova API'}>
        <ApiEditor
          initial={editing ? { name: editing.name, description: editing.description, baseUrl: editing.baseUrl, auth: editing.auth, endpoints: editing.endpoints } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingId(null); }}
        />
      </Modal>
    </PageWrapper>
  );
}
