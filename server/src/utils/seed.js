const mongoose = require('mongoose');
require('dotenv').config();
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const Rule = require('../models/Rule');
const Service = require('../models/Service');
const { calculateRisk } = require('../services/riskEngine');
const { knownServices } = require('../services/serviceIdentificationService');

const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : 'mongodb://localhost:27017/portguard';

const defaultRules = [
  { ruleId: 'RULE-001', name: 'Administrative Exposure', description: 'Increase risk when an administrative service is externally or publicly exposed.' },
  { ruleId: 'RULE-002', name: 'Unencrypted Service', description: 'Increase risk when an unencrypted service is externally or publicly exposed.' },
  { ruleId: 'RULE-003', name: 'Unnecessary Service', description: 'Flag unnecessary services for restriction or disabling.' },
  { ruleId: 'RULE-004', name: 'Unknown Authentication', description: 'Flag unknown authentication on sensitive services for verification.' },
  { ruleId: 'RULE-005', name: 'Unknown Identity', description: 'Mark unknown service identities as "Needs Verification."' }
];

const sampleServices = [
  { host: 'edge-gw.corp.net', port: 3389, protocol: 'TCP', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'No', configurationNotes: 'Legacy remote desktop interface' },
  { host: 'edge-gw.corp.net', port: 23, protocol: 'TCP', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'No', configurationNotes: 'Deprecated telnet port left open' },
  { host: 'app.corp.net', port: 443, protocol: 'TCP', exposure: 'Public', encryption: 'TLS 1.3', authentication: 'OAuth2/MFA', required: 'Yes', configurationNotes: 'Primary customer portal' },
  { host: 'app.corp.net', port: 80, protocol: 'TCP', exposure: 'Public', encryption: 'None', authentication: 'None', required: 'Yes', configurationNotes: 'HTTP redirect to HTTPS' },
  { host: 'bastion.corp.net', port: 22, protocol: 'TCP', exposure: 'External', encryption: 'SSH-2.0', authentication: 'Key-Based', required: 'Yes', configurationNotes: 'Hardened jump box' },
  { host: 'db-cluster.internal', port: 3306, protocol: 'TCP', exposure: 'Internal', encryption: 'TLS', authentication: 'Required', required: 'Yes', configurationNotes: 'Production database replica' },
  { host: 'core-router.internal', port: 53, protocol: 'UDP', exposure: 'Internal', encryption: 'None', authentication: 'None', required: 'Yes', configurationNotes: 'Internal recursive DNS resolver' },
  { host: 'dev-node-04.corp.net', port: 9999, protocol: 'TCP', exposure: 'External', encryption: 'Unknown', authentication: 'Unknown', required: 'No', configurationNotes: 'Unidentified custom daemon running' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing collections
    await Rule.deleteMany({});
    await Service.deleteMany({});
    await Assessment.deleteMany({});
    await Finding.deleteMany({});

    // Seed Rules
    await Rule.insertMany(defaultRules);
    console.log(`Seeded ${defaultRules.length} rules.`);

    // Seed Services
    const serviceDocs = Object.entries(knownServices).map(([key, val]) => ({
      port: parseInt(key.split('/')[0], 10),
      protocol: key.split('/')[1],
      name: val.name,
      category: val.category,
      purpose: val.purpose,
      sensitivity: val.sensitivity,
      encryptedByDefault: val.encryptedByDefault,
      administrative: val.administrative
    }));
    await Service.insertMany(serviceDocs);
    console.log(`Seeded ${serviceDocs.length} knowledge base services.`);

    // Create Sample Assessment
    const assessment = new Assessment({
      name: 'Perimeter Infrastructure Security Audit',
      scope: 'edge-gw.corp.net, app.corp.net, bastion.corp.net (CQ-M17 Target)',
      source: 'manual',
      totalServices: 0,
      riskSummary: { critical: 0, high: 0, medium: 0, low: 0 },
      overallRisk: 0
    });
    await assessment.save();

    let totalScore = 0;
    const summary = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const item of sampleServices) {
      const riskData = calculateRisk(item);
      const finding = new Finding({
        assessmentId: assessment._id,
        host: item.host,
        port: item.port,
        protocol: item.protocol,
        service: riskData.enrichedData.name,
        category: riskData.enrichedData.category,
        purpose: riskData.enrichedData.purpose,
        exposure: riskData.enrichedData.exposure,
        state: 'open',
        authentication: riskData.enrichedData.authentication,
        encryption: riskData.enrichedData.encryption,
        required: riskData.enrichedData.required,
        configurationNotes: item.configurationNotes,
        confidence: riskData.enrichedData.confidence || 'High',
        riskScore: riskData.riskScore,
        riskLevel: riskData.riskLevel,
        riskFactors: riskData.riskFactors,
        triggeredRules: riskData.triggeredRules,
        recommendations: riskData.recommendations,
        reviewed: false
      });
      await finding.save();

      if (riskData.riskLevel === 'CRITICAL') summary.critical++;
      else if (riskData.riskLevel === 'HIGH') summary.high++;
      else if (riskData.riskLevel === 'MEDIUM') summary.medium++;
      else summary.low++;

      totalScore += riskData.riskScore;
    }

    assessment.totalServices = sampleServices.length;
    assessment.riskSummary = summary;
    assessment.overallRisk = Math.round(totalScore / sampleServices.length);
    await assessment.save();

    console.log(`Successfully created sample assessment: ${assessment.name}`);
    console.log(`Overall Risk: ${assessment.overallRisk}/100, Findings: ${assessment.totalServices}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
