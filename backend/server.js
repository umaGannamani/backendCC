const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'UMAGANNAMANI'; // Replace with a secure key

// Route to create a new user (signup)
app.post('/api/auth/signup', (req, res) => {
    const { name, company_name, role, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        // Insert the new user into the database
        const query = `INSERT INTO users (name, company_name, role, password) VALUES (?, ?, ?, ?)`;
        db.run(query, [name, company_name, role, hashedPassword], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
    });
});


// Route to create a new student
app.post('/api/students', (req, res) => {
    const { name, area_of_interest } = req.body;
    const query = `INSERT INTO students (name, area_of_interest) VALUES (?, ?)`;

    db.run(query, [name, area_of_interest], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Route to get all mentors by area of expertise
app.get('/api/mentors', (req, res) => {
    const { area_of_expertise } = req.query;
    const query = `SELECT * FROM mentors WHERE area_of_expertise = ?`;

    db.all(query, [area_of_expertise], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Route to create a new session
app.post('/api/sessions', (req, res) => {
    const { student_id, mentor_id, duration, session_time } = req.body;
    const query = `
        INSERT INTO sessions (student_id, mentor_id, duration, session_time)
        VALUES (?, ?, ?, ?)
    `;

    db.run(query, [student_id, mentor_id, duration, session_time], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Route to get all sessions
app.get('/api/sessions', (req, res) => {
    const query = `
        SELECT s.id, s.duration, s.session_time, st.name AS student_name, m.name AS mentor_name
        FROM sessions s
        JOIN students st ON s.student_id = st.id
        JOIN mentors m ON s.mentor_id = m.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
