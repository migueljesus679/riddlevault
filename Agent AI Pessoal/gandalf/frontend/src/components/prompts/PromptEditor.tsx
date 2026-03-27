import { useState } from 'react';
import { Button, Input, Textarea, Badge } from '../ui';

interface PromptEditorProps {
  initial?: { title: string; content: string; category: string; tags: string[] };
  onSave: (data: { title: string; content: string; category: string; tags: string[] }) => void;
  onCancel: () => void;
}

const CATEGORIES = ['Geral', 'Codigo', 'Escrita', 'Analise', 'Traducao'];

export default function PromptEditor({ initial, onSave, onCancel }: PromptEditorProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [category, setCategory] = useState(initial?.category || 'Geral');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);

  const variables = (content.match(/\{\{(\w+)\}\}/g) || []).map(v => v.slice(2, -2));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), category, tags });
  };

  const highlightedContent = content.replace(
    /\{\{(\w+)\}\}/g,
    '<span class="text-gold font-semibold">{{$1}}</span>'
  );

  return (
    <div className="space-y-4">
      <Input label="Titulo" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do pergaminho..." />

      <div>
        <label className="font-cinzel text-sm text-gold block mb-1">Categoria</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm font-crimson border transition-all ${
                category === c
                  ? 'bg-gold/20 border-gold/40 text-gold'
                  : 'border-gold/15 text-mithril/60 hover:border-gold/30'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Conteudo"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escreve o teu prompt... Usa {{variavel}} para variaveis dinamicas."
        className="min-h-[200px]"
      />

      {variables.length > 0 && (
        <div>
          <label className="font-cinzel text-sm text-gold block mb-1">Variaveis detectadas</label>
          <div className="flex gap-2 flex-wrap">
            {variables.map(v => <Badge key={v}>{`{{${v}}}`}</Badge>)}
          </div>
        </div>
      )}

      {content && (
        <div>
          <label className="font-cinzel text-sm text-gold block mb-1">Pre-visualizacao</label>
          <div
            className="bg-shadow-black/30 border border-gold/10 rounded-lg p-4 font-crimson text-parchment/80 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      )}

      <div>
        <label className="font-cinzel text-sm text-gold block mb-1">Tags</label>
        <div className="flex gap-2 items-center">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Adicionar tag..."
            className="flex-1"
          />
          <Button size="sm" variant="secondary" onClick={addTag}>+</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {tags.map(t => (
              <Badge key={t}>
                {t}
                <button onClick={() => removeTag(t)} className="ml-1.5 text-gold/60 hover:text-gold">&times;</button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>Guardar</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
