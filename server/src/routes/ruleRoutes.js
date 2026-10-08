const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// We'd ideally pull this from the DB, but since our rules are hardcoded in ruleEngine.js for this phase:
const rulesList = [
  { ruleId: 'RULE-001', name: 'Administrative Exposure', description: 'Increase risk when an administrative service is externally or publicly exposed.' },
  { ruleId: 'RULE-002', name: 'Unencrypted Service', description: 'Increase risk when an unencrypted service is externally or publicly exposed.' },
  { ruleId: 'RULE-003', name: 'Unnecessary Service', description: 'Flag unnecessary services for restriction or disabling.' },
  { ruleId: 'RULE-004', name: 'Unknown Authentication', description: 'Flag unknown authentication on sensitive services for verification.' },
  { ruleId: 'RULE-005', name: 'Unknown Identity', description: 'Mark unknown service identities as "Needs Verification."' }
];

router.get('/', async (req, res, next) => {
  try {
    res.json(rulesList);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
