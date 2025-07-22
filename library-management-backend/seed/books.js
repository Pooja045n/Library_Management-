const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected for seeding');

  const sampleBooks = [
    { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming' },
    { title: 'Atomic Habits', author: 'James Clear', category: 'Self-help' },
    { title: 'The Pragmatic Programmer', author: 'Andy Hunt', category: 'Programming' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Education' },
    { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity' },
    { title: 'Harry Potter', author: 'J.K. Rowling', category: 'Fiction' },
    { title: 'Zero to One', author: 'Peter Thiel', category: 'Startup' }
  ];

  await Book.deleteMany({});
  await Book.insertMany(sampleBooks);

  console.log('✅ Books inserted');
  process.exit();
}).catch(err => {
  console.error('❌ Error seeding books:', err);
});
