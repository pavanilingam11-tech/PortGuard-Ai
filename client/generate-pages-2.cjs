const fs = require('fs');
const path = require('path');

const clientPath = 'c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/client';

const files = {
  'src/pages/KnowledgeBase.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

export default function KnowledgeBase() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services').then(res => setServices(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-dark-border pb-4">
        <BookOpen className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-bold">Service Knowledge Base</h2>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border text-dark-muted text-sm uppercase">
            <tr>
              <th className="p-4 font-medium">Port/Proto</th>
              <th className="p-4 font-medium">Service Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Sensitivity</th>
              <th className="p-4 font-medium text-center">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {services.map((s, i) => (
              <tr key={i} className="hover:bg-dark-bg/50 transition-colors">
                <td className="p-4 font-mono text-sm text-blue-400">{s.key}</td>
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4">{s.category}</td>
                <td className="p-4">{s.sensitivity}</td>
                <td className="p-4 text-center">{s.administrative ? <span className="text-red-400 font-bold">Yes</span> : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/pages/AssessmentHistory.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function AssessmentHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/assessments').then(res => setHistory(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-dark-border pb-4">
        <Clock className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-bold">Assessment History</h2>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border text-dark-muted text-sm uppercase">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Services</th>
              <th className="p-4 font-medium">Critical</th>
              <th className="p-4 font-medium">Total Risk</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {history.map((a, i) => (
              <tr key={i} className="hover:bg-dark-bg/50 transition-colors">
                <td className="p-4 text-sm text-dark-muted">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium">{a.name}</td>
                <td className="p-4">{a.totalServices}</td>
                <td className="p-4 text-red-500 font-bold">{a.riskSummary?.critical || 0}</td>
                <td className="p-4">{a.overallRisk}/100</td>
                <td className="p-4 text-right">
                  <Link to={\`/results/\${a._id}\`} className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-dark-muted">No assessments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/pages/Reports.jsx': `export default function Reports() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>
      <div className="bg-dark-card border border-dark-border p-8 rounded-lg shadow text-center text-dark-muted">
        Select an assessment from History to export CSV or PDF reports.
      </div>
    </div>
  );
}`,
  'src/pages/Settings.jsx': `export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Configuration</h2>
      
      <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">AI Assistant Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-dark-muted mb-1">AI Provider</label>
            <select className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-blue-500">
              <option>Google Gemini</option>
              <option>Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">API Key (Saved in Backend .env)</label>
            <input type="password" disabled value="*****************" className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 opacity-50 cursor-not-allowed" />
          </div>
        </div>
      </div>
      
      <div className="bg-dark-card border border-dark-border p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Security Warning</h3>
        <p className="text-yellow-500 font-medium">For authorized defensive security assessments only.</p>
        <p className="text-sm text-dark-muted">PortGuard AI is strictly designed for defensive risk analysis. Do not use this tool on unauthorized systems.</p>
      </div>
    </div>
  );
}`,
  'postcss.config.cjs': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(clientPath, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
