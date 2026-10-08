import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, BrainCircuit, ShieldAlert, CheckCircle, Lock, Shield, AlertTriangle, Lightbulb, FileText, CheckCircle2
} from 'lucide-react';

export default function FindingDetails() {
  const { id } = useParams();
  const [finding, setFinding] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/findings/${id}`)
      .then(res => setFinding(res.data))
      .catch(err => {
        console.error('Failed to load finding:', err);
        setError('Finding not found or server error.');
      });
  }, [id]);

  const requestExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/api/findings/${id}/explain`);
      if (res.data) {
        setFinding(prev => ({
          ...prev,
          aiExplanation: res.data.aiExplanation || res.data
        }));
      }
    } catch (err) {
      alert('Failed to obtain AI explanation from backend.');
    } finally {
      setAiLoading(false);
    }
  };

  const markReviewed = async () => {
    setReviewLoading(true);
    try {
      const res = await api.patch(`/api/findings/${id}/review`, { reviewed: true });
      setFinding(prev => ({ ...prev, reviewed: true }));
    } catch (err) {
      alert('Failed to mark finding as reviewed.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 max-w-xl mx-auto text-center space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto" />
        <div className="font-bold">{error}</div>
        <Link to="/" className="btn-secondary inline-block text-xs">Return to Dashboard</Link>
      </div>
    );
  }

  if (!finding) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Loading finding details...</div>;
  }

  const riskLevel = finding.riskLevel || 'LOW';
  const riskScore = finding.riskScore || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link 
            to={`/results/${finding.assessmentId}`} 
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{finding.service || 'Service Finding'}</span>
              <span className="font-mono text-base text-blue-400 font-normal">
                {finding.port}/{finding.protocol}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Host: <span className="font-mono text-slate-300">{finding.host}</span> • Category: <span className="text-slate-300">{finding.category || 'Standard'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {finding.reviewed ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Analyst Reviewed</span>
            </span>
          ) : (
            <button 
              onClick={markReviewed}
              disabled={reviewLoading}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{reviewLoading ? 'Updating...' : 'Mark as Reviewed'}</span>
            </button>
          )}

          <Link 
            to={`/reports/${finding.assessmentId}`}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>View Full Report</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context, Risk Factors, and Triggered Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context & Configuration */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>Service Attributes & Exposure</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Exposure</span>
                <span className={`font-bold mt-1 inline-block text-sm ${finding.exposure === 'Public' ? 'text-red-400' : finding.exposure === 'External' ? 'text-orange-400' : 'text-slate-200'}`}>
                  {finding.exposure || 'Unknown'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Encryption</span>
                <span className={`font-bold mt-1 inline-block text-sm ${finding.encryption === 'None' ? 'text-red-400' : 'text-slate-200'}`}>
                  {finding.encryption || 'Unknown'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Authentication</span>
                <span className="font-bold mt-1 inline-block text-sm text-slate-200">
                  {finding.authentication || 'Unknown'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Business Required</span>
                <span className={`font-bold mt-1 inline-block text-sm ${finding.required === 'No' ? 'text-orange-400' : 'text-slate-200'}`}>
                  {finding.required || 'Yes'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Service State</span>
                <span className="font-bold mt-1 inline-block text-sm text-slate-200">
                  {finding.state || 'open'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Operational Role</span>
                <span className="font-bold mt-1 inline-block text-sm text-slate-200 line-clamp-1">
                  {finding.purpose || 'Service'}
                </span>
              </div>
            </div>

            {finding.configurationNotes && (
              <div className="text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-slate-400">
                <span className="text-slate-300 font-semibold">Analyst Notes: </span>
                {finding.configurationNotes}
              </div>
            )}
          </div>

          {/* Deterministic Factor Breakdown */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Risk Factor Contribution</span>
              </h3>
              <span className="text-[11px] text-slate-400">Formula-Calculated (Max 100)</span>
            </div>

            <div className="space-y-2.5">
              {(finding.riskFactors || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white text-xs">{f.factor}</div>
                    <div className="text-[11px] text-slate-400">{f.reason}</div>
                  </div>
                  <div className={`font-mono font-extrabold text-sm ${f.score > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    +{f.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triggered Rules & Defensive Recommendations */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>Triggered Security Rules</span>
            </h3>

            <div className="space-y-3">
              {(finding.triggeredRules || []).map((r, i) => {
                const ruleId = typeof r === 'object' ? r.ruleId : r.split(':')[0];
                const ruleName = typeof r === 'object' ? r.name : r.split(':').slice(1).join(':');
                return (
                  <div key={i} className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
                        {ruleId}
                      </span>
                      <span className="font-semibold text-white">{ruleName}</span>
                    </div>
                  </div>
                );
              })}
              {(!finding.triggeredRules || finding.triggeredRules.length === 0) && (
                <div className="text-slate-500 text-xs py-2">No defensive violation rules triggered for this service.</div>
              )}
            </div>

            {finding.recommendations && finding.recommendations.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span>Defensive Hardening Recommendations</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                  {finding.recommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Score Summary & AI Assistant */}
        <div className="space-y-6">
          {/* Risk Score Widget */}
          <div className="glass-panel p-6 text-center space-y-3">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Total Risk Score
            </div>
            
            <div className="relative inline-flex items-center justify-center">
              <span className={`text-6xl font-black ${
                riskScore >= 75 ? 'text-red-400' :
                riskScore >= 50 ? 'text-orange-400' :
                riskScore >= 25 ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {riskScore}
              </span>
              <span className="text-slate-500 text-sm font-bold absolute -bottom-1">/ 100</span>
            </div>

            <div className="pt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                'bg-blue-500/20 text-blue-400 border-blue-500/40'
              }`}>
                {riskLevel} Severity
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
              Calculated deterministically. Score is immune to hallucination and never altered by AI prompts.
            </p>
          </div>

          {/* AI Explanation Assistant */}
          <div className="glass-panel p-6 space-y-4 border-blue-500/30 relative overflow-hidden bg-gradient-to-b from-blue-950/20 to-slate-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                <span>AI Security Explainer</span>
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                Non-Authoritative
              </span>
            </div>

            {finding.aiExplanation ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {finding.aiExplanation}
                </div>
                <button 
                  onClick={requestExplanation}
                  disabled={aiLoading}
                  className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center py-1"
                >
                  {aiLoading ? 'Refreshing...' : 'Regenerate Analysis'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Request an AI explanation summarizing the service role, exposure impact, contributing factors, and defensive remedies.
                </p>
                <button 
                  onClick={requestExplanation}
                  disabled={aiLoading}
                  className="w-full btn-primary text-xs flex justify-center items-center gap-2 py-2.5"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>{aiLoading ? 'Generating Analysis...' : 'Generate AI Explanation'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
