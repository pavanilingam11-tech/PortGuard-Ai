const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const { parseAsync } = require('json2csv');
const PDFDocument = require('pdfkit');

// Get report data
router.get('/:assessmentId', async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    const findings = await Finding.find({ assessmentId: req.params.assessmentId });
    res.json({ assessment, findings });
  } catch (error) {
    next(error);
  }
});

// CSV export
router.get('/:assessmentId/csv', async (req, res, next) => {
  try {
    const findings = await Finding.find({ assessmentId: req.params.assessmentId });
    if (!findings.length) return res.status(404).json({ error: 'No findings for this assessment' });
    
    const fields = ['host', 'port', 'protocol', 'service', 'exposure', 'riskLevel', 'riskScore', 'state', 'authentication', 'encryption'];
    const csv = await parseAsync(findings, { fields });
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`portguard-report-${req.params.assessmentId}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
});

// PDF export
router.get('/:assessmentId/pdf', async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    const findings = await Finding.find({ assessmentId: req.params.assessmentId });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="portguard-report-${req.params.assessmentId}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#0f172a').text('PORTGUARD AI — SECURITY REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748b').text('Automated Port & Service Risk Assessment', { align: 'center' });
    doc.moveDown(1.5);

    // Assessment Overview
    doc.fontSize(14).fillColor('#1e293b').text('Assessment Overview');
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#334155');
    doc.text(`Name: ${assessment.name}`);
    doc.text(`Scope / Target: ${assessment.scope || 'N/A'}`);
    doc.text(`Date: ${new Date(assessment.createdAt).toLocaleString()}`);
    doc.text(`Total Services: ${assessment.totalServices}`);
    doc.text(`Overall Risk Score: ${assessment.overallRisk}/100`);
    doc.moveDown(0.5);

    // Summary stats
    const summary = assessment.riskSummary || {};
    doc.text(`Critical: ${summary.critical || 0}   |   High: ${summary.high || 0}   |   Medium: ${summary.medium || 0}   |   Low: ${summary.low || 0}`);
    doc.moveDown(1.5);

    // Findings section
    doc.fontSize(14).fillColor('#1e293b').text(`Detailed Findings (${findings.length})`);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    findings.forEach((f, idx) => {
      // Check if near bottom of page
      if (doc.y > 700) {
        doc.addPage();
      }

      const riskColor = f.riskLevel === 'CRITICAL' ? '#dc2626' : f.riskLevel === 'HIGH' ? '#ea580c' : f.riskLevel === 'MEDIUM' ? '#d97706' : '#2563eb';

      doc.fontSize(11).fillColor(riskColor).text(`${idx + 1}. [${f.riskLevel} - Score: ${f.riskScore}] ${f.host}:${f.port}/${f.protocol} — ${f.service}`);
      doc.fontSize(9).fillColor('#475569');
      doc.text(`    Exposure: ${f.exposure || 'Unknown'} | Encryption: ${f.encryption || 'Unknown'} | Auth: ${f.authentication || 'Unknown'}`);
      
      if (f.triggeredRules && f.triggeredRules.length > 0) {
        const rulesText = f.triggeredRules.map(r => (typeof r === 'object' ? `${r.ruleId}: ${r.name}` : r)).join('; ');
        doc.text(`    Triggered Rules: ${rulesText}`);
      }

      if (f.recommendations && f.recommendations.length > 0) {
        doc.text(`    Defense: ${f.recommendations[0]}`);
      }

      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#94a3b8').text('Confidential — Generated for defensive security analysis by PortGuard AI.', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
