const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: String,                // e.g., "Registered", "Book Allocated"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
