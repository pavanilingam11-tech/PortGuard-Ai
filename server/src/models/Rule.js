const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  condition: { type: Object },
  weight: { type: Number },
  recommendation: { type: String },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
