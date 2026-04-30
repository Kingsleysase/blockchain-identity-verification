const { query } = require('../db/index');
const { generateSalt, computeIdentityHash } = require('../services/hashingService');
const { registerIdentity, verifyIdentity, revokeIdentity } = require('../services/blockchainService');
const { generateQRCode, parseQRPayload } = require('../services/qrService');
const { v4: uuidv4 } = require('uuid');

const registerNewIdentity = async (req, res) => {
  try {
    const { nin, fullName, dob } = req.body;
    if (!nin || !fullName || !dob) return res.status(400).json({ error: 'NIN, fullName and dob are required' });

    const salt = generateSalt();
    const identityHash = computeIdentityHash(nin, fullName, dob, salt);
    const localIdentifier = uuidv4();

    const { transactionId, blockIndex, blockHash } = registerIdentity(identityHash, 'IdentityAuthority');

    const result = query(
      `INSERT INTO identities (user_id, local_identifier, blockchain_identity_hash, blockchain_transaction_id, salt, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [req.user.user_id, localIdentifier, identityHash, transactionId, salt]
    );

    const identityId = result.rows[0].lastInsertRowid;
    const { qrDataURL } = await generateQRCode(transactionId, identityId);
    query('UPDATE identities SET qr_code_data = ? WHERE identity_id = ?', [qrDataURL, identityId]);

    const identity = query('SELECT * FROM identities WHERE identity_id = ?', [identityId]).rows[0];

    res.status(201).json({
      message: 'Identity registered successfully',
      identity: { ...identity, qr_code_data: qrDataURL },
      blockchain: { transactionId, blockIndex, blockHash },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllIdentities = async (req, res) => {
  try {
    const result = query('SELECT identity_id, local_identifier, blockchain_identity_hash, blockchain_transaction_id, status, created_at FROM identities ORDER BY created_at DESC');
    res.json({ identities: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getIdentityById = async (req, res) => {
  try {
    const result = query('SELECT * FROM identities WHERE identity_id = ?', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Identity not found' });
    res.json({ identity: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyIdentityHandler = async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ error: 'QR payload is required' });

    const { transactionId } = parseQRPayload(payload);
    const identity = query('SELECT * FROM identities WHERE blockchain_transaction_id = ?', [transactionId]).rows[0];

    if (!identity) {
      logVerification(null, req.user?.user_id, 'FAILURE', req.ip);
      return res.json({ result: 'NOT_FOUND', message: 'Identity record not found' });
    }

    const blockchainResult = verifyIdentity(identity.blockchain_identity_hash);

    let result, message;
    if (!blockchainResult.exists) {
      result = 'NOT_FOUND'; message = 'Record not found on blockchain';
    } else if (blockchainResult.status === 'REVOKED') {
      result = 'REVOKED'; message = 'This identity has been revoked';
    } else {
      result = 'SUCCESS'; message = 'Identity verified successfully';
    }

    logVerification(identity.identity_id, req.user?.user_id, result, req.ip);
    res.json({ result, message, status: identity.status, registeredAt: identity.created_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const revokeIdentityHandler = async (req, res) => {
  try {
    const identity = query('SELECT * FROM identities WHERE identity_id = ?', [req.params.id]).rows[0];
    if (!identity) return res.status(404).json({ error: 'Identity not found' });

    revokeIdentity(identity.blockchain_identity_hash);
    query("UPDATE identities SET status = 'REVOKED' WHERE identity_id = ?", [req.params.id]);

    res.json({ message: 'Identity revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logVerification = (identityId, verifierId, result, ip) => {
  query(
    'INSERT INTO verification_logs (identity_id, verifier_id, result, client_ip) VALUES (?, ?, ?, ?)',
    [identityId, verifierId, result, ip]
  );
};

module.exports = { registerNewIdentity, getAllIdentities, getIdentityById, verifyIdentityHandler, revokeIdentityHandler };
