# Cara Menjalankan SCHOMIS

1. Install Node.js (jika belum ada): https://nodejs.org
2. Install XAMPP (jika belum ada): https://www.apachefriends.org
3. Buka XAMPP Control Panel → Start Apache dan MySQL (Pastikan port ada di angka 3306)
4. Buka `http://localhost/phpmyadmin` → tab SQL → paste isi `database.sql` → Go
5. Ubah `.env.example` → rename jadi `.env`
6. Buka terminal di folder project (gunakan **Command Prompt** berada di tombol v sebelah powershell lalu pilih yang **Command Prompt**, jangan menggunakan PowerShell) lalu ketik :
npm install, (jika npm sudah terinstall selanjut nya ketik)
npm run dev

7. Buka browser: `http://localhost:3000`
8. Klik "Buat akun baru" untuk membuat akun pertama

# Jika ingin menjalankan ulang kembali website SCHOMIS
Karena sebelum nya SCHOMIS anda sudah di masukan ke PhpMyAdmin maka cukup perlu melakukan :
1. Cukup menyalakan XAMPP Control Panel → Start MySQL
2. Lalu ketik di terminal **Command Prompt** npm run dev
3. Buka browser dan akses:
http://localhost:3000

## Troubleshooting

**Jika npm error "running scripts is disabled"**
→ Gunakan **Command Prompt**, bukan PowerShell.

**Jika "Terjadi kesalahan server"**
→ MySQL belum menyala. Ulangi langkah 3.

**Jika `npm run dev` error EADDRINUSE**
→ Jalankan: `taskkill /F /IM node.exe`, lalu ulangi langkah 6.
