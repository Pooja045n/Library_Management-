const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mustChangePassword: { type: Boolean, default: false },
  role: { type: String, enum: ['student', 'librarian', 'admin'] },
  lastPlainPassword: { type: String },
  approved: { type: Boolean, default: false }, // for librarian approval
  disabled: { type: Boolean, default: false } // for admin disabling users

});

module.exports = mongoose.model('User', userSchema);
