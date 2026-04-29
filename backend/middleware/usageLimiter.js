const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.plan === 'pro') {
      return next();
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastUsage = new Date(user.lastUsageDate).setHours(0, 0, 0, 0);

    if (today > lastUsage) {
      user.dailyUsageCount = 0;
      user.lastUsageDate = new Date();
    }

    if (user.dailyUsageCount >= 20) {
      return res.status(403).json({ message: 'Daily limit reached. Upgrade to Pro.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error in usage limiter' });
  }
};
