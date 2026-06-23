
CREATE DATABASE IF NOT EXISTS SCHOMIS;
USE SCHOMIS;


CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- disimpan dalam bentuk HASH
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    wali_kelas VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kelas_id INT NOT NULL,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin ENUM('Laki Laki', 'Perempuan') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT NOT NULL,
    tanggal DATE NOT NULL,
    status ENUM('Hadir', 'Tidak Hadir', 'Sakit', 'Izin') NOT NULL DEFAULT 'Hadir',
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
    UNIQUE KEY unik_siswa_tanggal (siswa_id, tanggal)
);


CREATE TABLE IF NOT EXISTS nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT NOT NULL UNIQUE,
    matematika DECIMAL(5,2) DEFAULT 0,
    b_inggris DECIMAL(5,2) DEFAULT 0,
    b_indonesia DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);

-- ===================================================
-- CATATAN:
-- - Rata-rata nilai dihitung otomatis di kode (Node.js),
--   bukan disimpan permanen di tabel, supaya selalu update
--   begitu nilai mapel diubah.
-- - Status Kenaikan Kelas juga dihitung otomatis berdasarkan
--   KKM = 75 (bisa diubah di kode nanti kalau perlu).
-- - Jangan insert password admin manual lewat SQL,
--   gunakan form "Buat akun baru" di aplikasi (otomatis di-hash).
-- ===================================================
