import { useState } from 'react';
import { Card, Badge } from '../ui';

type StorageType = 'local' | 'gdrive' | 'onedrive' | 'dropbox';

const STORAGE_OPTIONS: Array<{ id: StorageType; name: string; icon: string; desc: string }> = [
  { id: 'local', name: 'Local', icon: '💾', desc: 'Armazenamento em volume Docker' },
  { id: 'gdrive', name: 'Google Drive', icon: '☁️', desc: 'Requer conta Google conectada' },
  { id: 'onedrive', name: 'OneDrive', icon: '☁️', desc: 'Requer conta Microsoft conectada' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', desc: 'Requer conta Dropbox conectada' },
];

export default function StorageConfig() {
  const [active, setActive] = useState<StorageType>('local');

  return (
    <div className="space-y-4">
      <h2 className="font-cinzel text-xl text-gold">Armazenamento</h2>
      <p className="font-crimson text-sm text-mithril/60">Escolhe onde guardar documentos e resultados.</p>
      {STORAGE_OPTIONS.map(opt => (
        <Card
          key={opt.id}
          hover
          className={`flex items-center justify-between cursor-pointer ${active === opt.id ? 'border-gold/40' : ''}`}
          onClick={() => setActive(opt.id)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <h3 className="font-cinzel text-base text-parchment">{opt.name}</h3>
              <p className="font-crimson text-xs text-mithril/50">{opt.desc}</p>
            </div>
          </div>
          {active === opt.id && <Badge variant="success">Ativo</Badge>}
        </Card>
      ))}
    </div>
  );
}
