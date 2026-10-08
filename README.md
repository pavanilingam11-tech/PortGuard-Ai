# PORTGUARD AI — AI Port & Service Risk Analyzer

**PortGuard AI** is a professional, full-stack defensive cybersecurity application developed for the **CQ-M17 Network Security Hackathon Challenge**. It performs deterministic, explainable risk assessments on network port and service exposure, pairing transparent security scoring with optional non-authoritative AI explanations.

---

## Architecture Overview

- **Frontend**: React 19, Vite 8, Tailwind CSS, Recharts, Lucide React, React Router 7.
- **Backend**: Node.js, Express.js 5, Multer, json2csv, PDFKit, Helmet, CORS, Morgan.
- **Database**: MongoDB with Mongoose (Assessments, Findings, Services, Rules).
- **Security Engine**: Isolated, deterministic 0–100 scoring logic (`riskEngine.js`) and transparent rule evaluator (`ruleEngine.js`).
- **AI Explainer**: Non-authoritative Gemini integration (`aiService.js`) with resilient deterministic fallback.

---

## Key Features

1. **Deterministic Risk Scoring (0–100)**:
   - **Internet Exposure** (Max 30 pts): Public vs External vs Internal.
   - **Service Sensitivity** (Max 25 pts): High/Medium/Low sensitivity & Administrative privileges.
   - **Security Weakness** (Max 25 pts): Cleartext protocols, unauthenticated sensitive services.
   - **Configuration / Necessity** (Max 20 pts): Unnecessary or non-standard ports.
   - **Special Rules**: Public HTTPS (port 443) is never automatically marked Critical.
2. **Transparent Security Rules**:
   - `RULE-001`: Administrative services exposed externally/publicly (SSH, RDP, MySQL, PostgreSQL).
   - `RULE-002`: Unencrypted cleartext protocols exposed (Telnet, HTTP, cleartext protocols).
   - `RULE-003`: Non-essential / unnecessary services running.
   - `RULE-004`: Unverified authentication status on sensitive ports.
   - `RULE-005`: Unknown port signatures flagged as "Needs Verification".
3. **Multi-Input Intake**:
   - Drag-and-drop CSV upload with validation for missing headers, invalid ports, and duplicate rows.
   - Interactive manual entry form to stage ports before analysis.
   - One-click "Load Hackathon Sample" for instant evaluation.
4. **Interactive Dashboard**:
   - Real-time statistics from MongoDB (Total Services, Critical Findings, High Risk, Internet Exposed).
   - Severity Distribution Bar Chart powered by Recharts.
   - Top Risky Services priority queue with direct detail links.
   - Recent Assessments overview.
5. **Comprehensive Reporting & Export**:
   - Live formatted CSV report export (`/api/reports/:id/csv`).
   - Executive PDF report export (`/api/reports/:id/pdf`) using PDFKit.
6. **Service Knowledge Base**:
   - Standard port catalog covering 22 (SSH), 23 (Telnet), 25 (SMTP), 53 (DNS), 80 (HTTP), 110 (POP3), 143 (IMAP), 443 (HTTPS), 445 (SMB), 3306 (MySQL), 5432 (PostgreSQL), 3389 (RDP), and custom ports.

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install-all
```

### 3. Seed Database
Populate initial security rules, service knowledge base signatures, and a baseline audit:
```bash
npm run seed
```

### 4. Run Automated Tests
Execute the automated Jest test suite covering all mandatory evaluation criteria:
```bash
npm test
```

### 5. Launch Application
Start both the Express API server and the Vite React frontend:
```bash
npm start
```
- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Sample Data

Pre-packaged test scans are located in [`sample-data/`](file:///c:/Users/karan/OneDrive/Desktop/cyber/portguard-ai/sample-data):
- `network_perimeter_audit.csv`: Standard mixed perimeter scan.
- `edge_cases.csv`: Edge cases (Public HTTPS, unknown ports, DNS UDP, etc.).

---

## REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Server health status |
| `/api/dashboard` | GET | Aggregated risk metrics and distribution |
| `/api/assessments` | GET / POST | List or create assessments |
| `/api/assessments/:id` | GET / DELETE | Retrieve or delete assessment |
| `/api/assessments/:id/analyze` | POST | Execute deterministic risk analysis on batch |
| `/api/assessments/:id/findings`| GET | List findings for assessment |
| `/api/findings/:id` | GET | Get single finding details |
| `/api/findings/:id/review` | PATCH | Mark finding as analyst reviewed |
| `/api/findings/:id/explain` | POST | Generate AI defensive explanation |
| `/api/services` | GET | Query port knowledge base |
| `/api/rules` | GET | Query active security rules |
| `/api/reports/:id` | GET | Full report JSON payload |
| `/api/reports/:id/csv` | GET | Download report in CSV format |
| `/api/reports/:id/pdf` | GET | Download report in PDF format |
| `/api/import/csv` | POST | Validate and parse scan CSV |
