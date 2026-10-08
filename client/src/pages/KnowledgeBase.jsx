import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { BookOpen, Search, Filter, Shield, Lock, Unlock, AlertTriangle } from 'lucide-react';

export default function KnowledgeBase() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        setServices(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load services:', err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(services.map(s => s.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        (s.key && s.key.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.purpose && s.purpose.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [services, search, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Service Knowledge Base</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic port signatures, administrative privileges, and security sensitivity ratings.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg self-start">
          <span className="font-bold text-blue-400">{services.length}</span> Identified Signatures
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search port number, protocol, service name..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select 
            className="input-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden border border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Port / Protocol</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Operational Purpose</th>
                <th className="p-4">Default Encryption</th>
                <th className="p-4 text-center">Administrative</th>
                <th className="p-4 text-center">Sensitivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((s, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-400">
                    {s.key}
                  </td>
                  <td className="p-4 font-extrabold text-white text-sm">
                    {s.name}
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs leading-relaxed">
                    {s.purpose}
                  </td>
                  <td className="p-4">
                    {s.encryptedByDefault ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Encrypted (Default)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 text-xs">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Cleartext (Default)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {s.administrative ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        Admin Interface
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Standard</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      s.sensitivity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      s.sensitivity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {s.sensitivity}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                    No services found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}