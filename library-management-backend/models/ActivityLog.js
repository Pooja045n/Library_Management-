const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  action: String,
  timestamp: { type: Date, default: Date.now },
  meta: Object
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
