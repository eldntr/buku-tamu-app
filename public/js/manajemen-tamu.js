document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById('guest-table-body');
    const modal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const editForm = document.getElementById('editForm');

    const fetchAndDisplayGuests = async () => {
        try {
            const response = await fetchAdminAPI('/api/admin/guests');
            const guests = await response.json();
            
            tableBody.innerHTML = '';
            guests.forEach(guest => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${guest.name || '-'}</td>
                    <td>${guest.organization || '-'}</td>
                    <td>${guest.destination || '-'}</td>
                    <td>${new Date(guest.createdAt).toLocaleDateString('id-ID')}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${guest.id}">Edit</button>
                        <button class="delete-btn" data-id="${guest.id}">Hapus</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Gagal memuat data tamu:', error);
        }
    };

    const openEditModal = async (id) => {
        try {
            const response = await fetchAdminAPI(`/api/admin/guests/${id}`);
            const guest = await response.json();

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
            console.error('Gagal mengambil data untuk edit:', error);
        }
    };

    const deleteGuest = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        
        try {
            await fetchAdminAPI(`/api/admin/guests/${id}`, { method: 'DELETE' });
            fetchAndDisplayGuests();
        } catch (error) {
            console.error('Gagal menghapus data:', error);
            alert('Gagal menghapus data.');
        }
    };

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(e.target.dataset.id);
        }
        if (e.target.classList.contains('delete-btn')) {
            deleteGuest(e.target.dataset.id);
        }
    });

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
            await fetchAdminAPI(`/api/admin/guests/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
            modal.style.display = 'none';
            fetchAndDisplayGuests();
        } catch (error) {
            console.error('Gagal menyimpan perubahan:', error);
            alert('Gagal menyimpan perubahan.');
        }
    });

    closeButton.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    fetchAndDisplayGuests();
});