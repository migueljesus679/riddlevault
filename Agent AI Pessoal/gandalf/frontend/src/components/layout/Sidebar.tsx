import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Salao Principal', icon: '🏰' },
  { path: '/chat', label: 'Conselho', icon: '💬' },
  { path: '/prompts', label: 'Pergaminhos', icon: '📜' },
  { path: '/documents', label: 'Arquivo', icon: '📚' },
  { path: '/tasks', label: 'Missoes', icon: '⚔️' },
  { path: '/apis', label: 'APIs', icon: '🔗' },
  { path: '/settings', label: 'Forja', icon: '🔧' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-shadow-black/40 border-r border-gold/15 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gold/15">
        <h1 className="font-cinzel text-2xl text-gold tracking-wider">Gandalf</h1>
        <p className="font-crimson text-xs text-mithril/60 mt-1">AI Agent</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-crimson text-base transition-all duration-300
              ${isActive
                ? 'bg-gold/15 text-gold border border-gold/25 shadow-[0_0_10px_rgba(201,168,76,0.1)]'
                : 'text-parchment/70 hover:bg-parchment/5 hover:text-parchment'}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gold/10">
        <p className="font-crimson text-xs text-mithril/40 text-center italic">
          "All we have to decide is what to do with the time that is given us."
        </p>
      </div>
    </aside>
  );
}
