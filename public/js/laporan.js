document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-report-btn');
    const statusEl = document.getElementById('download-status');

    downloadBtn.addEventListener('click', async () => {
        statusEl.textContent = 'Mempersiapkan file, harap tunggu...';
        downloadBtn.disabled = true;

        try {
            const response = await fetchAdminAPI('/api/admin/report/excel');

            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server.');
            }

            // Mengubah response menjadi blob (binary large object)
            const blob = await response.blob();
            
            // Membuat URL sementara untuk blob
            const url = window.URL.createObjectURL(blob);
            
            // Membuat link virtual untuk memicu download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'laporan_kunjungan_tamu.xlsx'; // Nama file yang akan diunduh
            
            document.body.appendChild(a);
            a.click(); // Memicu download
            
            // Membersihkan URL sementara setelah download
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            statusEl.textContent = 'File berhasil diunduh!';
        } catch (error) {
            console.error('Gagal mengunduh laporan:', error);
            statusEl.textContent = 'Gagal mengunduh laporan. Silakan coba lagi.';
        } finally {
            downloadBtn.disabled = false;
        }
    });
});