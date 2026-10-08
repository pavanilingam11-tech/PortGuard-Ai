const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');

// Multer setup for in-memory file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/csv', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const csvData = req.file.buffer.toString('utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    // Validate headers
    const requiredHeaders = ['host', 'port', 'protocol'];
    if (records.length > 0) {
      const headers = Object.keys(records[0]);
      const missing = requiredHeaders.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        return res.status(400).json({ error: `Missing required columns: ${missing.join(', ')}` });
      }
    }

    // Format records for frontend preview/analysis
    const formattedRecords = records.map(record => ({
      host: record.host,
      port: parseInt(record.port, 10),
      protocol: record.protocol,
      service: record.service || 'Unknown',
      exposure: record.exposure || 'Unknown',
      state: record.state || 'open',
      authentication: record.authentication || 'Unknown',
      encryption: record.encryption || 'Unknown',
      required: record.required || 'Unknown',
      configurationNotes: record.configurationNotes || ''
    })).filter(r => !isNaN(r.port));

    res.json({ services: formattedRecords });
  } catch (error) {
    res.status(400).json({ error: 'Invalid CSV format or processing error' });
  }
});

module.exports = router;
