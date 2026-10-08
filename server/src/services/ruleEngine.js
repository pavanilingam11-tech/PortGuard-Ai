const evaluateRules = (finding) => {
  const triggeredRules = [];
  const recommendations = [];

  const addRule = (ruleId, name, description, recommendation) => {
    const ruleObj = {
      ruleId,
      name,
      description,
      toString() { return `${ruleId}: ${name}`; },
      includes(term) { return ruleId.includes(term) || name.includes(term) || description.includes(term); }
    };
    triggeredRules.push(ruleObj);
    if (recommendation && !recommendations.includes(recommendation)) {
      recommendations.push(recommendation);
    }
  };

  const isPublicOrExternal = ['Public', 'External'].includes(finding.exposure);

  // RULE-001: Increase risk when an administrative service is externally or publicly exposed.
  if (finding.administrative && isPublicOrExternal) {
    addRule(
      'RULE-001',
      'Administrative service exposed publicly or externally.',
      'Administrative interfaces should not be reachable directly from untrusted networks.',
      'Restrict administrative services (e.g., SSH, RDP) to internal networks or VPNs. Consider IP whitelisting.'
    );
  }

  // RULE-002: Increase risk when an unencrypted service is externally or publicly exposed.
  if (finding.encryption === 'None' && isPublicOrExternal && finding.port !== 80) {
    addRule(
      'RULE-002',
      'Unencrypted service exposed publicly or externally.',
      'Transmitting sensitive data in cleartext allows eavesdropping and credential theft.',
      'Implement TLS/SSL encryption for this service or tunnel it through a secure VPN.'
    );
  } else if (finding.encryption === 'None' && isPublicOrExternal && finding.port === 80) {
    addRule(
      'RULE-002a',
      'Unencrypted HTTP service exposed.',
      'Port 80 is unencrypted cleartext HTTP.',
      'Ensure HTTP strictly redirects to HTTPS and does not serve sensitive content or authentication forms.'
    );
  }

  // RULE-003: Flag unnecessary services for restriction or disabling.
  if (finding.required === 'No') {
    addRule(
      'RULE-003',
      'Unnecessary service running.',
      'Non-essential services unnecessarily broaden the potential attack surface.',
      'Disable or restrict services that are not required for business operations to reduce attack surface.'
    );
  }

  // RULE-004: Flag unknown authentication on sensitive services for verification.
  if (finding.authentication === 'Unknown' && (finding.administrative || finding.sensitivity === 'High')) {
    addRule(
      'RULE-004',
      'Unknown authentication status on sensitive service.',
      'Authentication configuration on high-sensitivity or admin service is unverified.',
      'Verify that strong authentication (e.g., MFA, key-based) is required and properly configured.'
    );
  }

  // RULE-005: Mark unknown service identities as "Needs Verification."
  if (finding.confidence === 'Low' || finding.service === 'Unknown / Needs Verification' || finding.name === 'Unknown / Needs Verification') {
    addRule(
      'RULE-005',
      'Unknown service identity.',
      'Port and protocol could not be confidently identified in the knowledge base.',
      'Investigate the host to verify the actual service running on this port and whether it is authorized.'
    );
  }

  return { triggeredRules, recommendations };
};

module.exports = { evaluateRules };
