const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CHAIN_FILE = path.join(__dirname, '../backend/blockchain_data.json');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash)
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = this.loadChain();
  }

  loadChain() {
    try {
      if (fs.existsSync(CHAIN_FILE)) {
        const data = JSON.parse(fs.readFileSync(CHAIN_FILE, 'utf8'));
        return data.map(b => Object.assign(new Block(0,'',{},''), b));
      }
    } catch(e) {}
    return [this.createGenesisBlock()];
  }

  saveChain() {
    fs.writeFileSync(CHAIN_FILE, JSON.stringify(this.chain, null, 2));
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), { message: 'Genesis Block' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      this.getLatestBlock().hash
    );
    this.chain.push(block);
    this.saveChain();
    return block;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  findBlock(identityHash) {
    return this.chain.find(b => b.data && b.data.identityHash === identityHash) || null;
  }
}

module.exports = { Blockchain, Block };
