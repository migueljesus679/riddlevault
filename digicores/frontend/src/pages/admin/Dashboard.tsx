import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  products: number;
  categories: number;
  activeProducts: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ products: 0, categories: 0, activeProducts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?active=all'),
      api.get('/categories'),
    ]).then(([prods, cats]) => {
      const all = prods.data;
      setStats({
        products: all.length,
        activeProducts: all.filter((p: { active: boolean }) => p.active).length,
        categories: cats.data.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-800">Back Office</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo, <strong>{user?.name}</strong></p>
        </div>
        <span className="badge bg-primary-100 text-primary-700 px-3 py-1.5 text-sm font-semibold">Administrador</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))
        ) : (
          <>
            <div className="card p-6 border-l-4 border-primary-500">
              <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
              <p className="text-4xl font-black text-dark-800 mt-1">{stats.products}</p>
            </div>
            <div className="card p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500 font-medium">Produtos Activos</p>
              <p className="text-4xl font-black text-dark-800 mt-1">{stats.activeProducts}</p>
            </div>
            <div className="card p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 font-medium">Categorias</p>
              <p className="text-4xl font-black text-dark-800 mt-1">{stats.categories}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/admin/produtos" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
              📦
            </div>
            <div>
              <h3 className="font-bold text-dark-800 group-hover:text-primary-500 transition-colors">Gerir Produtos</h3>
              <p className="text-sm text-gray-500">Criar, editar e eliminar produtos</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link to="/admin/produtos/novo" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-500 group-hover:text-white transition-colors">
              ➕
            </div>
            <div>
              <h3 className="font-bold text-dark-800 group-hover:text-green-600 transition-colors">Novo Produto</h3>
              <p className="text-sm text-gray-500">Adicionar um novo produto ao catálogo</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link to="/produtos" target="_blank" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              🌐
            </div>
            <div>
              <h3 className="font-bold text-dark-800 group-hover:text-blue-600 transition-colors">Ver Loja</h3>
              <p className="text-sm text-gray-500">Visualizar o catálogo público</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
