import { useState, useEffect } from 'react';
import { PageWrapper, Header } from '../components/layout';
import { DocumentUpload, AnalysisResult } from '../components/documents';
import { Button, Card, Modal, Input, Badge } from '../components/ui';
import { api } from '../services/api';

interface DocumentInfo {
  _id: string;
  fileId: string;
  filename: string;
  type: string;
  size: number;
  processing: Record<string, unknown>;
  analysis: {
    summary?: string;
    keywords?: string[];
    entities?: Record<string, string[]>;
    word_count?: number;
    sentence_count?: number;
    projectPlan?: string;
    deepAnalysis?: string;
  };
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisFocus, setAnalysisFocus] = useState('');

  const load = async () => {
    try {
      const docs = await api.get<DocumentInfo[]>('/documents');
      setDocuments(docs);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error((err as { message: string }).message);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePlan = async (doc: DocumentInfo) => {
    setGenerating(doc.fileId);
    setPlanResult(null);
    try {
      const res = await api.post<{ plan: string }>(`/documents/${doc.fileId}/generate-plan`, {});
      setPlanResult(res.plan);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setGenerating(null);
    }
  };

  const handleDeepAnalysis = async () => {
    if (!selectedDoc) return;
    setShowAnalysisModal(false);
    setGenerating(selectedDoc.fileId);
    setAnalysisResult(null);
    try {
      const res = await api.post<{ analysis: string }>(`/documents/${selectedDoc.fileId}/deep-analysis`, { focus: analysisFocus });
      setAnalysisResult(res.analysis);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setGenerating(null);
      setAnalysisFocus('');
    }
  };

  const handleDelete = async (fileId: string) => {
    await api.delete(`/documents/${fileId}`);
    if (selectedDoc?.fileId === fileId) { setSelectedDoc(null); setPlanResult(null); setAnalysisResult(null); }
    load();
  };

  return (
    <PageWrapper>
      <Header title="Arquivo" subtitle="Analise de documentos e projetos" />

      <DocumentUpload onUpload={handleUpload} uploading={uploading} />
      {error && <p className="mt-4 text-red-400 font-crimson">{error}</p>}

      <div className="flex gap-6 mt-6">
        <div className="w-80 flex-shrink-0 space-y-3">
          <h3 className="font-cinzel text-lg text-gold">Documentos</h3>
          {documents.map(doc => (
            <Card key={doc._id} hover className={`cursor-pointer ${selectedDoc?.fileId === doc.fileId ? 'border-gold/50' : ''}`}
              onClick={() => { setSelectedDoc(doc); setPlanResult(doc.analysis?.projectPlan || null); setAnalysisResult(doc.analysis?.deepAnalysis || null); }}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-crimson text-sm text-parchment truncate flex-1">{doc.filename}</h4>
                <Badge>{doc.type.toUpperCase()}</Badge>
              </div>
              <div className="flex gap-2 mt-1">
                {doc.analysis?.word_count && <span className="font-crimson text-xs text-mithril/40">{doc.analysis.word_count} palavras</span>}
                {doc.analysis?.projectPlan && <Badge variant="success">Plano</Badge>}
              </div>
            </Card>
          ))}
          {documents.length === 0 && !uploading && (
            <p className="font-crimson text-mithril/40 text-center italic py-8">Nenhum documento.</p>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {!selectedDoc && (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">📚</span>
              <p className="font-cinzel text-xl text-gold/60">Seleciona um documento</p>
              <p className="font-crimson text-mithril/40 mt-2">Carrega um documento e analisa-o em detalhe.</p>
            </div>
          )}

          {selectedDoc && (
            <>
              <AnalysisResult doc={selectedDoc} />

              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => handleGeneratePlan(selectedDoc)} disabled={generating === selectedDoc.fileId}>
                  {generating === selectedDoc.fileId ? 'A gerar...' : 'Gerar Plano de Projeto'}
                </Button>
                <Button variant="secondary" onClick={() => { setShowAnalysisModal(true); }} disabled={generating === selectedDoc.fileId}>
                  Analise Detalhada
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(selectedDoc.fileId)}>
                  Eliminar
                </Button>
              </div>

              {planResult && (
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-cinzel text-lg text-gold">Plano de Projeto</h3>
                    <Badge variant="success">Gerado por AI</Badge>
                  </div>
                  <div className="font-crimson text-parchment/85 text-sm leading-relaxed whitespace-pre-wrap">
                    {planResult}
                  </div>
                </Card>
              )}

              {analysisResult && (
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-cinzel text-lg text-gold">Analise Detalhada</h3>
                    <Badge variant="warning">AI</Badge>
                  </div>
                  <div className="font-crimson text-parchment/85 text-sm leading-relaxed whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} title="Analise Detalhada">
        <div className="space-y-4">
          <p className="font-crimson text-parchment/70 text-sm">
            Define um foco especifico para a analise ou deixa em branco para analise geral.
          </p>
          <Input
            label="Foco da analise (opcional)"
            value={analysisFocus}
            onChange={e => setAnalysisFocus(e.target.value)}
            placeholder="Ex: riscos, custos, requisitos tecnicos, cronograma..."
          />
          <div className="flex gap-3">
            <Button onClick={handleDeepAnalysis}>Iniciar Analise</Button>
            <Button variant="ghost" onClick={() => setShowAnalysisModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
