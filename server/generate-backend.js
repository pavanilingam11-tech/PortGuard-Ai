const fs = require('fs');
const path = require('path');

const serverPath = 'c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/server';

const files = {
  'src/models/Finding.js': `const mongoose = require('mongoose');

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
  riskFactors: { type: Array },
  triggeredRules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rule' }],
  recommendations: { type: Array },
  aiExplanation: { type: String },
  reviewed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Finding', findingSchema);
`,
  'src/models/Service.js': `const mongoose = require('mongoose');

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
`,
  'src/models/Rule.js': `const mongoose = require('mongoose');

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
`,
  'src/services/riskEngine.js': `
const calculateRisk = (findingData, serviceData) => {
  let score = 0;
  const factors = [];

  // Internet Exposure: max 30
  if (findingData.exposure === 'Public' || findingData.exposure === 'Internet') {
    score += 30;
    factors.push({ factor: 'Exposure', score: 30, reason: 'Service is publicly exposed to the internet.' });
  } else if (findingData.exposure === 'Internal') {
    score += 10;
    factors.push({ factor: 'Exposure', score: 10, reason: 'Service is internally exposed.' });
  }

  // Service Sensitivity: max 25
  if (serviceData && serviceData.sensitivity === 'High') {
    score += 25;
    factors.push({ factor: 'Sensitivity', score: 25, reason: 'Highly sensitive service.' });
  } else if (serviceData && serviceData.sensitivity === 'Medium') {
    score += 15;
    factors.push({ factor: 'Sensitivity', score: 15, reason: 'Moderately sensitive service.' });
  }

  // Security Weakness: max 25
  if (findingData.encryption === 'No' || findingData.encryption === 'Unencrypted') {
    score += 15;
    factors.push({ factor: 'Security', score: 15, reason: 'Data in transit is not encrypted.' });
  }
  if (findingData.authentication === 'None' || findingData.authentication === 'Unknown') {
    score += 10;
    factors.push({ factor: 'Security', score: 10, reason: 'Authentication is missing or unknown.' });
  }

  // Configuration / Necessity: max 20
  if (findingData.required === 'No') {
    score += 20;
    factors.push({ factor: 'Configuration', score: 20, reason: 'Service is marked as not required.' });
  } else if (findingData.required === 'Unknown') {
    score += 10;
    factors.push({ factor: 'Configuration', score: 10, reason: 'Necessity of service is unknown.' });
  }

  score = Math.min(score, 100);

  let severity = 'LOW';
  if (score >= 75) severity = 'CRITICAL';
  else if (score >= 50) severity = 'HIGH';
  else if (score >= 25) severity = 'MEDIUM';

  return { score, severity, factors };
};

module.exports = { calculateRisk };
`,
  'src/services/ruleEngine.js': `
const evaluateRules = (findingData, serviceData, activeRules) => {
  const triggeredRules = [];
  const recommendations = [];

  activeRules.forEach(rule => {
    let triggered = false;

    if (rule.ruleId === 'RULE-001' && serviceData?.administrative && (findingData.exposure === 'Public' || findingData.exposure === 'Internet')) {
      triggered = true;
    }
    if (rule.ruleId === 'RULE-002' && (findingData.encryption === 'No' || findingData.encryption === 'Unencrypted') && (findingData.exposure === 'Public' || findingData.exposure === 'Internet')) {
      triggered = true;
    }
    if (rule.ruleId === 'RULE-003' && findingData.required === 'No') {
      triggered = true;
    }
    if (rule.ruleId === 'RULE-004' && serviceData?.sensitivity === 'High' && (findingData.authentication === 'Unknown' || findingData.authentication === 'None')) {
      triggered = true;
    }
    if (rule.ruleId === 'RULE-005' && (!findingData.service || findingData.service === 'Unknown')) {
      triggered = true;
    }

    if (triggered) {
      triggeredRules.push(rule);
      if (rule.recommendation) recommendations.push(rule.recommendation);
    }
  });

  return { triggeredRules, recommendations };
};

module.exports = { evaluateRules };
`,
  'src/services/serviceIdentificationService.js': `
const knownServices = {
  '22/TCP': { name: 'SSH', category: 'Management', purpose: 'Secure remote administration', sensitivity: 'High', encryptedByDefault: true, administrative: true },
  '23/TCP': { name: 'Telnet', category: 'Management', purpose: 'Unencrypted remote administration', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '25/TCP': { name: 'SMTP', category: 'Mail', purpose: 'Email routing', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '53/TCP': { name: 'DNS', category: 'Network', purpose: 'Domain name resolution', sensitivity: 'Low', encryptedByDefault: false, administrative: false },
  '53/UDP': { name: 'DNS', category: 'Network', purpose: 'Domain name resolution', sensitivity: 'Low', encryptedByDefault: false, administrative: false },
  '80/TCP': { name: 'HTTP', category: 'Web', purpose: 'Unencrypted web traffic', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '110/TCP': { name: 'POP3', category: 'Mail', purpose: 'Email retrieval', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '143/TCP': { name: 'IMAP', category: 'Mail', purpose: 'Email retrieval', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '443/TCP': { name: 'HTTPS', category: 'Web', purpose: 'Secure web traffic', sensitivity: 'Medium', encryptedByDefault: true, administrative: false },
  '445/TCP': { name: 'SMB', category: 'File Sharing', purpose: 'Windows file sharing', sensitivity: 'High', encryptedByDefault: false, administrative: false },
  '3306/TCP': { name: 'MySQL', category: 'Database', purpose: 'Database management', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '5432/TCP': { name: 'PostgreSQL', category: 'Database', purpose: 'Database management', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '3389/TCP': { name: 'RDP', category: 'Management', purpose: 'Remote Desktop Protocol', sensitivity: 'High', encryptedByDefault: true, administrative: true },
};

const identifyService = (port, protocol) => {
  const key = \`\${port}/\${protocol.toUpperCase()}\`;
  return knownServices[key] || { name: 'Unknown / Needs Verification', category: 'Unknown', purpose: 'Unknown', sensitivity: 'Unknown', encryptedByDefault: false, administrative: false };
};

module.exports = { identifyService, knownServices };
`,
  'src/server.js': `
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
const assessmentRoutes = require('./routes/assessments');
const findingRoutes = require('./routes/findings');
const serviceRoutes = require('./routes/services');

app.use('/api/assessments', assessmentRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/services', serviceRoutes);

app.get('/api/dashboard/:assessmentId', async (req, res) => {
    res.json({ message: 'Dashboard data endpoint' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portguard';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(serverPath, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
