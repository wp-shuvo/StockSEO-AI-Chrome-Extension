const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const usageLimiter = require('../middleware/usageLimiter');
const { generateSEO } = require('../utils/aiClient');
const User = require('../models/User');

router.post('/', auth, usageLimiter, async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  try {
    const result = await generateSEO(imageUrl);
    
    // Increment usage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { dailyUsageCount: 1 },
      lastUsageDate: new Date()
    });

    res.json(result);
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ message: 'AI Generation failed' });
  }
});

module.exports = router;
