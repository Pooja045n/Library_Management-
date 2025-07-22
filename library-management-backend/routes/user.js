const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Change password route (protected)
// This route allows users to change their password after logging in.
// It requires authentication and checks if the user exists before updating the password.
router.post('/change-password', auth, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    user.lastPlainPassword = newPassword;

    await user.save();
    res.json({ msg: 'Password changed successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

module.exports = router;
