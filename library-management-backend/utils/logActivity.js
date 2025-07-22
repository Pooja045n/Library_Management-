const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, role, action, meta = {} }) => {
  try {
    const log = new ActivityLog({ userId, role, action, meta });
    await log.save();
  } catch (err) {
    console.error('Logging failed:', err.message);
  }
};

module.exports = logActivity;
