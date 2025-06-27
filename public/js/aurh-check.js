// Cek status otentikasi admin
fetch('/api/auth/status')
    .then(response => {
        if (!response.ok) {
            // Jika status tidak OK (misal: 401 Unauthorized), redirect ke halaman login
            window.location.href = '/login.html';
        }
        // Jika OK, tidak melakukan apa-apa, biarkan halaman dimuat
    })
    .catch(error => {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
    });