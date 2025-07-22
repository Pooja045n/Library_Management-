const mongoose = require('mongoose');

const BookRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  status: { type: String, enum: ['requested', 'allocated', 'returned'], default: 'requested' },
  requestedAt: { type: Date, default: Date.now },
  dueDate: Date,
  returnedAt: Date,
  finePaid: { type: Boolean, default: false }
});

module.exports = mongoose.model('BookRequest', BookRequestSchema);
