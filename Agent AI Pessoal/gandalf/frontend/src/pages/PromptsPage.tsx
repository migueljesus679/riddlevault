import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Header } from '../components/layout';
import { PromptEditor, PromptCard } from '../components/prompts';
import { Button, Input, Modal } from '../components/ui';
import { usePromptStore } from '../stores/promptStore';

export default function PromptsPage() {
  const navigate = useNavigate();
  const { prompts, loading, loadPrompts, createPrompt, updatePrompt, deletePrompt, toggleFavorite } = usePromptStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => { loadPrompts({ search: search || undefined, category: filterCategory || undefined }); }, [loadPrompts, search, filterCategory]);

  const editingPrompt = editingId ? prompts.find(p => p._id === editingId) : null;

  const handleSave = async (data: { title: string; content: string; category: string; tags: string[] }) => {
    if (editingId) {
      await updatePrompt(editingId, data);
    } else {
      await createPrompt(data);
    }
    setShowEditor(false);
    setEditingId(null);
  };

  const handleUse = (content: string) => {
    navigate('/chat', { state: { prefill: content } });
  };

  return (
    <PageWrapper>
      <Header title="Pergaminhos" subtitle="Os teus prompts guardados" />

      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Pesquisar pergaminhos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-midnight-blue border border-gold/20 rounded-lg px-4 py-2.5 text-parchment font-crimson focus:outline-none focus:border-gold/60"
        >
          <option value="">Todas as categorias</option>
          {['Geral', 'Codigo', 'Escrita', 'Analise', 'Traducao'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button onClick={() => { setEditingId(null); setShowEditor(true); }}>Novo Pergaminho</Button>
      </div>

      {loading && <p className="font-crimson text-mithril/50">A carregar...</p>}

      {prompts.length === 0 && !loading && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📜</span>
          <p className="font-cinzel text-xl text-gold/60">Nenhum pergaminho encontrado</p>
          <p className="font-crimson text-mithril/40 mt-2">Cria o teu primeiro prompt para comecar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map(p => (
          <PromptCard
            key={p._id}
            prompt={p}
            onEdit={() => { setEditingId(p._id); setShowEditor(true); }}
            onDelete={() => deletePrompt(p._id)}
            onToggleFavorite={() => toggleFavorite(p._id)}
            onUse={() => handleUse(p.content)}
          />
        ))}
      </div>

      <Modal open={showEditor} onClose={() => { setShowEditor(false); setEditingId(null); }} title={editingId ? 'Editar Pergaminho' : 'Novo Pergaminho'}>
        <PromptEditor
          initial={editingPrompt ? { title: editingPrompt.title, content: editingPrompt.content, category: editingPrompt.category, tags: editingPrompt.tags } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingId(null); }}
        />
      </Modal>
    </PageWrapper>
  );
}
