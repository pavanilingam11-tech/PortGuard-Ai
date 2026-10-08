const fs = require('fs');
const path = require('path');

const clientPath = 'c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/client';

const files = {
  'src/pages/Dashboard.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Activity, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ assessments: 0, critical: 0, totalServices: 0 });
  
  useEffect(() => {
    // In a real app we'd fetch actual aggregated stats.
    axios.get('http://localhost:5000/api/assessments').then(res => {
      const assessments = res.data;
      const critical = assessments.reduce((acc, curr) => acc + (curr.riskSummary?.critical || 0), 0);
      const totalServices = assessments.reduce((acc, curr) => acc + (curr.totalServices || 0), 0);
      setStats({ assessments: assessments.length, critical, totalServices });
    }).catch(console.error);
  }, []);

  const data = [
    { name: 'Mon', risks: 4 },
    { name: 'Tue', risks: 3 },
    { name: 'Wed', risks: 2 },
    { name: 'Thu', risks: 7 },
    { name: 'Fri', risks: 1 },
    { name: 'Sat', risks: 0 },
    { name: 'Sun', risks: 5 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Posture Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Assessments" value={stats.assessments} icon={Activity} color="text-blue-500" />
        <StatCard title="Analyzed Services" value={stats.totalServices} icon={Server} color="text-purple-500" />
        <StatCard title="Critical Findings" value={stats.critical} icon={ShieldAlert} color="text-red-500" />
        <StatCard title="Protected Assets" value="98%" icon={ShieldCheck} color="text-green-500" />
      </div>

      <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Risk Discoveries Over Time</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
              <Bar dataKey="risks" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow flex items-center gap-4">
      <div className={\`p-3 bg-dark-bg rounded-lg \${color}\`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-dark-muted font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
`,
  'src/pages/NewAnalysis.jsx': `import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', host: '', port: '', protocol: 'TCP' });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const addService = () => {
    if (!formData.port || !formData.host) return;
    setServices([...services, { ...formData, port: Number(formData.port) }]);
    setFormData({ ...formData, port: '' });
  };

  const submitAnalysis = async () => {
    if (services.length === 0) return;
    setLoading(true);
    try {
      const assessmentRes = await axios.post('http://localhost:5000/api/assessments', {
        name: formData.name || 'Manual Assessment',
        source: 'Manual'
      });
      const id = assessmentRes.data._id;
      
      await axios.post(\`http://localhost:5000/api/assessments/\${id}/analyze\`, { services });
      navigate(\`/results/\${id}\`);
    } catch (error) {
      console.error(error);
      alert('Error submitting analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">New Security Analysis</h2>
      
      <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">1. Assessment Details</h3>
        <input 
          type="text" 
          placeholder="Assessment Name (e.g. DMZ Scan)" 
          className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">2. Add Service Manually</h3>
        <div className="grid grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Host (IP/Domain)" 
            className="bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            value={formData.host}
            onChange={e => setFormData({...formData, host: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Port (e.g. 443)" 
            className="bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            value={formData.port}
            onChange={e => setFormData({...formData, port: e.target.value})}
          />
          <select 
            className="bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            value={formData.protocol}
            onChange={e => setFormData({...formData, protocol: e.target.value})}
          >
            <option>TCP</option>
            <option>UDP</option>
          </select>
          <button 
            onClick={addService}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>
      
      {services.length > 0 && (
        <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">Services to Analyze ({services.length})</h3>
          <ul className="space-y-2">
            {services.map((s, i) => (
              <li key={i} className="flex justify-between p-3 bg-dark-bg border border-dark-border rounded">
                <span>{s.host}</span>
                <span className="font-mono text-blue-400">{s.port}/{s.protocol}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-4 border-t border-dark-border flex justify-end">
            <button 
              onClick={submitAnalysis}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white rounded px-6 py-2 transition-colors font-bold disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`,
  'src/pages/AnalysisResults.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Shield, Info } from 'lucide-react';

export default function AnalysisResults() {
  const { id } = useParams();
  const [findings, setFindings] = useState([]);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    axios.get(\`http://localhost:5000/api/assessments/\${id}\`).then(res => setAssessment(res.data));
    axios.get(\`http://localhost:5000/api/assessments/\${id}/findings\`).then(res => setFindings(res.data));
  }, [id]);

  const getSeverityColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h2 className="text-2xl font-bold">{assessment?.name || 'Analysis Results'}</h2>
          <p className="text-dark-muted text-sm mt-1">Assessment ID: {id}</p>
        </div>
        <div className="flex gap-4">
           <div className="text-center px-4 py-2 bg-dark-card border border-dark-border rounded-lg">
             <div className="text-sm text-dark-muted uppercase font-bold tracking-wider">Overall Risk</div>
             <div className="text-2xl font-bold text-red-500">{assessment?.overallRisk || 0}/100</div>
           </div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border text-dark-muted text-sm uppercase">
            <tr>
              <th className="p-4 font-medium">Host</th>
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Risk Score</th>
              <th className="p-4 font-medium">Severity</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {findings.map(f => (
              <tr key={f._id} className="hover:bg-dark-bg/50 transition-colors">
                <td className="p-4">{f.host}</td>
                <td className="p-4 font-mono text-sm text-blue-400">{f.port}/{f.protocol} <span className="text-white ml-2">{f.service}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-dark-border rounded-full h-2 max-w-[100px]">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: \`\${f.riskScore}%\` }}></div>
                    </div>
                    <span className="text-sm font-bold">{f.riskScore}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={\`px-2 py-1 rounded text-xs font-bold border \${getSeverityColor(f.riskLevel)}\`}>
                    {f.riskLevel}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link to={\`/finding/\${f._id}\`} className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {findings.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-dark-muted">No findings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,
  'src/pages/FindingDetails.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, ShieldAlert, CheckCircle } from 'lucide-react';

export default function FindingDetails() {
  const { id } = useParams();
  const [finding, setFinding] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    axios.get(\`http://localhost:5000/api/findings/\${id}\`).then(res => setFinding(res.data));
  }, [id]);

  const requestExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post(\`http://localhost:5000/api/findings/\${id}/explain\`);
      setFinding(res.data);
    } catch(err) {
      alert('Failed to get AI explanation');
    } finally {
      setAiLoading(false);
    }
  };

  const markReviewed = async () => {
    try {
      const res = await axios.patch(\`http://localhost:5000/api/findings/\${id}/review\`, { reviewed: true });
      setFinding(res.data);
    } catch(err) {
      alert('Failed to update status');
    }
  };

  if (!finding) return <div className="p-8 text-center">Loading finding details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-dark-border pb-4">
        <Link to={\`/results/\${finding.assessmentId}\`} className="p-2 hover:bg-dark-card rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-dark-muted" />
        </Link>
        <h2 className="text-2xl font-bold">Finding Details</h2>
        {finding.reviewed && <span className="ml-auto flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/20 px-3 py-1 rounded border border-green-500/50"><CheckCircle className="w-4 h-4"/> Reviewed</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500"/> Context & Configuration</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="text-dark-muted">Host:</span> <div className="font-mono text-white text-base mt-1">{finding.host}</div></div>
              <div><span className="text-dark-muted">Service:</span> <div className="font-mono text-blue-400 text-base mt-1">{finding.port}/{finding.protocol} {finding.service}</div></div>
              <div><span className="text-dark-muted">Exposure:</span> <div className="text-white text-base mt-1">{finding.exposure || 'Unknown'}</div></div>
              <div><span className="text-dark-muted">Authentication:</span> <div className="text-white text-base mt-1">{finding.authentication || 'Unknown'}</div></div>
              <div><span className="text-dark-muted">Encryption:</span> <div className="text-white text-base mt-1">{finding.encryption || 'Unknown'}</div></div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
            <h3 className="text-lg font-semibold">Deterministic Risk Factors</h3>
            <ul className="space-y-3">
              {finding.riskFactors?.map((f, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-dark-bg border border-dark-border rounded">
                  <div className="text-sm">
                    <span className="font-bold text-white block">{f.factor}</span>
                    <span className="text-dark-muted">{f.reason}</span>
                  </div>
                  <span className="font-bold text-red-400 text-lg">+{f.score}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
            <h3 className="text-lg font-semibold">Triggered Rules</h3>
            <ul className="space-y-3">
              {finding.triggeredRules?.map((r, i) => (
                <li key={i} className="p-3 bg-dark-bg border border-dark-border rounded text-sm">
                  <span className="font-bold text-orange-400">{r.ruleId}</span>: {r.name}
                </li>
              ))}
              {finding.triggeredRules?.length === 0 && <div className="text-dark-muted">No rules triggered.</div>}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow text-center">
             <div className="text-sm text-dark-muted uppercase font-bold tracking-wider mb-2">Total Risk Score</div>
             <div className="text-5xl font-bold text-red-500 mb-2">{finding.riskScore}</div>
             <div className="text-sm font-bold text-red-400">{finding.riskLevel} SEVERITY</div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/50 p-6 rounded-lg shadow space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> AI Assistant</h3>
            
            {finding.aiExplanation ? (
              <p className="text-sm text-slate-300 leading-relaxed relative z-10">{finding.aiExplanation}</p>
            ) : (
              <div className="relative z-10">
                <p className="text-sm text-slate-400 mb-4">Request an AI-generated explanation of this risk and defensive recommendations.</p>
                <button 
                  onClick={requestExplanation}
                  disabled={aiLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {aiLoading ? 'Generating...' : 'Generate Explanation'}
                </button>
              </div>
            )}
          </div>

          {!finding.reviewed && (
            <button 
              onClick={markReviewed}
              className="w-full bg-dark-card hover:bg-dark-border border border-dark-border text-white rounded px-4 py-3 transition-colors font-medium flex justify-center items-center gap-2"
            >
              <CheckCircle className="w-5 h-5"/> Mark as Reviewed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(clientPath, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
