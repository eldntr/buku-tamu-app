document.addEventListener('DOMContentLoaded', async () => {
    const totalGuestsEl = document.getElementById('total-guests');
    const ctx = document.getElementById('visitsChart').getContext('2d');

    try {
        // Gunakan fetchAdminAPI yang sudah didefinisikan di api-helper.js
        const response = await fetchAdminAPI('/api/admin/stats/summary');
        
        if (!response.ok) {
            // Jika helper tidak me-redirect, tangani error di sini
            throw new Error('Gagal mengambil data ringkasan.');
        }

        const data = await response.json();
        
        // Tampilkan total tamu
        totalGuestsEl.textContent = data.totalGuests;

        // Siapkan data untuk grafik
        const labels = Object.keys(data.visitsOverTime);
        const visitCounts = Object.values(data.visitsOverTime);

        // Render grafik
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jumlah Kunjungan',
                    data: visitCounts,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
        // Mungkin tampilkan pesan error di halaman jika diperlukan
        if (document.querySelector('.main-content')) {
            document.querySelector('.main-content').innerHTML = `<h1>Oops!</h1><p>Gagal memuat data dashboard. Error: ${error.message}</p><p>Silakan coba login kembali.</p>`;
        }
    }
});