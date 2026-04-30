const { Blockchain } = require('../../../blockchain/index');
const { v4: uuidv4 } = require('uuid');

const blockchain = new Blockchain();

const registerIdentity = (identityHash, issuer) => {
  const existing = blockchain.findBlock(identityHash);
  if (existing) throw new Error('Identity already registered on blockchain');

  const transactionId = uuidv4();
  const block = blockchain.addBlock({
    identityHash,
    issuer,
    transactionId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  });

  return { transactionId, blockIndex: block.index, blockHash: block.hash };
};

const verifyIdentity = (identityHash) => {
  const block = blockchain.findBlock(identityHash);
  if (!block) return { exists: false, status: null };
  return { exists: true, status: block.data.status, block };
};

const revokeIdentity = (identityHash) => {
  const block = blockchain.findBlock(identityHash);
  if (!block) throw new Error('Identity not found on blockchain');
  block.data.status = 'REVOKED';
  return true;
};

const getChainInfo = () => ({
  length: blockchain.chain.length,
  isValid: blockchain.isChainValid(),
  latestBlock: blockchain.getLatestBlock(),
});

module.exports = { registerIdentity, verifyIdentity, revokeIdentity, getChainInfo };
