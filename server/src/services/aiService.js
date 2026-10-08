/**
 * AI Service for PortGuard AI
 * Provides defensive, explainable security analysis without modifying risk scores or deterministic rules.
 */

const generateExplanation = async (finding) => {
  const serviceName = finding.service || 'Unknown Service';
  const portProto = `${finding.port}/${finding.protocol}`;
  const exposure = finding.exposure || 'Unknown';
  const riskLevel = finding.riskLevel || 'MEDIUM';
  const riskScore = finding.riskScore || 0;
  
  // Extract triggered rules summary
  const triggeredRuleNames = (finding.triggeredRules || [])
    .map(r => (typeof r === 'object' ? `${r.ruleId} (${r.name})` : r))
    .join(', ');

  const prompt = `You are a defensive cybersecurity assistant for PortGuard AI.
Analyze the following port assessment defensively:
- Service: ${serviceName} on port ${portProto}
- Exposure: ${exposure}
- Encryption: ${finding.encryption || 'Unknown'}
- Authentication: ${finding.authentication || 'Unknown'}
- Risk Score: ${riskScore} (${riskLevel})
- Triggered Rules: ${triggeredRuleNames || 'None'}

Provide a concise, professional explanation covering:
1. What the service does and its operational role.
2. Why the exposure matters in this context.
3. Which factors and rules contributed to the ${riskScore} score.
4. Key defensive hardening steps.
Do not calculate new scores or suggest offensive exploitation techniques.`;

  // If Gemini API Key is configured, attempt live call
  if (process.env.AI_API_KEY && process.env.AI_PROVIDER !== 'Disabled') {
    try {
      const model = process.env.AI_MODEL || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.AI_API_KEY}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 350, temperature: 0.2 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (apiError) {
      console.warn('AI API call failed, reverting to defensive fallback explanation:', apiError.message);
    }
  }

  // Fallback Structured Defensive Explanation (Deterministic & Safe)
  const exposureContext = exposure === 'Public'
    ? 'This service is directly reachable from the public internet, significantly increasing attack surface and exposure to automated reconnaissance scans.'
    : exposure === 'External'
    ? 'This service is exposed to external perimeter networks, requiring restricted firewall rules.'
    : 'This service is positioned within internal network boundaries, reducing direct external exploitability.';

  const factorsContext = (finding.riskFactors && finding.riskFactors.length > 0)
    ? finding.riskFactors.filter(f => f.score > 0).map(f => `${f.factor} (+${f.score} pts: ${f.reason})`).join('; ')
    : 'Standard baseline assessment factors.';

  const hardeningRecommendations = (finding.recommendations && finding.recommendations.length > 0)
    ? finding.recommendations.slice(0, 2).join(' ')
    : 'Apply network segmentation, least-privilege firewall filters, and verify authentication requirements.';

  return `[Analysis for ${serviceName} on ${portProto}]: ${finding.purpose || 'Network service'}.\n\n• Exposure Context: ${exposureContext}\n• Contributing Factors: ${factorsContext}\n• Hardening Guidance: ${hardeningRecommendations}\n\nNote: Evaluated deterministically under PortGuard AI defensive rule set.`;
};

module.exports = {
  generateExplanation,
  getAIExplanation: generateExplanation
};
