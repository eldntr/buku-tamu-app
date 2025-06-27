document.addEventListener('DOMContentLoaded', () => {
    const categoryListEl = document.getElementById('category-list');

    fetch('/api/guests')
        .then(response => response.json())
        .then(guests => {
            // Kelompokkan tamu berdasarkan kategori
            const groupedByCategory = guests.reduce((acc, guest) => {
                const category = guest.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(guest);
                return acc;
            }, {});

            // Tampilkan data
            categoryListEl.innerHTML = '';
            for (const category in groupedByCategory) {
                categoryListEl.innerHTML += `<h2>Kategori: ${category}</h2>`;
                let table = '<table><tr><th>Nama</th><th>Instansi</th><th>Tanggal</th></tr>';
                groupedByCategory[category].forEach(guest => {
                    table += `<tr><td>${guest.name}</td><td>${guest.organization}</td><td>${new Date(guest.createdAt).toLocaleDateString('id-ID')}</td></tr>`;
                });
                table += '</table><hr>';
                categoryListEl.innerHTML += table;
            }
        })
        .catch(error => console.error('Error fetching guests:', error));
});