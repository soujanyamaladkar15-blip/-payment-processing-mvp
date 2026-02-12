require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use('/', express.static(path.join(__dirname, 'public')));

// Validation helpers
const nameRegex = /^[A-Za-z ]{3,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactRegex = /^\d{10}$/;
const amountRegex = /^\d{1,6}\.\d{2}$/; // up to 6 digits before decimal -> max 999999.99 but we enforce range below

function validatePayment(data) {
  const errors = {};
  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  const contact = (data.contact || '').trim();
  const amountStr = (data.amount || '').toString().trim();

  if (!name) errors.name = 'Name is required';
  else if (!nameRegex.test(name)) errors.name = 'Name must be 3-50 alphabetic characters and spaces only';

  if (!email) errors.email = 'Email is required';
  else if (!emailRegex.test(email)) errors.email = 'Invalid email format';

  if (!contact) errors.contact = 'Contact is required';
  else if (!contactRegex.test(contact)) errors.contact = 'Contact must be exactly 10 digits';

  if (!amountStr) errors.amount = 'Amount is required';
  else if (!amountRegex.test(amountStr)) errors.amount = 'Amount must be in format 100.00';
  else {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) errors.amount = 'Invalid amount';
    else if (amount < 1.0) errors.amount = 'Amount must be at least ₹1.00';
    else if (amount > 100000.0) errors.amount = 'Amount must not exceed ₹100000.00';
  }

  return errors;
}

// POST /api/payment
app.post('/api/payment', async (req, res) => {
  try {
    const errors = validatePayment(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });

    const { name, email, contact } = req.body;
    const amount = parseFloat(req.body.amount);

    // Simulate processing - we'll mark success
    const status = 'success';

    const stmt = `INSERT INTO payments (name, email, contact, amount, status) VALUES (?, ?, ?, ?, ?)`;
    db.run(stmt, [name.trim(), email.trim(), contact.trim(), amount, status], function (err) {
      if (err) {
        console.error('DB insert error', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      const paymentId = this.lastID;
      return res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        paymentId: String(paymentId),
        data: {
          name: name.trim(),
          email: email.trim(),
          amount: amount,
          status
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payments
app.get('/api/payments', (req, res) => {
  db.all('SELECT id, name, email, contact, amount, status, created_at FROM payments ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
