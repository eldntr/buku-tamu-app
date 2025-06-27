document.addEventListener('DOMContentLoaded', () => {
    const guestForm = document.getElementById('guestForm');
    const guestList = document.getElementById('guestList');
    
    // Fungsi untuk menampilkan 5 tamu terakhir saat halaman dimuat
    const fetchGuests = () => {
        // Endpoint untuk mengambil tamu tidak perlu otentikasi jika kita ingin menampilkannya ke publik
        // Namun, jika endpoint ini sekarang diamankan, panggilannya harus diubah/dihapus.
        // Untuk amannya, kita bisa hapus fitur ini dari halaman publik.
        // Mari kita biarkan kosong untuk saat ini agar tidak memanggil API admin.
        guestList.innerHTML = '<p><em>Daftar kunjungan hanya dapat dilihat oleh admin.</em></p>';
    };

    // Event handler untuk submit form
    guestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        const guestData = {
            name: document.getElementById('name').value,
            organization: document.getElementById('organization').value,
            destination: document.getElementById('destination').value,
            purpose: document.getElementById('purpose').value,
            phone: document.getElementById('phone').value,
            category: document.getElementById('category').value,
            satisfactionRating: ratingInput ? ratingInput.value : null
        };

        // Menggunakan endpoint publik /api/guests
        fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
        })
        .then(response => {
            if (!response.ok) {
                // Jika server mengembalikan error, coba baca pesannya
                return response.json().then(err => { throw new Error(err.error || 'Gagal menambahkan tamu') });
            }
            return response.json();
        })
        .then(data => {
            // Tampilkan pesan konfirmasi
            alert(`Terima kasih, ${data.name || 'Tamu'}! Data Anda telah berhasil disimpan.`);
            
            // ======================================================
            // PERUBAHAN UTAMA: Arahkan ke halaman utama (index.html)
            // ======================================================
            window.location.href = '/index.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        });
    });

    // Panggil saat halaman dimuat
    fetchGuests();
});