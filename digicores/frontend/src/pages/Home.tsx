import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?active=1'),
      api.get('/categories'),
    ]).then(([prods, cats]) => {
      setFeatured(prods.data.slice(0, 6));
      setCategories(cats.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block bg-primary-500/20 text-primary-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary-500/30">
              Impressão Digital de Alta Qualidade
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              A sua imagem<br />
              <span className="text-primary-500">começa aqui</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Especialistas em impressão digital, publicidade e personalização de materiais.
              Do cartão de visita à lona de grande formato — tudo com qualidade superior.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/produtos" className="btn-primary text-base">
                Ver Catálogo
              </Link>
              <a href="mailto:geral@digicores.pt" className="btn-secondary border-gray-400 text-gray-300 hover:bg-white hover:text-dark-800 text-base">
                Pedir Orçamento
              </a>
            </div>
            <div className="flex gap-8 mt-12 text-sm text-gray-400">
              <div><span className="block text-2xl font-black text-white">500+</span>Clientes</div>
              <div><span className="block text-2xl font-black text-white">15+</span>Categorias</div>
              <div><span className="block text-2xl font-black text-white">48h</span>Entrega</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-dark-800">As nossas categorias</h2>
          <p className="text-gray-500 mt-2">Encontre o produto ideal para a sua campanha</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/produtos?categoria=${cat.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-primary-500 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-sm text-dark-800 group-hover:text-primary-500 transition-colors">{cat.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-dark-800">Produtos em destaque</h2>
              <p className="text-gray-500 mt-1">Os mais escolhidos pelos nossos clientes</p>
            </div>
            <Link to="/produtos" className="text-primary-500 hover:text-primary-600 font-semibold text-sm hidden md:block">
              Ver todos →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/produtos" className="btn-secondary">Ver todos os produtos</Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🚀', title: 'Entrega Rápida', desc: 'Prazo de entrega de 48 a 72 horas úteis para a maioria dos produtos.' },
            { icon: '🎨', title: 'Design Incluído', desc: 'Equipa de design dedicada para ajudar a criar os seus materiais.' },
            { icon: '✅', title: 'Qualidade Garantida', desc: 'Impressão digital de alta resolução com tintas de longa duração.' },
          ].map(f => (
            <div key={f.title} className="text-center p-6">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-dark-800 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dark-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-4">Pronto para começar?</h2>
          <p className="text-gray-400 mb-8">Explore o nosso catálogo e calcule o preço dos seus materiais em segundos.</p>
          <Link to="/produtos" className="btn-primary text-base">
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
