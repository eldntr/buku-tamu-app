document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetchAdminAPI('/api/admin/stats/satisfaction');
        const data = await response.json();
        
        const ctx = document.getElementById('satisfactionChart').getContext('2d');
        const labels = ['Buruk (1★)', 'Kurang (2★)', 'Cukup (3★)', 'Baik (4★)', 'Luar Biasa (5★)'];
        const counts = [
            data['1'] || 0,
            data['2'] || 0,
            data['3'] || 0,
            data['4'] || 0,
            data['5'] || 0
        ];

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jumlah Penilaian',
                    data: counts,
                    backgroundColor: ['#dc3545', '#ffc107', '#fd7e14', '#20c997', '#0d6efd'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribusi Penilaian Kepuasan'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Gagal memuat statistik kepuasan:", error);
    }
});