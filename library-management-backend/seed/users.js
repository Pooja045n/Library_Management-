const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  }
};

const seedUsers = async () => {
  await connectDB();

  const hashedPassword = await bcrypt.hash('123456', 10); // default password

  const users = [
    {
      name: 'Admin User',
      email: 'admin@library.com',
      password: hashedPassword,
      role: 'admin',
      approved: true
    },
    {
      name: 'Librarian User',
      email: 'librarian@library.com',
      password: hashedPassword,
      role: 'librarian',
      approved: true
    },
    {
      name: 'Student One',
      email: 'student1@library.com',
      password: hashedPassword,
      role: 'student',
      approved: true
    }
  ];

  try {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log('✅ Users seeded');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedUsers();
