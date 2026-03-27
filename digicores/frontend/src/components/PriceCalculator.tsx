import { useState } from 'react';
import api from '../services/api';
import { Product, PriceResult, QuantityTier, UnitOption, SizeConfig } from '../types';

interface Props {
  product: Product;
}

export default function PriceCalculator({ product }: Props) {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedQty, setSelectedQty] = useState<number | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const cfg = product.pricing_config;

  const calculate = async () => {
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (product.product_type === 'quantity_based') payload.quantity = selectedQty;
      if (product.product_type === 'unit_based') payload.option = selectedOpt;
      if (product.product_type === 'size_based') {
        payload.width = parseFloat(width);
        payload.height = parseFloat(height);
      }
      const { data } = await api.post(`/products/${product.id}/calculate-price`, payload);
      setResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao calcular preço';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isReady = () => {
    if (product.product_type === 'quantity_based') return selectedQty !== null;
    if (product.product_type === 'unit_based') return selectedOpt !== null;
    if (product.product_type === 'size_based') return width !== '' && height !== '' && parseFloat(width) > 0 && parseFloat(height) > 0;
    return false;
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <h3 className="font-bold text-lg text-dark-800 mb-4">Calcular Preço</h3>

      {product.product_type === 'quantity_based' && 'tiers' in cfg && (
        <div>
          <p className="text-sm text-gray-600 mb-3">Seleccione a quantidade:</p>
          <div className="grid grid-cols-2 gap-2">
            {(cfg as { tiers: QuantityTier[] }).tiers.map(tier => (
              <button
                key={tier.quantity}
                onClick={() => { setSelectedQty(tier.quantity); setResult(null); }}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  selectedQty === tier.quantity
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm">{tier.quantity} un.</div>
                <div className="text-primary-500 font-semibold">{tier.price.toFixed(2).replace('.', ',')} €</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {product.product_type === 'unit_based' && 'options' in cfg && (
        <div>
          <p className="text-sm text-gray-600 mb-3">Seleccione a opção:</p>
          <div className="space-y-2">
            {(cfg as { options: UnitOption[] }).options.map(opt => (
              <button
                key={opt.label}
                onClick={() => { setSelectedOpt(opt.label); setResult(null); }}
                className={`w-full flex justify-between items-center border-2 rounded-xl px-4 py-3 transition-all ${
                  selectedOpt === opt.label
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="font-medium text-sm">{opt.label}</span>
                <span className="text-primary-500 font-bold">{opt.price.toFixed(2).replace('.', ',')} €</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {product.product_type === 'size_based' && 'price_per_unit' in cfg && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Introduza as dimensões (em metros). Preço: {(cfg as SizeConfig).price_per_unit} €/{(cfg as SizeConfig).unit} — mínimo {(cfg as SizeConfig).min_units} {(cfg as SizeConfig).unit}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Largura (m)</label>
              <input
                type="number" min="0" step="0.1" value={width}
                onChange={e => { setWidth(e.target.value); setResult(null); }}
                className="input-field" placeholder="ex: 2.0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Altura (m)</label>
              <input
                type="number" min="0" step="0.1" value={height}
                onChange={e => { setHeight(e.target.value); setResult(null); }}
                className="input-field" placeholder="ex: 1.5"
              />
            </div>
          </div>
          {width && height && parseFloat(width) > 0 && parseFloat(height) > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Área: {(parseFloat(width) * parseFloat(height)).toFixed(2)} m² × {(cfg as SizeConfig).price_per_unit} € = estimativa {((parseFloat(width) * parseFloat(height)) * (cfg as SizeConfig).price_per_unit).toFixed(2)} €
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-4 bg-white border-2 border-primary-500 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">{result.details}</p>
          <p className="text-3xl font-black text-primary-500 mt-1">
            {result.price.toFixed(2).replace('.', ',')} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Preço sem IVA</p>
        </div>
      )}

      <button
        onClick={calculate}
        disabled={!isReady() || loading}
        className="btn-primary w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'A calcular...' : 'Calcular Preço'}
      </button>
    </div>
  );
}
