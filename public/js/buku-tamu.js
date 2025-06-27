document.addEventListener('DOMContentLoaded', () => {
    const guestForm = document.getElementById('guestForm');
    const guestList = document.getElementById('guestList');
    
    // Fungsi untuk menampilkan daftar tamu
    const fetchGuests = () => {
        fetch('/api/guests')
            .then(response => response.json())
            .then(data => {
                guestList.innerHTML = '<ul>';
                data.slice(0, 5).forEach(guest => { // Tampilkan 5 tamu terakhir
                    guestList.innerHTML += `<li><strong>${guest.name}</strong> dari ${guest.organization} - ${new Date(guest.createdAt).toLocaleDateString('id-ID')}</li>`;
                });
                guestList.innerHTML += '</ul>';
            });
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
            // Jika rating tidak dipilih, kirim null
            satisfactionRating: ratingInput ? ratingInput.value : null
        };

        fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal menambahkan tamu');
            }
            return response.json();
        })
        .then(data => {
            alert(`Terima kasih, ${data.name}! Data Anda telah disimpan.`);
            guestForm.reset();
            fetchGuests(); // Refresh daftar tamu
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan. Pastikan semua field terisi.');
        });
    });

    // Panggil saat halaman dimuat
    fetchGuests();
});