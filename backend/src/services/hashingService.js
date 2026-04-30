const crypto = require('crypto');

const generateSalt = () => {
  return crypto.randomBytes(32).toString('hex');
};

const normalizeAttributes = (nin, fullName, dob) => {
  return `${nin.trim().toUpperCase()}|${fullName.trim().toUpperCase()}|${dob.trim()}`;
};

const computeIdentityHash = (nin, fullName, dob, salt) => {
  const normalized = normalizeAttributes(nin, fullName, dob);
  const salted = salt + normalized;
  return crypto.createHash('sha256').update(salted, 'utf8').digest('hex');
};

const verifyIdentityHash = (nin, fullName, dob, salt, storedHash) => {
  const recomputed = computeIdentityHash(nin, fullName, dob, salt);
  return recomputed === storedHash;
};

module.exports = { generateSalt, computeIdentityHash, verifyIdentityHash };
