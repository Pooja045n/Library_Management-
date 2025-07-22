const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/rolecheck');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const Student = require('../models/User'); 
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_images/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/books', auth, roleCheck('student'), async (req, res) => {
  try {
    const { search = '', category } = req.query;
    let filter = {
      title: { $regex: search, $options: 'i' }
    };

    if (category) filter.category = category;

    const books = await Book.find(filter);

    // Fetch all requests for this student
    const requests = await BookRequest.find({ studentId: req.user.id });

    // Map bookId to status
    const requestMap = {};
    requests.forEach(r => {
      requestMap[r.bookId.toString()] = r.status; // 'requested' or 'allocated'
    });

    // Attach status to each book
    const booksWithStatus = books.map(book => ({
      ...book.toObject(),
      status: requestMap[book._id.toString()] || null
    }));

    res.json(booksWithStatus);
  } catch (e) {
    res.status(500).send('Server error');
  }
});


router.post('/request', auth, roleCheck('student'), async (req, res) => {
  const { bookId } = req.body;
  try {
    const alreadyRequested = await BookRequest.findOne({
      studentId: req.user.id,
      bookId,
      status: { $in: ['requested', 'allocated'] }
    });

    if (alreadyRequested) {
      return res.status(400).json({ msg: 'You already requested or hold this book' });
    }

    const request = new BookRequest({
      studentId: req.user.id,
      bookId,
    });

    await request.save();
    res.json({ msg: 'Book request submitted' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});


router.get('/mylibrary', auth, roleCheck('student'), async (req, res) => {
  try {
    const requests = await BookRequest.find({ studentId: req.user.id })
      .populate('bookId', 'title author category isbn') // ensure isbn and category are populated
      .sort({ requestedAt: -1 });

    const formatted = requests
    .filter(r=> r.bookId) 
    .map(r => ({
      _id: r._id,
      title: r.bookId.title,
      author: r.bookId.author,
      isbn: r.bookId.isbn,
      category: r.bookId.category,
      status: r.status,
      requestedAt: r.requestedAt,
      dueDate: r.dueDate,
      finePaid: r.finePaid || false
    }));

    res.json(formatted);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// Return a book
router.post('/return', auth, roleCheck('student'), async (req, res) => {
  const { bookId } = req.body;
  try {
    const request = await BookRequest.findOneAndUpdate(
      { bookId, studentId: req.user.id, status: 'allocated' },
      { status: 'returned', returnedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ msg: 'Book not found or not allocated' });
    res.json({ msg: 'Book returned successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/payfine', auth, roleCheck('student'), async (req, res) => {
  const { bookId } = req.body;

  const bookRequest = await BookRequest.findOne({ bookId, studentId: req.user.id }).populate('bookId');
  if (!bookRequest) return res.status(404).send("Book not found.");

  bookRequest.finePaid = true;
  await bookRequest.save();

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${Date.now()}.pdf`);

  doc.fontSize(20).text("📘 MyLibrary - Fine Invoice", { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${req.user.username}`);
  doc.text(`Email: ${req.user.email}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Fine Details", { underline: true });
  doc.moveDown();
  doc.text(`Book: ${bookRequest.bookId.title}`);
  doc.text(`Status: ${bookRequest.status}`);
  doc.text(`Amount Paid: ₹50`);
  doc.text(`Due Date: ${bookRequest.dueDate ? new Date(bookRequest.dueDate).toLocaleDateString() : 'N/A'}`);

  doc.end();
  doc.pipe(res); 
});

router.get('/paidfines', auth, roleCheck('student'), async (req, res) => {
  const fines = await BookRequest.find({
    studentId: req.user.id,
    finePaid: true
  }).populate('bookId', 'title author category');

  const formatted = fines.map(f => ({
    title: f.bookId.title,
    author: f.bookId.author,
    category: f.bookId.category,
    paidOn: f.updatedAt
  }));

  res.json(formatted);
});


// Renew a book
router.post('/renew', auth, roleCheck('student'), async (req, res) => {
  const { bookId } = req.body;
  try {
    const request = await BookRequest.findOne({ bookId, studentId: req.user.id, status: 'allocated' });
    if (!request) return res.status(404).json({ msg: 'Book not found or not allocated' });

    // Add 7 more days
    const currentDueDate = request.dueDate || new Date();
    const newDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    request.dueDate = newDueDate;
    await request.save();

    res.json({ msg: 'Book renewed until ' + newDueDate.toLocaleDateString() });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


// GET profile (now includes rollNo and image)
router.get('/profile', auth, async (req, res) => {
  const student = await Student.findById(req.user.id).select('username email rollNo image');
  res.json(student);
});

// PUT profile (with image and rollNo support)
router.put('/profile', auth, upload.single('image'), async (req, res) => {
  const { username, email, rollNo } = req.body;
  let updateData = { username, email, rollNo };

  if (req.file) {
    // Save relative path or URL as per your frontend usage
    updateData.image = `/uploads/profile_images/${req.file.filename}`;
  }

  const student = await Student.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('username email rollNo image');
  res.json(student);
});

// Get student stats
router.get('/stats', auth, roleCheck('student'), async (req, res) => {
  const userId = req.user.id;

  const books = await Book.countDocuments();
  const requests = await BookRequest.countDocuments({ studentId: userId });
  const allocated = await BookRequest.countDocuments({ studentId: userId, status: 'allocated' });

  res.json({
    totalBooks: books,
    yourRequests: requests,
    allocatedBooks: allocated
  });
});
// This route is used by the student to view their book requests and allocations.
// It returns a list of books the student has requested, along with their status and request date


module.exports = router;
