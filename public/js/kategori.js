document.addEventListener('DOMContentLoaded', async () => {
    const categoryListEl = document.getElementById('category-list');

    try {
        const response = await fetchAdminAPI('/api/admin/guests');
        const guests = await response.json();

        const groupedByCategory = guests.reduce((acc, guest) => {
            const category = guest.category || 'Tidak Dikategorikan';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(guest);
            return acc;
        }, {});

        categoryListEl.innerHTML = '';
        if (Object.keys(groupedByCategory).length === 0) {
            categoryListEl.innerHTML = '<p>Belum ada data tamu.</p>';
            return;
        }

        for (const category in groupedByCategory) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';

            let tableHTML = `
                <h2>Kategori: ${category} (${groupedByCategory[category].length} tamu)</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Instansi</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            groupedByCategory[category].forEach(guest => {
                tableHTML += `
                    <tr>
                        <td>${guest.name || '-'}</td>
                        <td>${guest.organization || '-'}</td>
                        <td>${new Date(guest.createdAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table></div><hr>`;
            categorySection.innerHTML = tableHTML;
            categoryListEl.appendChild(categorySection);
        }
    } catch (error) {
        categoryListEl.innerHTML = '<p style="color: red;">Gagal memuat data tamu.</p>';
        console.error('Gagal memuat data kategori:', error);
    }
});