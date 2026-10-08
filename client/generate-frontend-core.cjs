const fs = require('fs');
const path = require('path');

const clientPath = 'c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/client';

const files = {
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          border: '#334155', // slate-700
          text: '#f8fafc', // slate-50
          muted: '#94a3b8', // slate-400
        }
      }
    },
  },
  plugins: [],
}`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dark-bg text-dark-text m-0 p-0;
}`,
  'src/App.jsx': `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import FindingDetails from './pages/FindingDetails';
import KnowledgeBase from './pages/KnowledgeBase';
import AssessmentHistory from './pages/AssessmentHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewAnalysis />} />
          <Route path="/results/:id" element={<AnalysisResults />} />
          <Route path="/finding/:id" element={<FindingDetails />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/history" element={<AssessmentHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;`,
  'src/layouts/Layout.jsx': `import { Link, useLocation } from 'react-router-dom';
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
                className={\`flex items-center gap-3 px-3 py-2 rounded-md transition-colors \${
                  active ? 'bg-blue-600 text-white' : 'text-dark-muted hover:bg-dark-border hover:text-white'
                }\`}
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
}`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(clientPath, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
