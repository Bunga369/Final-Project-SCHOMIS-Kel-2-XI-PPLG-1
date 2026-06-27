const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT k.id, k.nama_kelas, k.wali_kelas,
                   COUNT(s.id) AS jumlah_siswa
            FROM kelas k
            LEFT JOIN siswa s ON s.kelas_id = k.id
            GROUP BY k.id, k.nama_kelas, k.wali_kelas
            ORDER BY k.nama_kelas ASC
        `);
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kelas WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nama_kelas, wali_kelas } = req.body;
        if (!nama_kelas || !wali_kelas) {
            return res.status(400).json({ message: 'Nama kelas dan wali kelas harus diisi.' });
        }
        const [result] = await pool.query(
            'INSERT INTO kelas (nama_kelas, wali_kelas) VALUES (?, ?)',
            [nama_kelas, wali_kelas]
        );
        return res.status(201).json({ message: 'Kelas berhasil ditambahkan.', id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { nama_kelas, wali_kelas } = req.body;
        if (!nama_kelas || !wali_kelas) {
            return res.status(400).json({ message: 'Nama kelas dan wali kelas harus diisi.' });
        }
        await pool.query(
            'UPDATE kelas SET nama_kelas = ?, wali_kelas = ? WHERE id = ?',
            [nama_kelas, wali_kelas, req.params.id]
        );
        return res.status(200).json({ message: 'Kelas berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM kelas WHERE id = ?', [req.params.id]);
        return res.status(200).json({ message: 'Kelas berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
