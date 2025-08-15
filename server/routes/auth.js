const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'user'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'User registered successfully' });
        }
    );
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

        const user = results[0];
        const validPass = bcrypt.compareSync(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // ✅ Send token, role, and name
        res.json({
            token,
            role: user.role,
            name: user.name
        });
    });
});

// Get current logged-in user
router.get("/me", authMiddleware, (req, res) => {
    db.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length === 0) return res.status(404).json({ error: "User not found" });
            res.json(results[0]);
        }
    );
});

module.exports = router;
