const formVerifikasi = document.getElementById('formVerifikasi');
const pesan = document.getElementById('pesan');

formVerifikasi.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!username || !email) {
        pesan.textContent = 'Username dan email wajib diisi.';
        pesan.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/api/verifikasi-akun', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('resetUserId', data.userId);
            window.location.href = '/reset-password.html';
        } else {
            pesan.textContent = data.message || 'Verifikasi gagal.';
            pesan.className = 'message error';
        }
    } catch (err) {
        console.error(err);
        pesan.textContent = 'Tidak bisa terhubung ke server.';
        pesan.className = 'message error';
    }
});