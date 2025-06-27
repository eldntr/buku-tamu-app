const express = require('express');
const session = require('express-session'); // Import express-session
const path = require('path');
const xlsx = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

// === KONFIGURASI SESI ===
app.use(session({
    secret: 'ini-adalah-rahasia-yang-sangat-aman-12345', // Ganti dengan secret acak yang kuat
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Di production (HTTPS), set ke true
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data Akun Admin (Hardcoded)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'anil1234';

// Data Tamu (database in-memory) - tidak berubah
let guests = [
  { id: 1, name: 'Budi Santoso', organization: 'Masyarakat Umum', destination: 'Kepala Bagian Umum', purpose: 'Silaturahmi', phone: '081234567890', category: 'Pribadi', satisfactionRating: 5, createdAt: new Date('2025-06-25T10:00:00Z')},
  { id: 2, name: 'Citra Lestari', organization: 'PT Maju Jaya', destination: 'Divisi Pemasaran', purpose: 'Presentasi Produk', phone: '089876543210', category: 'Bisnis', satisfactionRating: 4, createdAt: new Date('2025-06-26T14:30:00Z')},
  { id: 3, name: 'Agus Setiawan', organization: 'Kementerian Komunikasi', destination: 'Sekretariat', purpose: 'Koordinasi', phone: '08111222333', category: 'Pemerintahan', satisfactionRating: 5, createdAt: new Date('2025-06-26T11:00:00Z')},
];
let currentId = 4;

// === MIDDLEWARE OTENTIKASI ADMIN ===
const isAdminAuthenticated = (req, res, next) => {
    if (req.session.isAdmin) {
        next(); // Jika sudah login, lanjutkan
    } else {
        res.status(401).json({ error: 'Akses ditolak. Silakan login.' });
    }
};

// === API ENDPOINTS OTENTIKASI ===

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true; // Set flag admin di sesi
        res.json({ success: true, message: 'Login berhasil' });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Gagal logout' });
        }
        res.clearCookie('connect.sid'); // Hapus cookie sesi
        res.json({ success: true, message: 'Logout berhasil' });
    });
});

// GET /api/auth/status - Untuk memeriksa status login dari frontend
app.get('/api/auth/status', isAdminAuthenticated, (req, res) => {
    // Jika middleware lolos, berarti admin sudah login
    res.json({ isAdmin: true });
});

// === API ENDPOINTS PUBLIK (Tidak Perlu Login) ===

// POST /api/guests - Siapa saja bisa mengisi buku tamu
app.post('/api/guests', (req, res) => {
    const { name, organization, destination, purpose, phone, category, satisfactionRating } = req.body;
    const newGuest = { id: currentId++, name: name || '', organization: organization || '', destination: destination || '', purpose: purpose || '', phone: phone || '', category: category || '', satisfactionRating: satisfactionRating ? parseInt(satisfactionRating, 10) : null, createdAt: new Date() };
    guests.push(newGuest);
    res.status(201).json(newGuest);
});


// === API ENDPOINTS KHUSUS ADMIN (Perlu Login) ===

// Terapkan middleware 'isAdminAuthenticated' ke semua rute admin
const adminApiRouter = express.Router();
adminApiRouter.use(isAdminAuthenticated);

// READ all guests
adminApiRouter.get('/guests', (req, res) => {
  res.json([...guests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});
// READ single guest
adminApiRouter.get('/guests/:id', (req, res) => {
    const guest = guests.find(g => g.id === parseInt(req.params.id));
    if (guest) res.json(guest); else res.status(404).json({ error: 'Tamu tidak ditemukan' });
});
// UPDATE guest
adminApiRouter.put('/guests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const guestIndex = guests.findIndex(g => g.id === id);
    if (guestIndex === -1) return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    const { name, organization, destination, purpose, phone, category, satisfactionRating } = req.body;
    guests[guestIndex] = { ...guests[guestIndex], name, organization, destination, purpose, phone, category, satisfactionRating: satisfactionRating ? parseInt(satisfactionRating, 10) : guests[guestIndex].satisfactionRating };
    res.json(guests[guestIndex]);
});
// DELETE guest
adminApiRouter.delete('/guests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = guests.length;
    guests = guests.filter(g => g.id !== id);
    if (guests.length === initialLength) return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    res.status(204).send();
});
// STATS summary
adminApiRouter.get('/stats/summary', (req, res) => {
    const visitsPerDay = guests.reduce((acc, guest) => { const date = new Date(guest.createdAt).toISOString().split('T')[0]; acc[date] = (acc[date] || 0) + 1; return acc; }, {});
    const sortedVisits = Object.entries(visitsPerDay).sort((a, b) => new Date(a[0]) - new Date(b[0])).reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    res.json({ totalGuests: guests.length, visitsOverTime: sortedVisits });
});
// STATS satisfaction
adminApiRouter.get('/stats/satisfaction', (req, res) => {
    const satisfactionCounts = guests.reduce((acc, guest) => { if (guest.satisfactionRating) { const rating = guest.satisfactionRating; acc[rating] = (acc[rating] || 0) + 1; } return acc; }, {});
    res.json(satisfactionCounts);
});
// REPORT excel
adminApiRouter.get('/report/excel', (req, res) => {
    const reportData = guests.map(g => ({ 'Nama': g.name, 'Instansi/Organisasi': g.organization, 'Kategori': g.category, 'Tujuan (Bertemu)': g.destination, 'Keperluan': g.purpose, 'No. Telepon': g.phone, 'Rating Kepuasan': g.satisfactionRating, 'Tanggal Kunjungan': new Date(g.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) }));
    const worksheet = xlsx.utils.json_to_sheet(reportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Kunjungan");
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_kunjungan.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
});

// Gunakan router admin untuk semua endpoint yang dimulai dengan /api/