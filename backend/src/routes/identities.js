const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  registerNewIdentity,
  getAllIdentities,
  getIdentityById,
  verifyIdentityHandler,
  revokeIdentityHandler
} = require('../controllers/identityController');

router.post('/', authenticate, registerNewIdentity);
router.get('/', authenticate, getAllIdentities);
router.get('/:id', authenticate, getIdentityById);
router.post('/verify', verifyIdentityHandler);
router.patch('/:id/revoke', authenticate, revokeIdentityHandler);

module.exports = router;
