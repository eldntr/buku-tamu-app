// Ambil elemen form baru
const guestForm = document.getElementById('guestForm');
const guestList = document.getElementById('guestList');
const guestIdInput = document.getElementById('guestId');
const nameInput = document.getElementById('name');
const organizationInput = document.getElementById('organization');
const destinationInput = document.getElementById('destination');
const purposeInput = document.getElementById('purpose');
const phoneInput = document.getElementById('phone');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const API_URL = '/api/guests';

// Fungsi untuk mengambil dan menampilkan semua tamu (disesuaikan)
const fetchGuests = async () => {
    try {
        const response = await fetch(API_URL);
        const guests = await response.json();
        
        guestList.innerHTML = '';
        guests.forEach(guest => {
            const guestItem = document.createElement('div');
            guestItem.className = 'guest-item';
            // Tampilkan data baru di kartu tamu
            guestItem.innerHTML = `
                <div>
                    <p><strong>Nama:</strong> ${guest.name}</p>
                    <p><strong>Instansi:</strong> ${guest.organization}</p>
                    <p><strong>Bertemu:</strong> ${guest.destination}</p>
                    <p><strong>Keperluan:</strong> ${guest.purpose}</p>
                    <p><strong>No. Telp:</strong> ${guest.phone}</p>
                </div>
                <div class="actions">
                    <button onclick="editGuest(${guest.id}, '${guest.name}', '${guest.organization}', '${guest.destination}', '${guest.purpose}', '${guest.phone}')">Edit</button>
                    <button onclick="deleteGuest(${guest.id})">Hapus</button>
                </div>
            `;
            guestList.appendChild(guestItem);
        });
    } catch (error) {
        console.error('Error fetching guests:', error);
    }
};

// Event listener untuk form submission (disesuaikan)
guestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = guestIdInput.value;
    
    // Kumpulkan data dari semua field
    const guestData = {
        name: nameInput.value,
        organization: organizationInput.value,
        destination: destinationInput.value,
        purpose: purposeInput.value,
        phone: phoneInput.value,
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
        });

        if (response.ok) {
            resetForm();
            fetchGuests();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

// Fungsi untuk mengisi form saat Edit diklik (disesuaikan)
window.editGuest = (id, name, organization, destination, purpose, phone) => {
    guestIdInput.value = id;
    nameInput.value = name;
    organizationInput.value = organization;
    destinationInput.value = destination;
    purposeInput.value = purpose;
    phoneInput.value = phone;
    cancelEditBtn.classList.remove('hidden');
    window.scrollTo(0, 0);
};

// Fungsi untuk menghapus tamu (tidak perlu diubah)
window.deleteGuest = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data tamu ini?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) fetchGuests();
            else alert('Gagal menghapus tamu.');
        } catch (error) {
            console.error('Error deleting guest:', error);
        }
    }
};

// Fungsi untuk mereset form (tidak perlu diubah, karena form.reset() sudah menghapus semua input)
const resetForm = () => {
    guestForm.reset();
    guestIdInput.value = '';
    cancelEditBtn.classList.add('hidden');
};

cancelEditBtn.addEventListener('click', resetForm);

// Muat data tamu saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', fetchGuests);