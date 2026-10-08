const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const { calculateRisk } = require('../services/riskEngine');

// Create new assessment
router.post('/', async (req, res, next) => {
  try {
    const { name, scope, source } = req.body;
    const assessment = new Assessment({ name, scope, source });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
});

// Analyze (process multiple services)
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { services } = req.body; // Array of service objects

    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let riskSummary = { critical: 0, high: 0, medium: 0, low: 0 };
    let totalRiskScore = 0;

    const findings = [];
    for (const service of services) {
      const riskData = calculateRisk(service);
      const finding = new Finding({
        assessmentId: id,
        host: service.host || scope,
        port: service.port,
        protocol: service.protocol,
        service: riskData.enrichedData.name,
        category: riskData.enrichedData.category,
        purpose: riskData.enrichedData.purpose,
        exposure: riskData.enrichedData.exposure,
        state: riskData.enrichedData.state,
        authentication: riskData.enrichedData.authentication,
        encryption: riskData.enrichedData.encryption,
        required: riskData.enrichedData.required,
        configurationNotes: service.configurationNotes,
        confidence: riskData.enrichedData.confidence,
        riskScore: riskData.riskScore,
        riskLevel: riskData.riskLevel,
        riskFactors: riskData.riskFactors,
        triggeredRules: riskData.triggeredRules,
        recommendations: riskData.recommendations
      });
      await finding.save();
      findings.push(finding);

      if (riskData.riskLevel === 'CRITICAL') riskSummary.critical++;
      else if (riskData.riskLevel === 'HIGH') riskSummary.high++;
      else if (riskData.riskLevel === 'MEDIUM') riskSummary.medium++;
      else if (riskData.riskLevel === 'LOW') riskSummary.low++;

      totalRiskScore += riskData.riskScore;
    }

    assessment.totalServices += services.length;
    assessment.riskSummary = {
      critical: assessment.riskSummary.critical + riskSummary.critical,
      high: assessment.riskSummary.high + riskSummary.high,
      medium: assessment.riskSummary.medium + riskSummary.medium,
      low: assessment.riskSummary.low + riskSummary.low,
    };
    assessment.overallRisk = assessment.totalServices > 0 ? Math.round(totalRiskScore / assessment.totalServices) : 0;
    
    await assessment.save();

    res.status(200).json({ assessment, findings });
  } catch (error) {
    next(error);
  }
});

// Get all assessments
router.get('/', async (req, res, next) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    next(error);
  }
});

// Get assessment findings
router.get('/:id/findings', async (req, res, next) => {
  try {
    const findings = await Finding.find({ assessmentId: req.params.id });
    res.json(findings);
  } catch (error) {
    next(error);
  }
});

// Get single assessment
router.get('/:id', async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    next(error);
  }
});

// Delete assessment
router.delete('/:id', async (req, res, next) => {
  try {
    await Finding.deleteMany({ assessmentId: req.params.id });
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assessment deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
