const QRCode = require('qrcode');

const generateQRCode = async (transactionId, identityId) => {
  const payload = `TXID:${transactionId}|RID:${identityId}`;
  const qrDataURL = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'H' });
  return { payload, qrDataURL };
};

const parseQRPayload = (payload) => {
  const parts = {};
  payload.split('|').forEach(part => {
    const [key, value] = part.split(':');
    parts[key] = value;
  });
  return { transactionId: parts['TXID'], identityId: parts['RID'] };
};

module.exports = { generateQRCode, parseQRPayload };
