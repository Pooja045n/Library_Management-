const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/rolecheck');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const User = require('../models/User');
const upload = multer({ dest: 'uploads/' });
const Activity = require('../models/Activity');
const logActivity = require('../utils/logActivity');

router.get('/books', auth, roleCheck('librarian'), async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

router.post('/books/post', auth, roleCheck('librarian'), async (req, res) => {
  const { title, author, category, isbn, available } = req.body;
  try {
    const book = new Book({ title, author, category, isbn, available });
    await book.save();

    await new Activity({
      action: 'Book Added',
      performedBy: req.user._id,
      details: `Added book: ${title} by ${author}`,
      bookId: book._id
    }).save();
    await logActivity({
      userId: req.user.id,
      role: 'librarian',
      action: 'Added book',
      meta: { title, author }
    });

    res.json({ msg: 'Book added successfully' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.delete('/books/:id', auth, roleCheck('librarian'), async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    await new Activity({
      action: 'Book Deleted',
      performedBy: req.user._id,
      details: `Deleted book with ID: ${req.params.id}`,
      bookId: req.params.id
    }).save();
    await logActivity({
      userId: req.user.id,
      role: 'librarian',
      action: 'Deleted book',
      meta: { bookId: req.params.id }
    });

    res.json({ msg: 'Book deleted' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.post('/books/allocate', auth, roleCheck('librarian'), async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await BookRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    request.status = 'allocated';
    await request.save(); 

    await new Activity({
      action: 'Book Allocated',
      performedBy: req.user._id,
      details: `Allocated book with ID: ${request.bookId} to student with ID: ${request.studentId}`,
      bookId: request.bookId,
      targetUser: request.studentId
    }).save();
    await logActivity({
      userId: req.user.id,
      role: 'librarian',
      action: 'Allocated book',
      meta: { requestId, bookId: request.bookId, studentId: request.studentId }
    });

    await Book.findByIdAndUpdate(request.bookId, { available: false });

    res.json({ msg: 'Book allocated' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.post('/books/upload', auth, roleCheck('librarian'), upload.single('file'), async (req, res) => {
  const results = [];

  fs.createReadStream(path.join(__dirname, '..', req.file.path))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        await Book.insertMany(results);
        fs.unlinkSync(req.file.path); 
        res.json({ msg: 'Books uploaded successfully', count: results.length });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading CSV');
      }
    });
});

router.get('/students/count', auth, roleCheck('librarian'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json({ total: students.length, students });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.post('/approve/:userId', auth, roleCheck('librarian'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.approved = true;

    await new Activity({
      action: 'User Approved',
      performedBy: req.user._id,
      details: `Approved user with ID: ${user._id} and role: ${user.role}`,
      targetUser: user._id
    }).save();
    await logActivity({
      userId: req.user.id,
      role: 'librarian',
      action: 'Approved user',
      meta: { userId: user._id, role: user.role }
    });

    await user.save();
    res.json({ msg: 'User approved' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.post('/requests/deny', auth, roleCheck('librarian'), async (req, res) => {
  const { requestId } = req.body;
  try {
    await BookRequest.findByIdAndUpdate(requestId, { status: 'denied' });
    res.json({ msg: 'Request denied' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.get('/requests', auth, roleCheck('librarian'), async (req, res) => {
  try {
    const requests = await BookRequest.find({ status: 'requested' })
      .populate('studentId', 'name email')
      .populate('bookId', 'title author');
    res.json(requests);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

router.post('/requests/allocate', auth, roleCheck('librarian'), async (req, res) => {
  const { requestId, action, returnDate } = req.body;

  try {
    const request = await BookRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    if (action === 'accept') {
      request.status = 'allocated';
      request.returnDate = new Date(returnDate);
      await Book.findByIdAndUpdate(request.bookId, { available: false });
    } else {
      request.status = 'denied';
    }

    await request.save();
    res.json({ msg: 'Request updated' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
