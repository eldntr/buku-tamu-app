// Fungsi untuk melakukan fetch ke API admin dengan menyertakan token
async function fetchAdminAPI(url, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });

    // Jika token tidak valid (401 atau 403), redirect ke login
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
        throw new Error('Akses ditolak'); // Hentikan eksekusi lebih lanjut
    }

    return response;
}