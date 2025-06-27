document.addEventListener('DOMContentLoaded', () => {
    const guestForm = document.getElementById('guestForm');

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
                return response.json().then(err => { throw new Error(err.error || 'Gagal menambahkan tamu') });
            }
            return response.json();
        })
        .then(data => {
            alert(`Terima kasih, ${data.name || 'Tamu'}! Data Anda telah berhasil disimpan.`);
            window.location.href = '/index.html'; // Arahkan ke halaman utama
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        });
    });

    // Tidak ada lagi yang perlu dijalankan saat halaman dimuat
});