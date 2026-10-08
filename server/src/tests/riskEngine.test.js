const { calculateRisk } = require('../services/riskEngine');
const { evaluateRules } = require('../services/ruleEngine');
const { identifyService } = require('../services/serviceIdentificationService');
const { generateExplanation } = require('../services/aiService');

describe('Deterministic Risk Engine & Rules', () => {
  // Case 1: Public HTTPS is not automatically Critical
  it('1. Public HTTPS should NOT automatically be Critical', () => {
    const serviceData = {
      port: 443,
      protocol: 'TCP',
      exposure: 'Public',
      encryption: 'Yes',
      authentication: 'Required',
      required: 'Yes'
    };
    const { riskScore, riskLevel } = calculateRisk(serviceData);
    expect(riskScore).toBeLessThan(75);
    expect(riskLevel).not.toBe('CRITICAL');
  });

  // Case 2: Public Administrative services receive appropriate increased risk
  it('2. Public Administrative services receive appropriate increased risk', () => {
    const serviceData = {
      port: 22,
      protocol: 'TCP',
      exposure: 'Public',
      encryption: 'None',
      authentication: 'None',
      required: 'Yes'
    };
    const { riskScore, riskLevel } = calculateRisk(serviceData);
    expect(riskScore).toBeGreaterThanOrEqual(75);
    expect(riskLevel).toBe('CRITICAL');
  });

  // Case 3: Public unencrypted services trigger the appropriate rule
  it('3. Public unencrypted services trigger RULE-002', () => {
    const enrichedFinding = {
      port: 23,
      protocol: 'TCP',
      exposure: 'Public',
      encryption: 'None',
      authentication: 'None',
      sensitivity: 'High'
    };
    const { triggeredRules } = evaluateRules(enrichedFinding);
    expect(triggeredRules.some(r => r.includes('RULE-002'))).toBe(true);
  });

  // Case 4: Unknown services are marked "Needs Verification"
  it('4. Unknown services are marked "Needs Verification"', () => {
    const result = identifyService(9999, 'TCP');
    expect(result.name).toBe('Unknown / Needs Verification');

    const calculated = calculateRisk({ port: 9999, protocol: 'TCP', exposure: 'Internal' });
    expect(calculated.triggeredRules.some(r => r.includes('RULE-005'))).toBe(true);
  });

  // Case 5: Unnecessary services trigger the correct rule
  it('5. Unnecessary services trigger RULE-003', () => {
    const enrichedFinding = {
      port: 22,
      protocol: 'TCP',
      required: 'No',
      sensitivity: 'Medium'
    };
    const { triggeredRules } = evaluateRules(enrichedFinding);
    expect(triggeredRules.some(r => r.includes('RULE-003'))).toBe(true);
  });

  // Case 6: AI failure does not interrupt the assessment
  it('6. AI failure does not interrupt the assessment and provides safe fallback', async () => {
    const finding = {
      service: 'RDP',
      port: 3389,
      protocol: 'TCP',
      exposure: 'Public',
      riskScore: 85,
      riskLevel: 'CRITICAL',
      riskFactors: [{ factor: 'Internet Exposure', score: 30, reason: 'Public exposure' }],
      triggeredRules: [{ ruleId: 'RULE-001', name: 'Admin Exposed' }]
    };
    const explanation = await generateExplanation(finding);
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(20);
    expect(explanation).toContain('RDP');
  });

  // Case 7: Risk scores always remain between 0 and 100
  it('7. Risk scores always remain between 0 and 100 under extreme conditions', () => {
    const worstCase = {
      port: 3389,
      protocol: 'TCP',
      exposure: 'Public',
      encryption: 'None',
      authentication: 'None',
      required: 'No',
      state: 'unknown'
    };
    const worstResult = calculateRisk(worstCase);
    expect(worstResult.riskScore).toBeLessThanOrEqual(100);
    expect(worstResult.riskScore).toBeGreaterThanOrEqual(0);

    const bestCase = {
      port: 53,
      protocol: 'UDP',
      exposure: 'Internal',
      encryption: 'Yes',
      authentication: 'Required',
      required: 'Yes',
      state: 'active'
    };
    const bestResult = calculateRisk(bestCase);
    expect(bestResult.riskScore).toBeGreaterThanOrEqual(0);
    expect(bestResult.riskScore).toBeLessThanOrEqual(100);
  });
});
