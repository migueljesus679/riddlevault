import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500 text-white font-black text-lg px-3 py-1 rounded">DIGI</div>
              <span className="font-bold text-xl text-white tracking-tight">CORES</span>
            </div>
            <p className="text-sm leading-relaxed">
              Especialistas em impressão digital e publicidade. Qualidade e rapidez ao serviço da sua imagem.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-dark-900 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors text-xs">f</a>
              <a href="#" className="w-8 h-8 bg-dark-900 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors text-xs">in</a>
              <a href="#" className="w-8 h-8 bg-dark-900 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors text-xs">ig</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Produtos</h4>
            <ul className="space-y-2 text-sm">
              {['Pequeno Formato', 'Autocolantes', 'Brindes', 'Expositores', 'Lonas', 'Placas', 'Têxteis', 'Imobiliária'].map(cat => (
                <li key={cat}>
                  <Link
                    to={`/produtos?categoria=${cat.toLowerCase().replace(/\s+/g, '-').replace(/[áàã]/g, 'a').replace(/[éè]/g, 'e').replace(/ê/g, 'e').replace(/[íì]/g, 'i').replace(/[óòõ]/g, 'o').replace(/[úù]/g, 'u').replace(/ç/g, 'c')}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portefólio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Rua da Impressão, 42<br />1000-000 Lisboa</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+351210000000" className="hover:text-white transition-colors">+351 210 000 000</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:geral@digicores.pt" className="hover:text-white transition-colors">geral@digicores.pt</a>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>Seg–Sex: 9h–18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-900 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Digicores. Todos os direitos reservados. Preços s/ IVA.
        </div>
      </div>
    </footer>
  );
}
