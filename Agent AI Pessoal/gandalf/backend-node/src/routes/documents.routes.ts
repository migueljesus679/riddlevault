import { Router } from 'express';
import multer from 'multer';
import { DocumentModel } from '../models/document.model.js';
import fs from 'node:fs';

export const documentsRouter = Router();

const uploadDir = process.env.UPLOAD_DIR || '/app/storage/uploads';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

documentsRouter.post('/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file provided' }); return; }

    const pyUrl = process.env.PYTHON_API_URL || 'http://api-python:8000';
    const pyResponse = await fetch(`${pyUrl}/documents/process-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: req.file.path,
        filename: req.file.originalname,
      }),
    });

    if (!pyResponse.ok) {
      const errText = await pyResponse.text();
      throw new Error(`Python API error: ${errText}`);
    }

    const result = await pyResponse.json() as Record<string, unknown>;

    const doc = await DocumentModel.create({
      fileId: result.id as string,
      filename: result.filename as string,
      type: result.type as string,
      size: result.size as number,
      processing: result.processing,
      analysis: result.analysis,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ message: err instanceof Error ? err.message : 'Upload failed' });
  }
});

documentsRouter.get('/documents', async (_req, res) => {
  try {
    const docs = await DocumentModel.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch {
    res.status(500).json({ message: 'Failed to load documents' });
  }
});

documentsRouter.get('/documents/:id', async (req, res) => {
  try {
    const doc = await DocumentModel.findOne({ fileId: req.params.id });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(doc);
  } catch {
    res.status(500).json({ message: 'Failed to load document' });
  }
});

documentsRouter.post('/documents', async (req, res) => {
  try {
    const { id, filename, type, size, processing, analysis } = req.body;
    const doc = await DocumentModel.create({ fileId: id, filename, type, size, processing, analysis });
    res.status(201).json(doc);
  } catch {
    res.status(500).json({ message: 'Failed to save document' });
  }
});

documentsRouter.post('/documents/:id/generate-plan', async (req, res) => {
  try {
    const doc = await DocumentModel.findOne({ fileId: req.params.id }).lean();
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }

    const { providerRegistry } = await import('../services/ai/provider.registry.js');
    const ai = providerRegistry.get();

    const docText = (doc.processing as any)?.text || '';
    const summary = (doc.analysis as any)?.summary || '';
    const keywords = (doc.analysis as any)?.keywords?.join(', ') || '';

    const prompt = `Analisa o seguinte documento e cria um plano de projeto detalhado baseado no seu conteudo.

Documento: ${doc.filename}
Resumo: ${summary}
Palavras-chave: ${keywords}
Conteudo (primeiros 3000 caracteres): ${docText.slice(0, 3000)}

Cria um plano de projeto estruturado com:
1. Objetivo do projeto
2. Fases principais (com descricao de cada)
3. Tarefas concretas por fase
4. Riscos e dependencias
5. Proximos passos recomendados

Responde em Portugues.`;

    const response = await ai.sendMessage(
      [{ role: 'user', content: prompt }],
      { model: 'gpt-4o-mini', temperature: 0.5, maxTokens: 3000 }
    );

    await DocumentModel.updateOne({ fileId: req.params.id }, { $set: { 'analysis.projectPlan': response } });
    res.json({ plan: response });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Failed to generate plan' });
  }
});

documentsRouter.post('/documents/:id/deep-analysis', async (req, res) => {
  try {
    const doc = await DocumentModel.findOne({ fileId: req.params.id }).lean();
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }

    const { providerRegistry } = await import('../services/ai/provider.registry.js');
    const ai = providerRegistry.get();

    const docText = (doc.processing as any)?.text || '';
    const { focus } = req.body;

    const prompt = `Faz uma analise detalhada do seguinte documento${focus ? ` com foco em: ${focus}` : ''}.

Documento: ${doc.filename}
Conteudo (primeiros 4000 caracteres): ${docText.slice(0, 4000)}

Fornece:
1. Resumo executivo
2. Pontos principais identificados
3. Problemas ou lacunas encontradas
4. Recomendacoes
5. Conclusao

Responde em Portugues.`;

    const response = await ai.sendMessage(
      [{ role: 'user', content: prompt }],
      { model: 'gpt-4o-mini', temperature: 0.4, maxTokens: 3000 }
    );

    await DocumentModel.updateOne({ fileId: req.params.id }, { $set: { 'analysis.deepAnalysis': response } });
    res.json({ analysis: response });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Analysis failed' });
  }
});

documentsRouter.delete('/documents/:id', async (req, res) => {
  try {
    await DocumentModel.findOneAndDelete({ fileId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete' });
  }
});
