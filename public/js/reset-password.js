const userId = sessionStorage.getItem('resetUserId');

if (!userId) {
    window.location.href = '/verifikasi-akun.html';
}

const formResetPassword = document.getElementById('formResetPassword');
const pesan = document.getElementById('pesan');

formResetPassword.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passwordBaru = document.getElementById('passwordBaru').value.trim();

    if (!passwordBaru) {
        pesan.textContent = 'Password baru wajib diisi.';
        pesan.className = 'message error';
        return;
    }

    if (passwordBaru.length < 6) {
        pesan.textContent = 'Password minimal 6 karakter.';
        pesan.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, passwordBaru }),
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.removeItem('resetUserId');
            pesan.textContent = 'Password berhasil diubah! Mengarahkan ke halaman login...';
            pesan.className = 'message success';
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            pesan.textContent = data.message || 'Gagal mengubah password.';
            pesan.className = 'message error';
        }
    } catch (err) {
        console.error(err);
        pesan.textContent = 'Tidak bisa terhubung ke server.';
        pesan.className = 'message error';
    }
});