
const knownServices = {
  '22/TCP': { name: 'SSH', category: 'Management', purpose: 'Secure remote administration', sensitivity: 'High', encryptedByDefault: true, administrative: true },
  '23/TCP': { name: 'Telnet', category: 'Management', purpose: 'Unencrypted remote administration', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '25/TCP': { name: 'SMTP', category: 'Mail', purpose: 'Email routing', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '53/TCP': { name: 'DNS', category: 'Network', purpose: 'Domain name resolution', sensitivity: 'Low', encryptedByDefault: false, administrative: false },
  '53/UDP': { name: 'DNS', category: 'Network', purpose: 'Domain name resolution', sensitivity: 'Low', encryptedByDefault: false, administrative: false },
  '80/TCP': { name: 'HTTP', category: 'Web', purpose: 'Unencrypted web traffic', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '110/TCP': { name: 'POP3', category: 'Mail', purpose: 'Email retrieval', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '143/TCP': { name: 'IMAP', category: 'Mail', purpose: 'Email retrieval', sensitivity: 'Medium', encryptedByDefault: false, administrative: false },
  '443/TCP': { name: 'HTTPS', category: 'Web', purpose: 'Secure web traffic', sensitivity: 'Medium', encryptedByDefault: true, administrative: false },
  '445/TCP': { name: 'SMB', category: 'File Sharing', purpose: 'Windows file sharing', sensitivity: 'High', encryptedByDefault: false, administrative: false },
  '3306/TCP': { name: 'MySQL', category: 'Database', purpose: 'Database management', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '5432/TCP': { name: 'PostgreSQL', category: 'Database', purpose: 'Database management', sensitivity: 'High', encryptedByDefault: false, administrative: true },
  '3389/TCP': { name: 'RDP', category: 'Management', purpose: 'Remote Desktop Protocol', sensitivity: 'High', encryptedByDefault: true, administrative: true },
};

const identifyService = (port, protocol) => {
  const key = `${port}/${protocol.toUpperCase()}`;
  return knownServices[key] || { name: 'Unknown / Needs Verification', category: 'Unknown', purpose: 'Unknown', sensitivity: 'Unknown', encryptedByDefault: false, administrative: false };
};

module.exports = { identifyService, knownServices, KNOWN_SERVICES: knownServices };
