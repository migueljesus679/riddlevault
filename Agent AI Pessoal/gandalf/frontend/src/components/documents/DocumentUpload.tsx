import { useState, useRef } from 'react';
import { Card } from '../ui';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function DocumentUpload({ onUpload, uploading }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await onUpload(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Card
      className={`border-2 border-dashed transition-all duration-300 text-center py-12 cursor-pointer
        ${dragOver ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/40'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.csv,.txt,.xlsx" onChange={handleChange} />
      {uploading ? (
        <div className="space-y-3">
          <div className="w-10 h-10 mx-auto border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-crimson text-parchment">A processar documento...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <span className="text-5xl block">📂</span>
          <p className="font-cinzel text-lg text-gold">Arrasta um documento para aqui</p>
          <p className="font-crimson text-mithril/50 text-sm">ou clica para selecionar (PDF, DOCX, CSV, TXT)</p>
        </div>
      )}
    </Card>
  );
}
