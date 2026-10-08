const express = require('express');
const router = express.Router();
const { KNOWN_SERVICES } = require('../services/serviceIdentificationService');
const Service = require('../models/Service');

// Get static knowledge base + dynamic overrides if we had them
router.get('/', async (req, res, next) => {
  try {
    const list = Object.entries(KNOWN_SERVICES || {}).map(([key, service]) => ({
      key,
      ...service
    }));
    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
