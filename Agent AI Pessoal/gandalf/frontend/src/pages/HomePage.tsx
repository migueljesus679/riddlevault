import { PageWrapper, Header } from '../components/layout';
import { Card } from '../components/ui';
import { Link } from 'react-router-dom';

const quickLinks = [
  { path: '/chat', label: 'Iniciar Conselho', desc: 'Conversa com Gandalf', icon: '💬' },
  { path: '/prompts', label: 'Pergaminhos', desc: 'Gerir prompts guardados', icon: '📜' },
  { path: '/documents', label: 'Arquivo', desc: 'Analisar documentos', icon: '📚' },
  { path: '/tasks', label: 'Missoes', desc: 'Ver tarefas em curso', icon: '⚔️' },
];

export default function HomePage() {
  return (
    <PageWrapper>
      <Header title="Bem-vindo ao Salao" subtitle="Que deseja o viajante?" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card hover className="flex items-center gap-4">
              <span className="text-3xl">{link.icon}</span>
              <div>
                <h3 className="font-cinzel text-lg text-gold">{link.label}</h3>
                <p className="font-crimson text-mithril/70 text-sm">{link.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
