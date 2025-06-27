const express = require('express');
const cors = require('cors');
const path =require('path');
const xlsx = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data sementara (database in-memory)
let guests = [
  { 
    id: 1, name: 'Budi Santoso', organization: 'Masyarakat Umum', destination: 'Kepala Bagian Umum', purpose: 'Silaturahmi', phone: '081234567890', category: 'Pribadi', satisfactionRating: 5, createdAt: new Date('2025-06-25T10:00:00Z')
  },
  { 
    id: 2, name: 'Citra Lestari', organization: 'PT Maju Jaya', destination: 'Divisi Pemasaran', purpose: 'Presentasi Produk', phone: '089876543210', category: 'Bisnis', satisfactionRating: 4, createdAt: new Date('2025-06-26T14:30:00Z')
  },
  { 
    id: 3, name: 'Agus Setiawan', organization: 'Kementerian Komunikasi', destination: 'Sekretariat', purpose: 'Koordinasi', phone: '08111222333', category: 'Pemerintahan', satisfactionRating: 5, createdAt: new Date('2025-06-26T11:00:00Z')
  },
];
let currentId = 4;

// === API ENDPOINTS CRUD (Create, Read, Update, Delete) ===

// READ (GET all guests)
app.get('/api/guests', (req, res) => {
  res.json([...guests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// READ (GET a single guest by ID)
app.get('/api/guests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const guest = guests.find(g => g.id === id);
    if (guest) {
        res.json(guest);
    } else {
        res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }
});

// CREATE (POST a new guest) - Validasi Dihilangkan
app.post('/api/guests', (req, res) => {
  const { name, organization, destination, purpose, phone, category, satisfactionRating } = req.body;
  
  // Memberi nilai default jika field tidak diisi
  const newGuest = { 
    id: currentId++, 
    name: name || '',
    organization: organization || '',
    destination: destination || '',
    purpose: purpose || '',
    phone: phone || '',
    category: category || '',
    satisfactionRating: satisfactionRating ? parseInt(satisfactionRating, 10) : null, // null jika tidak ada rating
    createdAt: new Date()
  };
  guests.push(newGuest);
  res.status(201).json(newGuest);
});

// UPDATE (PUT a guest by ID) - Validasi Dihilangkan
app.put('/api/guests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const guestIndex = guests.findIndex(g => g.id === id);

    if (guestIndex === -1) {
        return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }

    const { name, organization, destination, purpose, phone, category, satisfactionRating } = req.body;
    
    const updatedGuest = {
        ...guests[guestIndex], // Ambil data lama
        name: name || guests[guestIndex].name,
        organization: organization || guests[guestIndex].organization,
        destination: destination || guests[guestIndex].destination,
        purpose: purpose || guests[guestIndex].purpose,
        phone: phone || guests[guestIndex].phone,
        category: category || guests[guestIndex].category,
        satisfactionRating: satisfactionRating ? parseInt(satisfactionRating, 10) : guests[guestIndex].satisfactionRating
    };
    
    guests[guestIndex] = updatedGuest;
    res.json(updatedGuest);
});

// DELETE (DELETE a guest by ID)
app.delete('/api/guests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = guests.length;
    guests = guests.filter(g => g.id !== id);

    if (guests.length === initialLength) {
        return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }
    res.status(204).send(); // Sukses tanpa konten
});


// === API ENDPOINTS LAINNYA (Tetap Sama) ===
// (Endpoint untuk stats dan report tidak diubah)

app.get('/api/stats/summary', (req, res) => {
    const visitsPerDay = guests.reduce((acc, guest) => {
        const date = new Date(guest.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const sortedVisits = Object.entries(visitsPerDay).sort((a, b) => new Date(a[0]) - new Date(b[0])).reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    res.json({ totalGuests: guests.length, visitsOverTime: sortedVisits });
});
app.get('/api/stats/satisfaction', (req, res) => {
    const satisfactionCounts = guests.reduce((acc, guest) => {
        if (guest.satisfactionRating) {
            const rating = guest.satisfactionRating;
            acc[rating] = (acc[rating] || 0) + 1;
        }
        return acc;
    }, {});
    res.json(satisfactionCounts);
});
app.get('/api/report/excel', (req, res) => {
    const reportData = guests.map(g => ({
        'Nama': g.name, 'Instansi/Organisasi': g.organization, 'Kategori': g.category, 'Tujuan (Bertemu)': g.destination, 'Keperluan': g.purpose, 'No. Telepon': g.phone, 'Rating Kepuasan': g.satisfactionRating, 'Tanggal Kunjungan': new Date(g.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    }));
    const worksheet = xlsx.utils.json_to_sheet(reportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Kunjungan");
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_kunjungan.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});