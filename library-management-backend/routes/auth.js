const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const nodemailer = require('nodemailer'); // ✅ use directly

router.post('/register', register);
router.post('/login', login);

router.post('/resend-password-email', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // fallback if password was not changed yet
    const lastPassword = user.lastPlainPassword || 'Not Available (please reset it)';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: '"Library System" <no-reply@library.com>',
      to: email,
      subject: 'Library Login Info (Resent)',
      text: `Hi ${user.name},

This is a reminder of your login information for the Library System.

- Email: ${email}
- Changed Password: ${lastPassword}

If you've already changed your password, please save this and use the updated one.

Thanks,
Library Team`
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Email resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Email resend error');
  }
});


module.exports = router;
