document.addEventListener('DOMContentLoaded', () => {
    const totalGuestsEl = document.getElementById('total-guests');
    const ctx = document.getElementById('visitsChart').getContext('2d');

    fetchAdminAPI('/api/admin/stats/summary')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Tampilkan total tamu
            totalGuestsEl.textContent = data.totalGuests;

            // Siapkan data untuk grafik
            const labels = Object.keys(data.visitsOverTime);
            const visitCounts = Object.values(data.visitsOverTime);

            // Render grafik
            new Chart(ctx, {
                type: 'line', // Grafik garis
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
                                stepSize: 1 // Hanya tampilkan angka bulat di sumbu Y
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => {
            // Error 'Akses ditolak' sudah ditangani di helper,
            // jadi kita hanya perlu menangani error lain di sini.
            if (error.message !== 'Akses ditolak') {
                 console.error('Error fetching dashboard stats:', error);
            }
        });
});