import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Search, List, BookOpen, Clock, FileText, Settings as SettingsIcon } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'New Analysis', path: '/new', icon: Search },
    { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-dark-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col hidden md:flex">
        <div className="p-4 flex items-center gap-3 border-b border-dark-border">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">PORTGUARD <span className="text-blue-500">AI</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-dark-muted hover:bg-dark-border hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-dark-card border-b border-dark-border flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Security Operations Center</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-dark-muted">Admin User</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}