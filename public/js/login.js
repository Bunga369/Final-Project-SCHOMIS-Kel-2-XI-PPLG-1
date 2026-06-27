const formLogin = document.getElementById('formLogin');
const pesan = document.getElementById('pesan');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    
    if (!username || !password) {
        pesan.textContent = 'Username dan password wajib diisi.';
        pesan.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            pesan.textContent = 'Login berhasil! Mengarahkan...';
            pesan.className = 'message success';
            window.location.href = '/manajemen-kelas.html';
        } else {
            pesan.textContent = data.message || 'Login gagal.';
            pesan.className = 'message error';
        }
    } catch (err) {
        console.error(err);
        pesan.textContent = 'Tidak bisa terhubung ke server.';
        pesan.className = 'message error';
    }
});
