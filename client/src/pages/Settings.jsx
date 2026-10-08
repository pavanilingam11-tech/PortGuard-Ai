import { useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Cpu, Database, CheckCircle2, Lock, Sliders } from 'lucide-react';

export default function Settings() {
  const [aiProvider, setAiProvider] = useState('Google Gemini');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-400" />
          <span>System Settings & Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage AI assistance toggles, deterministic risk engine parameters, and deployment environment status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Assistant Settings */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>AI Explainer Module</span>
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
              Active Fallback Safe
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                AI Provider Engine
              </label>
              <select 
                className="input-field"
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
              >
                <option value="Google Gemini">Google Gemini (Recommended)</option>
                <option value="Disabled">Disabled (Local Deterministic Fallback Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                AI Model Target
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Backend AI Key Status
              </label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-400 text-xs flex-1">Stored securely in server/.env</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Protected</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
              Note: AI provides qualitative context and hardening advice only. The deterministic score (0–100) is calculated strictly by backend rule formulas.
            </p>
          </div>
        </div>

        {/* Deterministic Scoring Thresholds */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Risk Scoring Thresholds</span>
            </h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
              Deterministic
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <span className="font-bold">CRITICAL</span>
              <span className="font-mono font-bold">75 – 100 points</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <span className="font-bold">HIGH</span>
              <span className="font-mono font-bold">50 – 74 points</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <span className="font-bold">MEDIUM</span>
              <span className="font-mono font-bold">25 – 49 points</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <span className="font-bold">LOW</span>
              <span className="font-mono font-bold">0 – 24 points</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            Factor weights: Internet Exposure (max 30 pts), Service Sensitivity (max 25 pts), Security Weakness (max 25 pts), Configuration / Necessity (max 20 pts).
          </div>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="glass-panel p-6 space-y-3 border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-900/60">
        <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Defensive Security Policy & Ethical Use</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          PortGuard AI is explicitly designed for authorized defensive security postures, network perimeter auditing, and risk surface identification. It does not contain offensive exploitation tools or malicious payload generation capabilities.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Environment: Node.js + Express (Port 5000) • MongoDB (Port 27017) • CQ-M17 Edition</span>
        </div>
      </div>
    </div>
  );
}