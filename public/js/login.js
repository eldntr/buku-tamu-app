document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();

            if (response.ok) {
                // Simpan token ke localStorage
                localStorage.setItem('authToken', data.accessToken);
                
                // PENTING: Pastikan redirect ke dashboard.html
                window.location.href = '/dashboard.html'; 

            } else {
                errorMessage.textContent = data.message || 'Login gagal.';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Terjadi kesalahan pada server.';
        }
    });
});