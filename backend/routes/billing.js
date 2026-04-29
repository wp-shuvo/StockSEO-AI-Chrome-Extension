const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.post('/create-checkout-session', auth, async (req, res) => {
  res.json({ message: 'Stripe checkout session creation placeholder' });
});

module.exports = router;
