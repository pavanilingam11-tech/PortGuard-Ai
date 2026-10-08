const fs = require('fs');
const path = require('path');

const serverPath = 'c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/server';

const files = {
  'src/routes/assessments.js': `const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const { calculateRisk } = require('../services/riskEngine');
const { evaluateRules } = require('../services/ruleEngine');
const { identifyService } = require('../services/serviceIdentificationService');
const Rule = require('../models/Rule');

router.post('/', async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Not found' });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const { services } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let riskSummary = { critical: 0, high: 0, medium: 0, low: 0 };
    let totalScore = 0;
    
    // Seed rules if none exist
    let activeRules = await Rule.find({ enabled: true });
    if (activeRules.length === 0) {
       activeRules = [
         { ruleId: 'RULE-001', name: 'Admin Exposed', enabled: true },
         { ruleId: 'RULE-002', name: 'Unencrypted Exposed', enabled: true },
         { ruleId: 'RULE-003', name: 'Unnecessary Service', enabled: true },
         { ruleId: 'RULE-004', name: 'Unknown Auth Sensitive', enabled: true },
         { ruleId: 'RULE-005', name: 'Unknown Service', enabled: true }
       ];
    }

    const findings = [];
    for (const item of services) {
      const serviceInfo = identifyService(item.port, item.protocol);
      item.service = item.service || serviceInfo.name;
      item.category = item.category || serviceInfo.category;
      item.purpose = item.purpose || serviceInfo.purpose;
      
      const riskData = calculateRisk(item, serviceInfo);
      const ruleData = evaluateRules(item, serviceInfo, activeRules);

      const finding = new Finding({
        ...item,
        assessmentId: assessment._id,
        riskScore: riskData.score,
        riskLevel: riskData.severity,
        riskFactors: riskData.factors,
        triggeredRules: ruleData.triggeredRules.map(r => r._id || r.ruleId), // Handling mock ids
        recommendations: ruleData.recommendations
      });
      
      findings.push(finding);
      
      if (riskData.severity === 'CRITICAL') riskSummary.critical++;
      else if (riskData.severity === 'HIGH') riskSummary.high++;
      else if (riskData.severity === 'MEDIUM') riskSummary.medium++;
      else if (riskData.severity === 'LOW') riskSummary.low++;
      
      totalScore += riskData.score;
    }

    await Finding.insertMany(findings);
    
    assessment.totalServices = findings.length;
    assessment.riskSummary = riskSummary;
    assessment.overallRisk = findings.length > 0 ? Math.round(totalScore / findings.length) : 0;
    await assessment.save();

    res.json({ assessment, findings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/findings', async (req, res) => {
  try {
    const findings = await Finding.find({ assessmentId: req.params.id }).populate('triggeredRules');
    res.json(findings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`,
  'src/routes/findings.js': `const express = require('express');
const router = express.Router();
const Finding = require('../models/Finding');
const { getAIExplanation } = require('../services/aiService');

router.get('/:id', async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id).populate('triggeredRules');
    if (!finding) return res.status(404).json({ error: 'Not found' });
    res.json(finding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/review', async (req, res) => {
  try {
    const finding = await Finding.findByIdAndUpdate(req.params.id, { reviewed: req.body.reviewed }, { new: true });
    res.json(finding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/explain', async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id);
    if (!finding) return res.status(404).json({ error: 'Not found' });
    
    const explanation = await getAIExplanation(finding);
    finding.aiExplanation = explanation;
    await finding.save();
    
    res.json(finding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`,
  'src/routes/services.js': `const express = require('express');
const router = express.Router();
const { knownServices } = require('../services/serviceIdentificationService');

router.get('/', (req, res) => {
  const servicesList = Object.keys(knownServices).map(key => ({
    key,
    ...knownServices[key]
  }));
  res.json(servicesList);
});

module.exports = router;
`,
  'src/services/aiService.js': `
const getAIExplanation = async (findingData) => {
  // In a real scenario, this would call Gemini.
  // We'll simulate a safe fallback explanation.
  if (!process.env.AI_API_KEY) {
     return \`Fallback Explanation: \${findingData.service} running on port \${findingData.port}/\${findingData.protocol} is exposed with \${findingData.exposure} access. This resulted in a risk score of \${findingData.riskScore}. Please review its necessity and access controls.\`;
  }
  
  return \`AI Explanation for \${findingData.service}: This service exposes \${findingData.protocol} on port \${findingData.port}. Its \${findingData.exposure} state increases risk, especially since encryption is \${findingData.encryption}.\`;
};

module.exports = { getAIExplanation };
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(serverPath, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
