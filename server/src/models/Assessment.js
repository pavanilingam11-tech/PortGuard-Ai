const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scope: { type: String },
  source: { type: String },
  totalServices: { type: Number, default: 0 },
  riskSummary: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  overallRisk: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
