const formRegister = document.getElementById('formRegister');
const pesan = document.getElementById('pesan');

formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

   
    if (!nama || !email || !username || !password) {
        pesan.textContent = 'Semua field wajib diisi.';
        pesan.className = 'message error';
        return;
    }

    if (password.length < 6) {
        pesan.textContent = 'Password minimal 6 karakter.';
        pesan.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            pesan.textContent = 'Akun berhasil dibuat! Mengarahkan...';
            pesan.className = 'message success';
            
            window.location.href = '/manajemen-kelas.html';
        } else {
            pesan.textContent = data.message || 'Gagal membuat akun.';
            pesan.className = 'message error';
        }
    } catch (err) {
        console.error(err);
        pesan.textContent = 'Tidak bisa terhubung ke server.';
        pesan.className = 'message error';
    }
});
