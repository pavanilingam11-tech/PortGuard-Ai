const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');

router.get('/', async (req, res, next) => {
  try {
    const findings = await Finding.find({});
    // Calculate Stats
    const totalServices = findings.length;
    let critical = 0, high = 0, medium = 0, low = 0;
    let internetExposed = 0;
    
    findings.forEach(f => {
      if (f.riskLevel === 'CRITICAL') critical++;
      if (f.riskLevel === 'HIGH') high++;
      if (f.riskLevel === 'MEDIUM') medium++;
      if (f.riskLevel === 'LOW') low++;
      if (f.exposure === 'Public') internetExposed++;
    });
    
    const riskDistribution = [
      { name: 'Critical', value: critical },
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low }
    ];
    
    const topRiskyServices = findings
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map(f => ({
        id: f._id,
        service: f.service,
        port: f.port,
        host: f.host,
        riskScore: f.riskScore,
        riskLevel: f.riskLevel
      }));

    res.json({
      totalServices, critical, high, medium, low, internetExposed, riskDistribution, topRiskyServices
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:assessmentId', async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    
    let query = {};
    if (assessmentId) query.assessmentId = assessmentId;
    
    const findings = await Finding.find(query);
    const totalServices = findings.length;
    
    let critical = 0, high = 0, medium = 0, low = 0;
    let internetExposed = 0;
    
    // Calculate Stats
    findings.forEach(f => {
      if (f.riskLevel === 'CRITICAL') critical++;
      if (f.riskLevel === 'HIGH') high++;
      if (f.riskLevel === 'MEDIUM') medium++;
      if (f.riskLevel === 'LOW') low++;
      
      if (f.exposure === 'Public') internetExposed++;
    });
    
    const riskDistribution = [
      { name: 'Critical', value: critical },
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low }
    ];
    
    // Top Risky Services
    const topRiskyServices = findings
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map(f => ({
        id: f._id,
        service: f.service,
        port: f.port,
        host: f.host,
        riskScore: f.riskScore,
        riskLevel: f.riskLevel
      }));

    res.json({
      totalServices,
      critical,
      high,
      medium,
      low,
      internetExposed,
      riskDistribution,
      topRiskyServices
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
