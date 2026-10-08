const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  protocol: { type: String, required: true },
  service: { type: String },
  category: { type: String },
  purpose: { type: String },
  exposure: { type: String },
  state: { type: String },
  authentication: { type: String },
  encryption: { type: String },
  required: { type: String },
  configurationNotes: { type: String },
  confidence: { type: String },
  riskScore: { type: Number },
  riskLevel: { type: String },
  riskFactors: { type: Array, default: [] },
  triggeredRules: { type: Array, default: [] },
  recommendations: { type: Array, default: [] },
  aiExplanation: { type: String },
  reviewed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Finding', findingSchema);
