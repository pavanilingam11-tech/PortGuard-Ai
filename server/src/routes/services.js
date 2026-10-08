const express = require('express');
const router = express.Router();
const { knownServices } = require('../services/serviceIdentificationService');

router.get('/', (req, res) => {
  const servicesList = Object.keys(knownServices).map(key => ({
    key,
    ...knownServices[key]
  }));
  res.json(servicesList);
});

module.exports = router;
