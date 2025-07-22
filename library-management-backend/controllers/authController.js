const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog'); 

exports.register = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      // Log failed registration
      await ActivityLog.create({
        userId: null,
        action: 'register',
        role,
        meta: { email, status: 'failed', reason: 'User already exists' },
        timestamp: new Date()
      });
      return res.status(400).json({ msg: 'User already exists' });
    }

    const defaultPassword = 'Library@25';
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
      mustChangePassword: true,
      approved: role === 'student'
    });

    await user.save();

    // Log successful registration
    await ActivityLog.create({
      userId: user._id,
      action: 'register',
      role: user.role,
      meta: { email, status: 'success' },
      timestamp: new Date()
    });

    const transporter = nodemailer.createTransport({
      secure: true,
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }

    });

    const mailOptions = {
      from: '"Library System" <no-reply@library.com>',
      to: email,
      subject: 'Welcome to Library System',
      text: `Hi ${name},\n\nYour account has been created.\nLogin Email: ${email}\nTemporary Password: ${defaultPassword}\n\nPlease change your password after login.\n\nThanks!`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Registered successfully. Check your email.' });
  } catch (e) {
    // Log error
    await ActivityLog.create({
      userId: null,
      action: 'register',
      role,
      meta: { email, status: 'error', error: e.message },
      timestamp: new Date()
    });
    console.error(e);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  let user = null;
  let actionStatus = 'failed';
  let role = null;

  try {
    user = await User.findOne({ email });
    if (!user) {
      // Log failed login
      await ActivityLog.create({
        userId: null,
        action: 'login',
        role: null,
        meta: { email, status: 'failed', reason: 'User not found' },
        timestamp: new Date()
      });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login
      await ActivityLog.create({
        userId: user._id,
        action: 'login',
        role: user.role,
        meta: { email, status: 'failed', reason: 'Wrong password' },
        timestamp: new Date()
      });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.approved) {
      // Log failed login
      await ActivityLog.create({
        userId: user._id,
        action: 'login',
        role: user.role,
        meta: { email, status: 'failed', reason: 'Account not approved' },
        timestamp: new Date()
      });
      return res.status(403).json({ msg: 'Account not yet approved' });
    }

    // Log successful login
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      role: user.role,
      meta: { email, status: 'success' },
      timestamp: new Date()
    });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      mustChangePassword: user.mustChangePassword || false
    });
  } catch (e) {
    // Log error
    await ActivityLog.create({
      userId: user ? user._id : null,
      action: 'login',
      role: user ? user.role : null,
      meta: { email, status: 'error', error: e.message },
      timestamp: new Date()
    });
    console.error(e);
    res.status(500).send('Server error');
  }
};
