const express = require('express');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');
const app = express();
require('dotenv').config();

connectDB();
app.use(express.json());
app.use(require('cors')());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/uploads', express.static('uploads'));
app.use('/api/librarian', require('./routes/librarian'));
app.use('/api/admin', require('./routes/admin'));
app.use('/admin', adminRoutes);
app.use('/api/user', require('./routes/user'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
