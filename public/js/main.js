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
            // ... (di dalam file main.js, setelah memuat navbar)
            const logoutBtn = document.getElementById('logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Hapus token dari localStorage
                    localStorage.removeItem('authToken');
                    // Redirect ke halaman login
                    window.location.href = '/login.html';
                });
            }
            // === AKHIR BLOK KODE TAMBAHAN ===
        });
});