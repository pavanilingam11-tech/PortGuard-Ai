import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, Download, Shield, AlertTriangle, CheckCircle2, ChevronDown, Printer
} from 'lucide-react';

export default function Reports() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('assessmentId');
  
  const [assessments, setAssessments] = useState([]);
  const [selectedId, setSelectedId] = useState(paramId || queryId || '');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/assessments')
      .then(res => {
        setAssessments(res.data);
        if (!selectedId && res.data.length > 0) {
          setSelectedId(res.data[0]._id);
        }
      })
      .catch(err => console.error('Failed to load assessments:', err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api.get(`/api/reports/${selectedId}`)
      .then(res => {
        setReportData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load report:', err);
        setLoading(false);
      });
  }, [selectedId]);

  const assessment = reportData?.assessment;
  const findings = reportData?.findings || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Security Assessment Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export executive summaries and technical port risk assessments in CSV and PDF formats.
          </p>
        </div>

        {selectedId && (
          <div className="flex items-center gap-3">
            <a 
              href={`${API_BASE_URL}/api/reports/${selectedId}/csv`}
              download
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </a>

            <a 
              href={`${API_BASE_URL}/api/reports/${selectedId}/pdf`}
              download
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Assessment Selector */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center gap-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Select Assessment:
        </label>
        <select 
          className="input-field flex-1 text-xs"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {assessments.map(a => (
            <option key={a._id} value={a._id}>
              {a.name} ({new Date(a.createdAt).toLocaleDateString()}) — {a.totalServices} Services
            </option>
          ))}
          {assessments.length === 0 && (
            <option value="">No assessments available</option>
          )}
        </select>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-400 animate-pulse">
          Loading report preview...
        </div>
      )}

      {!loading && assessment && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                  Executive Summary
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">{assessment.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Scope: {assessment.scope || 'N/A'}</p>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl min-w-[100px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Risk</div>
                  <div className={`text-2xl font-black ${assessment.overallRisk >= 75 ? 'text-red-400' : assessment.overallRisk >= 50 ? 'text-orange-400' : 'text-blue-400'}`}>
                    {assessment.overallRisk}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Total Services</span>
                <div className="font-bold text-white text-base mt-1">{assessment.totalServices}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-red-500/20">
                <span className="text-red-400 text-[11px] font-semibold">Critical Risks</span>
                <div className="font-bold text-red-400 text-base mt-1">{assessment.riskSummary?.critical || 0}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-orange-500/20">
                <span className="text-orange-400 text-[11px] font-semibold">High Risks</span>
                <div className="font-bold text-orange-400 text-base mt-1">{assessment.riskSummary?.high || 0}</div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Audit Date</span>
                <div className="font-mono text-slate-300 text-xs mt-1">
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Findings in Report */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Itemized Findings & Defensive Recommendations</h3>

            <div className="space-y-4">
              {findings.map((f, idx) => (
                <div 
                  key={f._id || idx} 
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {idx + 1}. {f.service}
                      </span>
                      <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {f.port}/{f.protocol}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({f.host})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        f.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        f.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        f.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {f.riskLevel} — {f.riskScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                    <div>Exposure: <span className="text-white font-medium">{f.exposure || 'Unknown'}</span></div>
                    <div>Encryption: <span className="text-white font-medium">{f.encryption || 'Unknown'}</span></div>
                    <div>Authentication: <span className="text-white font-medium">{f.authentication || 'Unknown'}</span></div>
                    <div>Required: <span className="text-white font-medium">{f.required || 'Yes'}</span></div>
                  </div>

                  {f.recommendations && f.recommendations.length > 0 && (
                    <div className="text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-slate-300">
                      <span className="text-emerald-400 font-semibold">Recommended Remediation: </span>
                      {f.recommendations[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}