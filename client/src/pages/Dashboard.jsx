import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { 
  AlertCircle, Activity, Globe, ShieldAlert, ArrowRight, CheckCircle2, ShieldCheck, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#3b82f6'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, assessRes] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/assessments')
        ]);
        setStats(dashRes.data);
        setAssessments(assessRes.data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setError('Failed to connect to backend server. Ensure backend is running on port 5000.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading PortGuard security dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        <div className="font-semibold text-base mb-1">Backend Connectivity Error</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  const criticalCount = stats?.critical || 0;
  const highCount = stats?.high || 0;
  const postureStatus = criticalCount > 0 
    ? { label: 'CRITICAL RISK', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' }
    : highCount > 0 
    ? { label: 'ELEVATED RISK', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' }
    : { label: 'GUARDED', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Security Posture Overview</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time deterministic analysis of network services, port exposures, and defensive priorities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${postureStatus.bg} ${postureStatus.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {postureStatus.label}
          </div>
          <Link to="/analyze" className="btn-primary text-xs flex items-center gap-1.5">
            <span>New Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">Total Services</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Activity className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalServices || 0}</p>
          <div className="mt-2 text-[11px] text-slate-400">Evaluated across all network scopes</div>
        </div>
        
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">Critical Findings</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-red-400 relative z-10">{stats?.critical || 0}</p>
          <div className="mt-2 text-[11px] text-slate-400 relative z-10">Score &ge; 75/100 (Immediate action)</div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">High Risk</h3>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><ShieldAlert className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-orange-400 relative z-10">{stats?.high || 0}</p>
          <div className="mt-2 text-[11px] text-slate-400 relative z-10">Score 50–74/100 (High exposure)</div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">Internet Exposed</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Globe className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-purple-300 relative z-10">{stats?.internetExposed || 0}</p>
          <div className="mt-2 text-[11px] text-slate-400 relative z-10">Publicly accessible listeners</div>
        </div>
      </div>

      {/* Charts & Risky Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Severity Distribution</h3>
            <span className="text-xs text-slate-400">Total: {stats?.totalServices || 0} services</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.riskDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                  contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #26354a', borderRadius: '8px', color: '#fff' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {(stats?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center text-xs">
            {(stats?.riskDistribution || []).map((item, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">{item.name}</div>
                <div className="font-bold text-white text-sm mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risky Services List */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Top Risky Services</h3>
              <span className="text-xs text-slate-400">Requires Analyst Attention</span>
            </div>
            <div className="space-y-3">
              {(stats?.topRiskyServices || []).slice(0, 4).map((service, idx) => (
                <Link 
                  key={service.id || idx} 
                  to={`/finding/${service.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {service.service}
                      </span>
                      <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Port {service.port}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{service.host}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border
                      ${service.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 
                        service.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 
                        service.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'}`}>
                      {service.riskLevel}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Score: <span className="text-white font-bold">{service.riskScore}</span>/100
                    </span>
                  </div>
                </Link>
              ))}
              {(!stats?.topRiskyServices || stats.topRiskyServices.length === 0) && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No high risk services detected in database.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments Section */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Recent Security Assessments</h3>
          </div>
          <Link to="/history" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assessments.map((a) => (
            <Link 
              key={a._id}
              to={`/results/${a._id}`}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="font-semibold text-sm text-white line-clamp-1">{a.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{a.scope || 'General Audit'}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{a.totalServices} services</span>
                <span className={`font-bold ${a.overallRisk >= 75 ? 'text-red-400' : a.overallRisk >= 50 ? 'text-orange-400' : 'text-blue-400'}`}>
                  Risk: {a.overallRisk}/100
                </span>
              </div>
            </Link>
          ))}
          {assessments.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              No previous assessments found. Start by clicking "New Analysis".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
