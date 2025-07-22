const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/rolecheck');
const User = require('../models/User');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const PDFDocument = require('pdfkit');
const ActivityLog = require('../models/ActivityLog');
const { Parser } = require('json2csv');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 🔍 View recent activity log
router.get('/activity-log', auth, roleCheck('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// 👥 View all users
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// ✅ Approve user
router.post('/approve/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.approved = true;
    await user.save();
    res.json({ msg: 'User approved' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ❌ Delete user
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// 🚫 Disable user
router.patch('/users/:id/disable', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.disabled = true;
    await user.save();
    res.json({ msg: 'User disabled' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// ⭐ Promote librarian
router.post('/promote/:id', auth, roleCheck('admin'), async (req, res) => {
  const { level } = req.body;
  const allowedLevels = ['senior', 'junior', 'associate'];

  if (!allowedLevels.includes(level)) {
    return res.status(400).json({ msg: 'Invalid level' });
  }

  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'librarian') {
    return res.status(400).json({ msg: 'Only librarians can be promoted' });
  }

  user.role = `${level}_librarian`;
  await user.save();
  res.json({ msg: `User promoted to ${level}` });
});

// 📊 Statistics
router.get('/stats', auth, roleCheck('admin'), async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const librarianCount = await User.countDocuments({ role: 'librarian' });
    const pendingRequests = await BookRequest.countDocuments({ status: 'requested' });

    res.json({ bookCount, studentCount, librarianCount, pendingRequests });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// 📤 Export activity log to CSV
router.get('/logs/export', auth, roleCheck('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find();
    const parser = new Parser();
    const csv = parser.parse(logs);

    res.header('Content-Type', 'text/csv');
    res.attachment('activity_log.csv');
    return res.send(csv);
  } catch (e) {
    res.status(500).send('Export failed');
  }
});

// Allocated books count
router.get('/allocated-books-count', auth, roleCheck('admin'), async (req, res) => {
  try {
    const allocatedCount = await BookRequest.countDocuments({ status: 'allocated' });
    res.json({ allocatedCount });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// Download PDF report
router.get('/download-report', auth, roleCheck('admin'), async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const booksAddedThisMonth = await Book.countDocuments({ createdAt: { $gte: startOfMonth } });
    const activeStudentIds = await BookRequest.distinct('studentId', { status: { $in: ['allocated', 'returned'] } });
    const activeStudentCount = activeStudentIds.length;
    const allocatedCount = await BookRequest.countDocuments({ status: 'allocated' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=library_report.pdf');

    doc.pipe(res);

    // Header
    doc
      .font('Helvetica-Bold')
      .fillColor('#2d6cdf')
      .fontSize(28)
      .text('Library Activity Report', { align: 'center' })
      .moveDown(0.2)
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#555')
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Divider line
    doc
      .moveTo(50, doc.y + 10)
      .lineTo(545, doc.y + 10)
      .strokeColor('#2d6cdf')
      .lineWidth(1.5)
      .stroke()
      .moveDown(2);

    // Summary Section
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#000')
      .text('Summary', { underline: true })
      .moveDown(0.5);

    const stats = [
      { label: 'Total Students', value: totalStudents },
      { label: 'Active Students (taken books)', value: activeStudentCount },
      { label: 'Books Added This Month', value: booksAddedThisMonth },
      { label: 'Books Currently Allocated', value: allocatedCount }
    ];

    // Stylish box for each stat
    stats.forEach(stat => {
      doc
        .rect(60, doc.y, 480, 30)
        .fill('#f0f4fa')
        .strokeColor('#2d6cdf')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor('#333')
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(stat.label, 70, doc.y + 8, { continued: true })
        .fillColor('#2d6cdf')
        .text(` ${stat.value}`, { align: 'right' });

      doc.moveDown(1.2);
    });

    doc.moveDown(5);

    const summaryText = 'This report summarizes the current library activity including how many students have borrowed books, how many books were added this month, and the total currently allocated.';
    doc
      .rect(60, doc.y, 480, 70)
      .fill('#e6f0ff')
      .strokeColor('#2d6cdf')
      .stroke();

    doc
      .fillColor('#2d6cdf')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(summaryText, 70, doc.y - 60, { width: 460, align: 'left' });

    doc.moveDown(6);

    // Footer
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#888')
      .text('Regards,', { align: 'right' })
      .text('Library Admin Team', { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(500).send('Failed to generate report');
  }
});


// ✅ Create a new user with auto-password + email
router.post('/create-user', auth, async (req, res) => {
  try {
    let { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    email = email.trim().toLowerCase();
    role = role.trim().toLowerCase();

    if (!['student', 'librarian'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role selected' });
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists with this role and email' });
    }

    const password = crypto.randomBytes(4).toString('hex'); // random 8-char hex password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      lastPlainPassword: password // optional for admin retrieval
    });

    await newUser.save();

    // Send credentials via email (HTML styled)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px #e3e8f0; overflow: hidden;">
          <div style="background: #2d6cdf; color: #fff; padding: 24px 32px;">
            <h2 style="margin: 0; font-weight: 600; letter-spacing: 1px;">📚 Welcome to Library Portal</h2>
          </div>
          <div style="padding: 28px 32px 24px 32px;">
            <p style="font-size: 1.1em; margin-bottom: 18px;">Hi <b>${name}</b>,</p>
            <p style="margin-bottom: 18px;">
              Your account has been <b>successfully created</b>!<br>
              Here are your login credentials:
            </p>
            <table style="width: 100%; margin-bottom: 18px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #555;">Email:</td>
                <td style="padding: 8px 0;"><b>${email}</b></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Password:</td>
                <td style="padding: 8px 0;"><b>${password}</b></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Role:</td>
                <td style="padding: 8px 0;"><b style="text-transform: capitalize;">${role}</b></td>
              </tr>
            </table>
            <div style="background: #f0f4fa; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; color: #2d6cdf;">
              <b>Important:</b> Please log in and change your password after your first use.
            </div>
            <p style="font-size: 0.97em; color: #888;">If you have any questions, contact your library admin.</p>
            <div style="margin-top: 32px; color: #888; font-size: 0.95em;">
              <hr style="border: none; border-top: 1px solid #e3e8f0; margin: 18px 0;">
              <span>Thanks,<br>Library Admin Team</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"Library System" <no-reply@library.com>',
      to: email,
      subject: '📘 Welcome to Library Portal - Your Login Credentials',
      html
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: `${role} created successfully and credentials emailed`, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error. Could not create user.' });
  }
});

// 🧠 Filter activity log by user/email/date
router.get('/logs/filter/:userId', auth, roleCheck('admin'), async (req, res) => {
  const { user, action, start, end } = req.query;
  const filter = {};
  if (user) filter.userEmail = user;
  if (action) filter.action = action;
  if (start && end) filter.timestamp = { $gte: new Date(start), $lte: new Date(end) };

  try {
    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 });
    res.json(logs);
  } catch (e) {
    res.status(500).send('Error filtering logs');
  }
});

module.exports = router;
