import { useState, useEffect, useMemo } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, Shield, Search, Filter, ArrowUpDown, FileText, ArrowLeft, ExternalLink, ShieldAlert
} from 'lucide-react';

export default function AnalysisResults() {
  const { id } = useParams();
  const [findings, setFindings] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [exposureFilter, setExposureFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score-desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessRes, findingsRes] = await Promise.all([
          api.get(`/api/assessments/${id}`),
          api.get(`/api/assessments/${id}/findings`)
        ]);
        setAssessment(assessRes.data);
        setFindings(findingsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        (f.host && f.host.toLowerCase().includes(q)) ||
        (f.service && f.service.toLowerCase().includes(q)) ||
        (f.port && f.port.toString().includes(q));

      const matchesRisk = riskFilter === 'ALL' || f.riskLevel === riskFilter;
      const matchesExposure = exposureFilter === 'ALL' || f.exposure === exposureFilter;

      return matchesSearch && matchesRisk && matchesExposure;
    }).sort((a, b) => {
      if (sortBy === 'score-desc') return b.riskScore - a.riskScore;
      if (sortBy === 'score-asc') return a.riskScore - b.riskScore;
      if (sortBy === 'port-asc') return a.port - b.port;
      if (sortBy === 'host-asc') return (a.host || '').localeCompare(b.host || '');
      return 0;
    });
  }, [findings, searchQuery, riskFilter, exposureFilter, sortBy]);

  const getSeverityBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Loading analysis findings...</div>;
  }

  const overallRisk = assessment?.overallRisk || 0;
  const overallRiskColor = overallRisk >= 75 ? 'text-red-400' : overallRisk >= 50 ? 'text-orange-400' : overallRisk >= 25 ? 'text-yellow-400' : 'text-blue-400';

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/history" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {assessment?.name || 'Analysis Results'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Scope: <span className="font-mono text-slate-300">{assessment?.scope || 'Perimeter'}</span> • {findings.length} services analyzed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Posture</div>
            <div className={`text-xl font-extrabold ${overallRiskColor}`}>{overallRisk}/100</div>
          </div>
          
          <a 
            href={`${API_BASE_URL}/api/reports/${id}/csv`}
            download
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </a>

          <a 
            href={`${API_BASE_URL}/api/reports/${id}/pdf`}
            download
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search host, port, or service..."
            className="input-field pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select 
            className="input-field"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        <div>
          <select 
            className="input-field"
            value={exposureFilter}
            onChange={(e) => setExposureFilter(e.target.value)}
          >
            <option value="ALL">All Exposures</option>
            <option value="Public">Public Only</option>
            <option value="External">External Perimeter</option>
            <option value="Internal">Internal Network</option>
          </select>
        </div>

        <div>
          <select 
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score-desc">Sort by Risk Score (High to Low)</option>
            <option value="score-asc">Sort by Risk Score (Low to High)</option>
            <option value="port-asc">Sort by Port Number</option>
            <option value="host-asc">Sort by Host Name</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="glass-panel overflow-hidden border border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Host / Asset</th>
                <th className="p-4">Port / Protocol</th>
                <th className="p-4">Identified Service</th>
                <th className="p-4">Exposure</th>
                <th className="p-4">Deterministic Score</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Rules</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredFindings.map((f) => (
                <tr key={f._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-medium text-slate-200">{f.host}</td>
                  <td className="p-4 font-mono text-blue-400">
                    {f.port}/{f.protocol}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{f.service}</span>
                    {f.administrative && (
                      <span className="ml-2 text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      f.exposure === 'Public' ? 'bg-red-500/10 text-red-400' :
                      f.exposure === 'External' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {f.exposure}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${
                            f.riskScore >= 75 ? 'bg-red-500' :
                            f.riskScore >= 50 ? 'bg-orange-500' :
                            f.riskScore >= 25 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(f.riskScore, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-white text-xs">{f.riskScore}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getSeverityBadge(f.riskLevel)}`}>
                      {f.riskLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400 font-mono text-xs">
                      {f.triggeredRules?.length || 0} triggered
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/finding/${f._id}`} 
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs py-1 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all border border-blue-500/20"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredFindings.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                    No findings match the applied filter criteria.
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
