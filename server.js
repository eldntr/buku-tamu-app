// =================================================================
//                 FILE: server.js (KODE LENGKAP)
// =================================================================

const express = require('express');
const path = require('path');
const xlsx = require('xlsx');
const jwt = require('jsonwebtoken'); // Menggunakan JSON Web Token

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware bawaan Express
app.use(express.json()); // Untuk mem-parsing body JSON dari request
app.use(express.static('public')); // Untuk menyajikan file statis (HTML, CSS, JS client)

// --- Konfigurasi Otentikasi ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'anil1234';
const JWT_SECRET = 'kunci-rahasia-jwt-yang-lebih-baik-dan-panjang-untuk-keamanan'; // Ganti dengan secret acak Anda

// --- Database In-Memory ---
let guests = [
  { id: 1, name: 'Budi Santoso', organization: 'Masyarakat Umum', destination: 'Kepala Bagian Umum', purpose: 'Silaturahmi', phone: '081234567890', category: 'Pribadi', satisfactionRating: 5, createdAt: new Date('2025-06-25T10:00:00Z')},
  { id: 2, name: 'Citra Lestari', organization: 'PT Maju Jaya', destination: 'Divisi Pemasaran', purpose: 'Presentasi Produk', phone: '089876543210', category: 'Bisnis', satisfactionRating: 4, createdAt: new Date('2025-06-26T14:30:00Z')},
  { id: 3, name: 'Agus Setiawan', organization: 'Kementerian Komunikasi', destination: 'Sekretariat', purpose: 'Koordinasi', phone: '08111222333', category: 'Pemerintahan', satisfactionRating: 5, createdAt: new Date('2025-06-26T11:00:00Z')},
];
let currentId = 4;


// === Middleware untuk Verifikasi Token JWT ===
const isAdminAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

    if (token == null) {
        // 401 Unauthorized: Tidak ada token
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // 403 Forbidden: Token tidak valid atau kedaluwarsa
            return res.status(403).json({ error: 'Token tidak valid.' });
        }
        req.user = user;
        next(); // Lanjutkan ke endpoint jika token valid
    });
};


// =================================================================
//                    ENDPOINT API (RUTE APLIKASI)
// =================================================================

// --- 1. Rute Otentikasi ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Jika kredensial cocok, buat token JWT
        const accessToken = jwt.sign(
            { username: username, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );
        res.json({ success: true, accessToken: accessToken });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }
});

// --- 2. Rute Publik (Bisa diakses tanpa login) ---
app.post('/api/guests', (req, res) => {
    const { name, organization, destination, purpose, phone, category, satisfactionRating } = req.body;
    const newGuest = {
        id: currentId++,
        name: name || '',
        organization: organization || '',
        destination: destination || '',
        purpose: purpose || '',
        phone: phone || '',
        category: category || '',
        satisfactionRating: satisfactionRating ? parseInt(satisfactionRating, 10) : null,
        createdAt: new Date()
    };
    guests.push(newGuest);
    res.status(201).json(newGuest);
});

// --- 3. Rute Khusus Admin (Wajib menggunakan token JWT) ---
const adminApiRouter = express.Router();
adminApiRouter.use(isAdminAuthenticated); // Terapkan middleware ke semua rute di bawah ini

// GET semua tamu
adminApiRouter.get('/guests', (req, res) => {
    const sortedGuests = [...guests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedGuests);
});

// GET satu tamu berdasarkan ID
adminApiRouter.get('/guests/:id', (req, res) => {
    const guest = guests.find(g => g.id === parseInt(req.params.id));
    if (guest) {
        res.json(guest);
    } else {
        res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }
});

// PUT (Update) data tamu
adminApiRouter.put('/guests/:id', (req, res) => {
    const guestIndex = guests.findIndex(g => g.id === parseInt(req.params.id));
    if (guestIndex === -1) {
        return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }
    const updatedData = req.body;
    guests[guestIndex] = { ...guests[guestIndex], ...updatedData };
    res.json(guests[guestIndex]);
});

// DELETE data tamu
adminApiRouter.delete('/guests/:id', (req, res) => {
    const initialLength = guests.length;
    guests = guests.filter(g => g.id !== parseInt(req.params.id));
    if (initialLength === guests.length) {
        return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }
    res.status(204).send();
});

// GET statistik ringkasan
adminApiRouter.get('/stats/summary', (req, res) => {
    const visitsPerDay = guests.reduce((acc, guest) => {
        const date = new Date(guest.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const sortedVisits = Object.entries(visitsPerDay)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    res.json({ totalGuests: guests.length, visitsOverTime: sortedVisits });
});

// GET statistik kepuasan
adminApiRouter.get('/stats/satisfaction', (req, res) => {
    const satisfactionCounts = guests.reduce((acc, guest) => {
        if (guest.satisfactionRating) {
            const rating = guest.satisfactionRating;
            acc[rating] = (acc[rating] || 0) + 1;
        }
        return acc;
    }, {});
    res.json(satisfactionCounts);
});

// GET laporan Excel
adminApiRouter.get('/report/excel', (req, res) => {
    const reportData = guests.map(g => ({
        'Nama': g.name,
        'Instansi/Organisasi': g.organization,
        'Kategori': g.category,
        'Tujuan (Bertemu)': g.destination,
        'Keperluan': g.purpose,
        'No. Telepon': g.phone,
        'Rating Kepuasan': g.satisfactionRating,
        'Tanggal Kunjungan': new Date(g.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    }));
    const worksheet = xlsx.utils.json_to_sheet(reportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Kunjungan");
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_kunjungan.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
});

// Terapkan router admin ke path /api/admin
app.use('/api/admin', adminApiRouter);


// =================================================================
//                      MENJALANKAN SERVER
// =================================================================
app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});