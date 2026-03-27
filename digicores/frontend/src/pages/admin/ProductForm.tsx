import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Category } from '../../types';

interface QuantityTier { quantity: number; price: number; }
interface UnitOption { label: string; price: number; }
interface SizeConfig { unit: string; price_per_unit: number; min_units: number; }

type ProductType = 'quantity_based' | 'size_based' | 'unit_based';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productType, setProductType] = useState<ProductType>('quantity_based');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  const [tiers, setTiers] = useState<QuantityTier[]>([{ quantity: 100, price: 10 }]);
  const [options, setOptions] = useState<UnitOption[]>([{ label: 'Standard', price: 50 }]);
  const [sizeConfig, setSizeConfig] = useState<SizeConfig>({ unit: 'm2', price_per_unit: 10, min_units: 1 });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/products/${id}`).then(r => {
      const p = r.data;
      setName(p.name);
      setDescription(p.description || '');
      setCategoryId(String(p.category_id || ''));
      setProductType(p.product_type);
      setImageUrl(p.image_url || '');
      setActive(p.active);
      const cfg = p.pricing_config;
      if (p.product_type === 'quantity_based' && cfg.tiers) setTiers(cfg.tiers);
      if (p.product_type === 'unit_based' && cfg.options) setOptions(cfg.options);
      if (p.product_type === 'size_based' && cfg.price_per_unit) setSizeConfig(cfg);
    }).catch(() => { setError('Produto não encontrado'); }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildPricingConfig = () => {
    if (productType === 'quantity_based') return { tiers };
    if (productType === 'unit_based') return { options };
    return sizeConfig;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name, description,
        category_id: categoryId ? Number(categoryId) : null,
        product_type: productType,
        pricing_config: buildPricingConfig(),
        image_url: imageUrl,
        active,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/produtos');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao guardar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const addTier = () => setTiers(prev => [...prev, { quantity: 0, price: 0 }]);
  const removeTier = (i: number) => setTiers(prev => prev.filter((_, idx) => idx !== i));
  const updateTier = (i: number, field: keyof QuantityTier, val: number) =>
    setTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const addOption = () => setOptions(prev => [...prev, { label: '', price: 0 }]);
  const removeOption = (i: number) => setOptions(prev => prev.filter((_, idx) => idx !== i));
  const updateOption = (i: number, field: keyof UnitOption, val: string | number) =>
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, [field]: val } : o));

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse text-center text-gray-400">A carregar produto...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin" className="hover:text-primary-500">Back Office</Link>
        <span>›</span>
        <Link to="/admin/produtos" className="hover:text-primary-500">Produtos</Link>
        <span>›</span>
        <span>{isEdit ? 'Editar' : 'Novo Produto'}</span>
      </div>

      <h1 className="text-2xl font-black text-dark-800 mb-8">
        {isEdit ? 'Editar Produto' : 'Criar Novo Produto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark-800 border-b border-gray-100 pb-3">Informação Geral</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="ex: Cartões de Visita" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" placeholder="Descrição detalhada do produto..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field">
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-field" placeholder="https://..." />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 text-primary-500 rounded" />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Produto activo (visível no catálogo)</label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark-800 border-b border-gray-100 pb-3">Tipo de Preço *</h2>

          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'quantity_based', label: 'Por Quantidade', desc: 'Escalões de quantidade', icon: '📊' },
              { value: 'size_based', label: 'Por Medida', desc: 'Preço por m²', icon: '📐' },
              { value: 'unit_based', label: 'Por Opção', desc: 'Opções fixas', icon: '🔘' },
            ] as const).map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setProductType(t.value)}
                className={`border-2 rounded-xl p-3 text-center transition-all ${productType === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="font-semibold text-sm text-dark-800">{t.label}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </button>
            ))}
          </div>

          {productType === 'quantity_based' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Escalões de quantidade</p>
                <button type="button" onClick={addTier} className="text-xs text-primary-500 hover:text-primary-600 font-semibold">+ Adicionar escalão</button>
              </div>
              <div className="space-y-2">
                {tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Quantidade (un.)</label>
                      <input type="number" min="1" value={tier.quantity} onChange={e => updateTier(i, 'quantity', Number(e.target.value))} className="input-field text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Preço (€)</label>
                      <input type="number" min="0" step="0.01" value={tier.price} onChange={e => updateTier(i, 'price', Number(e.target.value))} className="input-field text-sm" />
                    </div>
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 mt-4 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {productType === 'unit_based' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Opções disponíveis</p>
                <button type="button" onClick={addOption} className="text-xs text-primary-500 hover:text-primary-600 font-semibold">+ Adicionar opção</button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Etiqueta</label>
                      <input type="text" value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} className="input-field text-sm" placeholder="ex: Standard" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Preço (€)</label>
                      <input type="number" min="0" step="0.01" value={opt.price} onChange={e => updateOption(i, 'price', Number(e.target.value))} className="input-field text-sm" />
                    </div>
                    {options.length > 1 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 mt-4 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {productType === 'size_based' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Configuração por área</p>
              <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3">
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Unidade</label>
                  <select value={sizeConfig.unit} onChange={e => setSizeConfig(prev => ({ ...prev, unit: e.target.value }))} className="input-field text-sm">
                    <option value="m2">m²</option>
                    <option value="cm2">cm²</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Preço por unidade (€)</label>
                  <input type="number" min="0" step="0.01" value={sizeConfig.price_per_unit} onChange={e => setSizeConfig(prev => ({ ...prev, price_per_unit: Number(e.target.value) }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Mínimo</label>
                  <input type="number" min="0" step="0.01" value={sizeConfig.min_units} onChange={e => setSizeConfig(prev => ({ ...prev, min_units: Number(e.target.value) }))} className="input-field text-sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <Link to="/admin/produtos" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'A guardar...' : isEdit ? 'Guardar alterações' : 'Criar produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
