import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get('categoria') || '';
  const searchFilter = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchFilter);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (categoryFilter) params.category = categoryFilter;
    if (searchFilter) params.search = searchFilter;
    api.get('/products', { params }).then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, [categoryFilter, searchFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput) next.set('search', searchInput);
    else next.delete('search');
    next.delete('categoria');
    setSearchParams(next);
  };

  const setCategory = (slug: string) => {
    const next = new URLSearchParams();
    if (slug) next.set('categoria', slug);
    setSearchInput('');
    setSearchParams(next);
  };

  const activeCat = categories.find(c => c.slug === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-dark-800">
          {activeCat ? activeCat.name : 'Todos os Produtos'}
        </h1>
        {activeCat && <p className="text-gray-500 mt-1">{activeCat.description}</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-dark-800 mb-3 uppercase tracking-wide">Categorias</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryFilter ? 'bg-primary-500 text-white font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  Todas
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${categoryFilter === cat.slug ? 'bg-primary-500 text-white font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary px-5 py-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Pesquisar
            </button>
            {(categoryFilter || searchFilter) && (
              <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Limpar
              </button>
            )}
          </form>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente alterar os filtros ou a pesquisa</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
