const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});
function sendMail(to, subject, text) {
    transporter.sendMail({
        to:to,
        subject: subject,
        html: text
    });
    console.log(`Email sent to ${to} with subject "${subject}"`);
}

sendMail('nagapuripooja01@gmail.com', 'Test Email', '<h1>Hello from User!!/h1><p>This is a test email sent using Nodemailer.</p>');