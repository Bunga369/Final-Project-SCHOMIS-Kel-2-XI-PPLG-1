const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

router.post('/register', async (req, res) => {
    try {
        const { nama, email, username, password } = req.body;

        if (!nama || !email || !username || !password) {
            return res.status(400).json({ message: 'Semua field harus diisi.' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM admin WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username atau email sudah dipakai.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO admin (nama, email, username, password) VALUES (?, ?, ?, ?)',
            [nama, email, username, hashedPassword]
        );

        req.session.userId = result.insertId;
        req.session.nama = nama;
        req.session.username = username;

        return res.status(201).json({ message: 'Akun berhasil dibuat.', nama });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi.' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const user = rows[0];
        const cocok = await bcrypt.compare(password, user.password);

        if (!cocok) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        req.session.userId = user.id;
        req.session.nama = user.nama;
        req.session.username = user.username;

        return res.status(200).json({ message: 'Login berhasil', nama: user.nama });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal logout.' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout berhasil.' });
    });
});

router.post('/verifikasi-akun', async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username dan email harus diisi.' });
        }

        const [rows] = await pool.query(
            'SELECT id FROM admin WHERE username = ? AND email = ?',
            [username, email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Username dan email tidak cocok dengan data yang terdaftar.' });
        }

        return res.status(200).json({ message: 'Verifikasi berhasil.', userId: rows[0].id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { userId, passwordBaru } = req.body;

        if (!userId || !passwordBaru) {
            return res.status(400).json({ message: 'Data tidak lengkap.' });
        }

        if (passwordBaru.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter.' });
        }

        const hashedPassword = await bcrypt.hash(passwordBaru, 10);

        await pool.query('UPDATE admin SET password = ? WHERE id = ?', [hashedPassword, userId]);

        return res.status(200).json({ message: 'Password berhasil diubah.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        return res.status(200).json({
            loggedIn: true,
            nama: req.session.nama,
            username: req.session.username,
        });
    }
    return res.status(200).json({ loggedIn: false });
});

module.exports = router;