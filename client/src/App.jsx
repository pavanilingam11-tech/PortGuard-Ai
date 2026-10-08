import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  FileText, 
  Settings as SettingsIcon, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import FindingDetails from './pages/FindingDetails';
import AssessmentHistory from './pages/AssessmentHistory';
import KnowledgeBase from './pages/KnowledgeBase';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function NavItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
      <span>{label}</span>
    </Link>
  );
}

function NavigationSidebar() {
  return (
    <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col z-20 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="bg-blue-600/20 p-2.5 rounded-xl text-blue-400 border border-blue-500/30 shadow-inner">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            PORTGUARD <span className="text-blue-400 font-extrabold">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Risk Analyzer</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-5 overflow-y-auto">
        <div className="text-[10px] uppercase font-semibold text-slate-500 px-3 pb-2 tracking-wider">Navigation</div>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/analyze" icon={PlusCircle} label="New Analysis" />
        <NavItem to="/history" icon={Activity} label="Assessment History" />
        <NavItem to="/knowledge" icon={Search} label="Knowledge Base" />
        <NavItem to="/reports" icon={FileText} label="Reports & Exports" />

        <div className="text-[10px] uppercase font-semibold text-slate-500 px-3 pt-6 pb-2 tracking-wider">System</div>
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
      </nav>
      
      <div className="p-4 border-t border-slate-800/80 mt-auto">
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Defensive Mode</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Deterministic rule engine active. AI explanations are non-authoritative.
          </p>
        </div>
      </div>
    </aside>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
        {/* Sidebar */}
        <NavigationSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950">
          <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CQ-M17 Hackathon Edition
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Network Security & Risk Identification</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-slate-200">Security Analyst</div>
                <div className="text-[11px] text-emerald-400">Authenticated</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xs">
                SA
              </div>
            </div>
          </header>
          
          <div className="p-8 flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<NewAnalysis />} />
              <Route path="/results/:id" element={<AnalysisResults />} />
              <Route path="/finding/:id" element={<FindingDetails />} />
              <Route path="/history" element={<AssessmentHistory />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;