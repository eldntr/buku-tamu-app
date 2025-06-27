document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById('guest-table-body');
    const modal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const editForm = document.getElementById('editForm');

    // Fungsi untuk mengambil dan menampilkan semua tamu di tabel
    const fetchAndDisplayGuests = async () => {
        try {
            const response = await fetch('/api/guests');
            const guests = await response.json();
            
            tableBody.innerHTML = ''; // Kosongkan tabel sebelum diisi
            guests.forEach(guest => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${guest.name}</td>
                    <td>${guest.organization}</td>
                    <td>${guest.destination}</td>
                    <td>${new Date(guest.createdAt).toLocaleDateString('id-ID')}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${guest.id}">Edit</button>
                        <button class="delete-btn" data-id="${guest.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };

    // Fungsi untuk membuka modal dan mengisi data untuk edit
    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/guests/${id}`);
            const guest = await response.json();

            // Isi form di dalam modal
            document.getElementById('edit-guestId').value = guest.id;
            document.getElementById('edit-name').value = guest.name;
            document.getElementById('edit-organization').value = guest.organization;
            document.getElementById('edit-destination').value = guest.destination;
            document.getElementById('edit-purpose').value = guest.purpose;
            document.getElementById('edit-phone').value = guest.phone;
            document.getElementById('edit-category').value = guest.category;
            document.getElementById('edit-satisfactionRating').value = guest.satisfactionRating;
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching guest data for edit:', error);
        }
    };

    // Fungsi untuk menghapus tamu
    const deleteGuest = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        
        try {
            const response = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchAndDisplayGuests(); // Refresh tabel
            } else {
                alert('Gagal menghapus data.');
            }
        } catch (error) {
            console.error('Error deleting guest:', error);
        }
    };

    // Event listener untuk tombol di dalam tabel (Edit & Delete)
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            openEditModal(id);
        }
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteGuest(id);
        }
    });

    // Event listener untuk form edit saat disubmit
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-guestId').value;
        const updatedData = {
            name: document.getElementById('edit-name').value,
            organization: document.getElementById('edit-organization').value,
            destination: document.getElementById('edit-destination').value,
            purpose: document.getElementById('edit-purpose').value,
            phone: document.getElementById('edit-phone').value,
            category: document.getElementById('edit-category').value,
            satisfactionRating: document.getElementById('edit-satisfactionRating').value,
        };

        try {
            const response = await fetch(`/api/guests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                modal.style.display = 'none';
                fetchAndDisplayGuests(); // Refresh tabel
            } else {
                alert('Gagal menyimpan perubahan.');
            }
        } catch (error) {
            console.error('Error updating guest:', error);
        }
    });

    // Tutup modal
    closeButton.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Panggil fungsi utama saat halaman dimuat
    fetchAndDisplayGuests();
});