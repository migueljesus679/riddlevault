import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Product } from '../types';
import PriceCalculator from '../components/PriceCalculator';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-dark-800">Produto não encontrado</h2>
        <Link to="/produtos" className="btn-primary mt-6 inline-flex">Ver catálogo</Link>
      </div>
    );
  }

  const typeLabel = {
    quantity_based: 'Preço por quantidade',
    size_based: 'Preço por medida (m²)',
    unit_based: 'Preço por opção',
  }[product.product_type];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-500">Início</Link>
        <span>›</span>
        <Link to="/produtos" className="hover:text-primary-500">Produtos</Link>
        <span>›</span>
        <Link to={`/produtos?categoria=${product.category_slug}`} className="hover:text-primary-500">{product.category_name}</Link>
        <span>›</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80';
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link to={`/produtos?categoria=${product.category_slug}`} className="text-sm text-gray-500 hover:text-primary-500">
              {product.category_name}
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{typeLabel}</span>
          </div>

          <h1 className="text-3xl font-black text-dark-800 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-sm text-gray-500">a partir de</span>
            <span className="text-3xl font-black text-primary-500">
              {product.min_price.toFixed(2).replace('.', ',')} €
            </span>
            <span className="text-sm text-gray-400">s/ IVA</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">ℹ️ Como funciona o preço?</h4>
            <p className="text-blue-700 text-sm">
              {product.product_type === 'quantity_based' && 'O preço varia consoante a quantidade encomendada. Quanto maior a quantidade, melhor o preço unitário.'}
              {product.product_type === 'size_based' && 'O preço é calculado com base nas dimensões do produto (largura × altura). Introduza as medidas para obter o preço exacto.'}
              {product.product_type === 'unit_based' && 'Escolha a opção que melhor se adequa às suas necessidades. Cada opção tem um preço fixo.'}
            </p>
          </div>

          <PriceCalculator product={product} />

          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">🚀</div>
              <div className="font-semibold text-dark-800">48–72h</div>
              <div className="text-gray-500 text-xs">Entrega</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🎨</div>
              <div className="font-semibold text-dark-800">Design</div>
              <div className="text-gray-500 text-xs">Incluído</div>
            </div>
            <div>
              <div className="text-2xl mb-1">✅</div>
              <div className="font-semibold text-dark-800">Qualidade</div>
              <div className="text-gray-500 text-xs">Garantida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
