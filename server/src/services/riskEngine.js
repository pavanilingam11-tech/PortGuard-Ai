const { evaluateRules } = require('./ruleEngine');
const { identifyService } = require('./serviceIdentificationService');

const calculateRisk = (serviceData) => {
  let score = 0;
  
  const { port, protocol, exposure, authentication, encryption, required, state } = serviceData;
  const identifiedService = identifyService(port, protocol);
  
  const enrichedFinding = {
    ...serviceData,
    ...identifiedService,
    encryption: encryption || 'Unknown',
    authentication: authentication || 'Unknown',
    required: required || 'Unknown',
    exposure: exposure || 'Unknown'
  };

  // 1. Internet Exposure: max 30 points
  let exposureScore = 0;
  let exposureReason = 'Internal or non-exposed network scope';
  if (enrichedFinding.exposure === 'Public') {
    exposureScore = 30;
    exposureReason = 'Publicly reachable from the internet (high exposure surface)';
  } else if (enrichedFinding.exposure === 'External') {
    exposureScore = 20;
    exposureReason = 'Externally exposed perimeter asset';
  } else if (enrichedFinding.exposure === 'Internal') {
    exposureScore = 5;
    exposureReason = 'Internal network asset with limited exposure';
  }
  score += exposureScore;

  // 2. Service Sensitivity & Administrative: max 25 points
  let sensitivityScore = 0;
  let sensitivityReasons = [];
  if (enrichedFinding.administrative) {
    sensitivityScore += 15;
    sensitivityReasons.push('High-privilege administrative service');
  }
  if (enrichedFinding.sensitivity === 'High') {
    sensitivityScore += 10;
    sensitivityReasons.push('High-impact asset data');
  } else if (enrichedFinding.sensitivity === 'Medium') {
    sensitivityScore += 5;
    sensitivityReasons.push('Standard business impact');
  }
  sensitivityScore = Math.min(sensitivityScore, 25);
  score += sensitivityScore;
  const sensitivityReason = sensitivityReasons.length > 0 ? sensitivityReasons.join('; ') : 'Low-impact service';

  // 3. Security Weakness (Encryption/Auth): max 25 points
  let weaknessScore = 0;
  let weaknessReasons = [];
  if (enrichedFinding.encryption === 'None' && port !== 80) {
    weaknessScore += 15;
    weaknessReasons.push('Unencrypted protocol communication');
  }
  if (enrichedFinding.authentication === 'None' && enrichedFinding.sensitivity !== 'Low') {
    weaknessScore += 10;
    weaknessReasons.push('Unauthenticated or anonymous access permitted');
  }
  weaknessScore = Math.min(weaknessScore, 25);
  score += weaknessScore;
  const weaknessReason = weaknessReasons.length > 0 ? weaknessReasons.join('; ') : 'Standard encryption and authentication mechanisms applied';

  // 4. Configuration / Necessity: max 20 points
  let configScore = 0;
  let configReasons = [];
  if (enrichedFinding.required === 'No') {
    configScore += 15;
    configReasons.push('Service marked as non-essential / unnecessary');
  }
  if (enrichedFinding.state === 'unknown' || enrichedFinding.confidence === 'Low' || enrichedFinding.name === 'Unknown / Needs Verification') {
    configScore += 5;
    configReasons.push('Unverified service signature');
  }
  configScore = Math.min(configScore, 20);
  score += configScore;
  const configReason = configReasons.length > 0 ? configReasons.join('; ') : 'Essential service in defined operating state';

  // Ensure max score is 100 and min score is 0
  score = Math.max(0, Math.min(score, 100));

  // Determine Severity
  let severity = 'LOW';
  if (score >= 75) severity = 'CRITICAL';
  else if (score >= 50) severity = 'HIGH';
  else if (score >= 25) severity = 'MEDIUM';
  else severity = 'LOW';

  // Custom overriding for Public HTTPS (must NOT automatically be Critical)
  if (port === 443 && enrichedFinding.exposure === 'Public' && score >= 75) {
     if (enrichedFinding.encryption !== 'None') {
        score = 48;
        severity = 'MEDIUM';
     }
  }

  // Structured risk factors array
  const riskFactorsList = [
    { factor: 'Internet Exposure', score: exposureScore, reason: exposureReason },
    { factor: 'Service Sensitivity', score: sensitivityScore, reason: sensitivityReason },
    { factor: 'Security Weakness', score: weaknessScore, reason: weaknessReason },
    { factor: 'Configuration / Necessity', score: configScore, reason: configReason }
  ];

  // Evaluate Rules for recommendations
  const { triggeredRules, recommendations } = evaluateRules(enrichedFinding);

  return {
    riskScore: score,
    riskLevel: severity,
    riskFactors: riskFactorsList,
    triggeredRules,
    recommendations,
    enrichedData: enrichedFinding
  };
};

module.exports = { calculateRisk };
