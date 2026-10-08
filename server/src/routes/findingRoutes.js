const express = require('express');
const router = express.Router();
const Finding = require('../models/Finding');
const { generateExplanation } = require('../services/aiService');

// Get single finding
router.get('/:id', async (req, res, next) => {
  try {
    const finding = await Finding.findById(req.params.id);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });
    res.json(finding);
  } catch (error) {
    next(error);
  }
});

// Review finding
router.patch('/:id/review', async (req, res, next) => {
  try {
    const finding = await Finding.findByIdAndUpdate(
      req.params.id,
      { reviewed: true },
      { new: true }
    );
    res.json(finding);
  } catch (error) {
    next(error);
  }
});

// Generate AI explanation
router.post('/:id/explain', async (req, res, next) => {
  try {
    const finding = await Finding.findById(req.params.id);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });

    const explanation = await generateExplanation(finding);
    finding.aiExplanation = explanation;
    await finding.save();
    
    res.json(finding);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
