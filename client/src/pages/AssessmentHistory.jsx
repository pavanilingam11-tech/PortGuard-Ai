import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Clock, Trash2, ExternalLink, FileText, Plus, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpDown
} from 'lucide-react';

export default function AssessmentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/assessments');
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load history:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment and all associated findings? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/assessments/${id}`);
      setHistory(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert('Failed to delete assessment');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Loading assessment records...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>Assessment History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical audit logs, risk scores, and exported vulnerability reports.
          </p>
        </div>

        <Link to="/analyze" className="btn-primary text-xs flex items-center gap-1.5 self-start">
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Assessment Name</th>
                <th className="p-4">Scope / Target</th>
                <th className="p-4 text-center">Services</th>
                <th className="p-4 text-center">Critical</th>
                <th className="p-4 text-center">High</th>
                <th className="p-4 text-center">Overall Risk</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((a) => {
                const criticalCount = a.riskSummary?.critical || 0;
                const highCount = a.riskSummary?.high || 0;
                const overallRisk = a.overallRisk || 0;
                return (
                  <tr key={a._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-white">
                      <Link to={`/results/${a._id}`} className="hover:text-blue-400 transition-colors">
                        {a.name}
                      </Link>
                    </td>
                    <td className="p-4 font-mono text-slate-300 text-[11px]">
                      {a.scope || 'Perimeter Scope'}
                    </td>
                    <td className="p-4 text-center font-mono font-semibold">
                      {a.totalServices}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {criticalCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-bold ${highCount > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                        {highCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                        overallRisk >= 75 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        overallRisk >= 50 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                        overallRisk >= 25 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}>
                        {overallRisk}/100
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/results/${a._id}`}
                          className="p-1.5 text-blue-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Results"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/reports/${a._id}`}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View / Export Reports"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(a._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {history.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                    No assessments recorded yet. Run a scan to see records here.
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