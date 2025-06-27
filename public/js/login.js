document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; // Kosongkan pesan error

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // Jika login sukses, alihkan ke dashboard admin
                window.location.href = '/index.html';
            } else {
                const data = await response.json();
                errorMessage.textContent = data.message || 'Login gagal.';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Terjadi kesalahan pada server.';
        }
    });
});