const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  port: { type: Number, required: true },
  protocol: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String },
  purpose: { type: String },
  sensitivity: { type: String },
  encryptedByDefault: { type: Boolean },
  administrative: { type: Boolean },
  typicalExposure: { type: String },
  securityNotes: { type: String },
  recommendations: { type: Array }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
