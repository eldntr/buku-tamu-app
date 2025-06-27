// (Kode untuk memuat navbar dan highlight link aktif tetap ada di atasnya)
document.addEventListener("DOMContentLoaded", () => {
    fetch('components/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
            
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('nav-active');
                }
            });

            // === TAMBAHKAN BLOK KODE INI ===
            const logoutBtn = document.getElementById('logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        const response = await fetch('/api/auth/logout', { method: 'POST' });
                        if (response.ok) {
                            window.location.href = '/login.html'; // Redirect ke login setelah logout
                        }
                    } catch (error) {
                        console.error('Logout failed:', error);
                    }
                });
            }
            // === AKHIR BLOK KODE TAMBAHAN ===
        });
});