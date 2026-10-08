import React, { useState } from 'react';
import api from '../services/api';
import { 
  Upload, FileUp, Plus, Server, CheckCircle2, Trash2, AlertTriangle, ShieldCheck, FileSpreadsheet, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewAnalysis = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [services, setServices] = useState([]);
  const [assessmentName, setAssessmentName] = useState('');
  const [scope, setScope] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // Manual Entry Form State
  const [manualForm, setManualForm] = useState({
    host: '',
    port: '',
    protocol: 'TCP',
    service: '',
    exposure: 'Public',
    state: 'open',
    authentication: 'None',
    encryption: 'None',
    required: 'Yes',
    configurationNotes: ''
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setServices(prev => [...prev, ...res.data.services]);
      setUploading(false);
      setFile(null);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error || 'Failed to parse CSV file. Ensure columns: host, port, protocol are present.');
      setUploading(false);
    }
  };

  const handleAddManualService = (e) => {
    e.preventDefault();
    if (!manualForm.host || !manualForm.port) {
      alert('Host and Port are required.');
      return;
    }
    const newService = {
      ...manualForm,
      port: parseInt(manualForm.port, 10)
    };
    setServices(prev => [...prev, newService]);
    // Reset modal
    setManualForm({
      host: manualForm.host, // keep host for convenience
      port: '',
      protocol: 'TCP',
      service: '',
      exposure: 'Public',
      state: 'open',
      authentication: 'None',
      encryption: 'None',
      required: 'Yes',
      configurationNotes: ''
    });
    setShowManualModal(false);
  };

  const handleRemoveService = (index) => {
    setServices(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAnalyze = async () => {
    if (!assessmentName.trim()) {
      alert('Please enter an Assessment Name.');
      return;
    }
    if (services.length === 0) {
      alert('Please import a CSV or manually add at least one service to evaluate.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      // 1. Create Assessment
      const assessRes = await api.post('/api/assessments', {
        name: assessmentName.trim(),
        scope: scope.trim() || 'Perimeter Network Scope',
        source: file ? 'csv' : 'manual'
      });

      const assessmentId = assessRes.data._id;

      // 2. Analyze all services through the deterministic risk & rule engine
      await api.post(`/api/assessments/${assessmentId}/analyze`, {
        services
      });

      // 3. Navigate directly to results page for immediate review
      navigate(`/results/${assessmentId}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      setErrorMessage(error.response?.data?.error || 'Analysis execution failed. Please check the backend connection.');
      setAnalyzing(false);
    }
  };

  const loadSampleDataset = async () => {
    const samples = [
      { host: 'edge-gw.corp.net', port: 3389, protocol: 'TCP', service: 'RDP', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'No', configurationNotes: 'Legacy remote desktop' },
      { host: 'edge-gw.corp.net', port: 23, protocol: 'TCP', service: 'Telnet', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'No', configurationNotes: 'Cleartext management' },
      { host: 'app.corp.net', port: 443, protocol: 'TCP', service: 'HTTPS', exposure: 'Public', encryption: 'TLS 1.3', authentication: 'Required', required: 'Yes', configurationNotes: 'Production web app' },
      { host: 'app.corp.net', port: 80, protocol: 'TCP', service: 'HTTP', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'Yes', configurationNotes: 'Redirect service' },
      { host: 'bastion.corp.net', port: 22, protocol: 'TCP', service: 'SSH', exposure: 'External', encryption: 'SSH-2.0', authentication: 'Required', required: 'Yes', configurationNotes: 'Hardened bastion' }
    ];
    setAssessmentName('CQ-M17 Automated Perimeter Scan');
    setScope('192.168.10.0/24 & dmz.corp.net');
    setServices(samples);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">New Assessment</h2>
          <p className="text-sm text-slate-400 mt-1">
            Import port scan results via CSV or enter service specifications manually for defensive evaluation.
          </p>
        </div>
        <button 
          onClick={loadSampleDataset}
          type="button"
          className="btn-secondary text-xs flex items-center gap-2 self-start"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Load Hackathon Sample</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assessment Details */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Assessment Scope & Details</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Assessment Name *
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Q4 External Perimeter Audit"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Scope / Assets
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., 10.0.0.0/24, edge-gw.corp.net"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          <div className="pt-2 text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-300">Deterministic Scoring:</span> All loaded ports are evaluated against standardized exposure formulas and transparent security rules (RULE-001 through RULE-005).
          </div>
        </div>

        {/* Import & Actions */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Input Methods</h3>
            
            <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-6 text-center hover:bg-slate-800/40 transition-colors">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                id="csv-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl mb-2 border border-blue-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-white text-sm font-semibold">
                  {file ? file.name : 'Choose CSV scan file'}
                </span>
                <span className="text-slate-400 text-xs mt-1">
                  Supports columns: host, port, protocol, service, exposure, etc.
                </span>
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button 
              className="btn-secondary flex-1 flex justify-center items-center gap-2 text-xs"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <FileUp className="w-4 h-4 text-blue-400" /> 
              <span>{uploading ? 'Parsing...' : 'Upload & Parse CSV'}</span>
            </button>

            <button 
              onClick={() => setShowManualModal(true)}
              className="btn-secondary flex-1 flex justify-center items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> 
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      {services.length > 0 && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Staged Services for Risk Evaluation</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-mono">
                {services.length} items loaded
              </span>
              <button 
                onClick={() => setServices([])}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3">Host / Asset</th>
                  <th className="px-4 py-3">Port / Proto</th>
                  <th className="px-4 py-3">Service Name</th>
                  <th className="px-4 py-3">Exposure</th>
                  <th className="px-4 py-3">Encryption</th>
                  <th className="px-4 py-3">Auth</th>
                  <th className="px-4 py-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {services.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 font-mono text-slate-200">{s.host}</td>
                    <td className="px-4 py-2.5 font-mono text-blue-400">{s.port}/{s.protocol}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{s.service || 'Auto-detect'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        s.exposure === 'Public' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        s.exposure === 'External' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {s.exposure}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{s.encryption || 'Unknown'}</td>
                    <td className="px-4 py-2.5 text-slate-400">{s.authentication || 'Unknown'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button 
                        onClick={() => handleRemoveService(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end pt-3">
            <button 
              className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              <Server className="w-4 h-4" />
              <span>{analyzing ? 'Executing Risk Analysis Engine...' : 'Run Risk Engine Analysis'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Add Service Manually
              </h3>
              <button 
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualService} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Host / IP *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., 10.0.0.1 or app.domain"
                    className="input-field" 
                    value={manualForm.host}
                    onChange={(e) => setManualForm({ ...manualForm, host: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Port Number *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g., 22, 443, 3389"
                    className="input-field" 
                    value={manualForm.port}
                    onChange={(e) => setManualForm({ ...manualForm, port: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Protocol</label>
                  <select 
                    className="input-field"
                    value={manualForm.protocol}
                    onChange={(e) => setManualForm({ ...manualForm, protocol: e.target.value })}
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., SSH, HTTPS (auto-identified if empty)"
                    className="input-field" 
                    value={manualForm.service}
                    onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Exposure</label>
                  <select 
                    className="input-field"
                    value={manualForm.exposure}
                    onChange={(e) => setManualForm({ ...manualForm, exposure: e.target.value })}
                  >
                    <option value="Public">Public</option>
                    <option value="External">External</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Encryption</label>
                  <select 
                    className="input-field"
                    value={manualForm.encryption}
                    onChange={(e) => setManualForm({ ...manualForm, encryption: e.target.value })}
                  >
                    <option value="None">None (Cleartext)</option>
                    <option value="TLS">TLS / SSL</option>
                    <option value="SSH">SSH Encrypted</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Authentication</label>
                  <select 
                    className="input-field"
                    value={manualForm.authentication}
                    onChange={(e) => setManualForm({ ...manualForm, authentication: e.target.value })}
                  >
                    <option value="None">None</option>
                    <option value="Required">Required</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Business Required?</label>
                  <select 
                    className="input-field"
                    value={manualForm.required}
                    onChange={(e) => setManualForm({ ...manualForm, required: e.target.value })}
                  >
                    <option value="Yes">Yes (Necessary)</option>
                    <option value="No">No (Unnecessary / Flag)</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service State</label>
                  <select 
                    className="input-field"
                    value={manualForm.state}
                    onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="filtered">Filtered</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Configuration Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g., Departmental server discovered during audit"
                  className="input-field" 
                  value={manualForm.configurationNotes}
                  onChange={(e) => setManualForm({ ...manualForm, configurationNotes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowManualModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAnalysis;
