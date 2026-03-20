// ===============================
// IMPORTS
// ===============================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json({ limit: '10mb' })); // for signature

// ===============================
// FILE UPLOAD SETUP
// ===============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// ===============================
// DB CONNECTION
// ===============================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ClubManagement'
});

// ===============================
// ROOT
// ===============================
app.get('/', (req, res) => {
    res.send('Club Management API Running ✅');
});


// ======================================================
// 1. OFFICE STAFF
// ======================================================
app.post('/api/staff', (req, res) => {
    const { access_id, name, email, phone_number, position } = req.body;

    const sql = `
        INSERT INTO Office_Staff 
        (access_id, name, email, phone_number, position)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [access_id, name, email, phone_number, position], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Staff Added ✅' });
    });
});

app.get('/api/staff', (req, res) => {
    db.query('SELECT * FROM Office_Staff', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.delete('/api/staff/:id', (req, res) => {
    db.query('DELETE FROM Office_Staff WHERE staff_id=?', [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Deleted ✅' });
        });
});


// ======================================================
// 2. MEMBERS
// ======================================================
app.post('/api/members', (req, res) => {
    const { name, email, phone_number, position, payment_type } = req.body;

    db.query(
        'INSERT INTO Members (name,email,phone_number,position,payment_type) VALUES (?,?,?,?,?)',
        [name, email, phone_number, position, payment_type],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Member Added ✅' });
        }
    );
});

app.get('/api/members', (req, res) => {
    db.query('SELECT * FROM Members', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ======================================================
// 3. RESERVATIONS (GET)
// ======================================================
app.get('/api/reservations', (req, res) => {
    db.query('SELECT * FROM Reservations ORDER BY reservation_id DESC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        });
});


// ======================================================
// 🔥 4. ADVANCED RESERVATION (HOMEPAGE)
// ======================================================
app.post('/api/book', upload.single('document'), (req, res) => {

    const {
        location,
        subLocation,
        memberId,
        name,
        email,
        phone,
        date,
        startTime,
        endTime,
        requirements,
        signature
    } = req.body;

    // ✅ Final location
    let finalLocation = location;
    if (location === 'Ground Bar Restaurant' && subLocation) {
        finalLocation = subLocation;
    }

    // ✅ Time combine
    const bookingTime = `${startTime} - ${endTime}`;

    // ✅ Member handling
    const member = memberId && memberId !== '' ? memberId : null;

    // ✅ Signature
    const signatureImage = signature || null;

    // ✅ Default status
    const status = 'Pending';

    const sql = `
        INSERT INTO Reservations
        (member_id, name, email, phone, location, booking_date, booking_time, notes, signature_image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        member,
        name,
        email,
        phone,
        finalLocation,
        date,
        bookingTime,
        requirements,
        signatureImage,
        status
    ], (err) => {

        if (err) {
            console.error(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });

});


// ======================================================
// 5. TICKETS
// ======================================================
app.post('/api/tickets', (req, res) => {
    const { name, email, phone_no, match_no, chair_no, price, payment_method } = req.body;

    db.query(
        `INSERT INTO Tickets 
        (name,email,phone_no,match_no,chair_no,price,payment_method)
        VALUES (?,?,?,?,?,?,?)`,
        [name, email, phone_no, match_no, chair_no, price, payment_method],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Ticket Booked 🎟️' });
        }
    );
});

app.get('/api/tickets', (req, res) => {
    db.query('SELECT * FROM Tickets', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ======================================================
// 6. MERCH
// ======================================================
app.post('/api/merch', (req, res) => {
    const { name, email, phone_no, address, tshirt_size, qty, payment_method } = req.body;

    db.query(
        `INSERT INTO Merchandising 
        (name,email,phone_no,address,tshirt_size,qty,payment_method)
        VALUES (?,?,?,?,?,?,?)`,
        [name, email, phone_no, address, tshirt_size, qty, payment_method],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Order Placed 👕' });
        }
    );
});

app.get('/api/merch', (req, res) => {
    db.query('SELECT * FROM Merchandising', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ======================================================
// 7. SQUAD
// ======================================================
app.post('/api/squad', (req, res) => {
    const { name, position, tshirt_no } = req.body;

    db.query(
        'INSERT INTO Squad (name, position, tshirt_no) VALUES (?,?,?)',
        [name, position, tshirt_no],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Player Added ⚽' });
        }
    );
});

app.get('/api/squad', (req, res) => {
    db.query('SELECT * FROM Squad', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ======================================================
// 8. GOVERNANCE
// ======================================================
app.post('/api/governance', (req, res) => {
    const { name, title, email, year_active, category } = req.body;

    db.query(
        `INSERT INTO Governance 
        (name,title,email,year_active,category)
        VALUES (?,?,?,?,?)`,
        [name, title, email, year_active, category],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Added 🏛️' });
        }
    );
});

app.get('/api/governance', (req, res) => {
    db.query('SELECT * FROM Governance', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ===============================
// SERVER START
// ===============================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});