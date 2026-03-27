import { Link } from 'react-router-dom';
import { Product } from '../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const typeLabel = {
    quantity_based: 'Por quantidade',
    size_based: 'Por medida',
    unit_based: 'Por opção',
  }[product.product_type];

  const typeColor = {
    quantity_based: 'bg-blue-100 text-blue-700',
    size_based: 'bg-green-100 text-green-700',
    unit_based: 'bg-purple-100 text-purple-700',
  }[product.product_type];

  return (
    <Link to={`/produtos/${product.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`badge text-xs ${typeColor}`}>{typeLabel}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-500 mb-1">{product.category_name}</span>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">a partir de</span>
            <div className="font-bold text-primary-500 text-lg">
              {product.min_price.toFixed(2).replace('.', ',')} €
            </div>
          </div>
          <span className="text-xs font-medium text-dark-800 bg-gray-100 px-3 py-1.5 rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-colors">
            Ver opções
          </span>
        </div>
      </div>
    </Link>
  );
}
