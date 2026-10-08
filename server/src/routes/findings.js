const express = require('express');
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
