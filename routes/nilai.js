const express = require('express');
const router = express.Router();
const pool = require('../db');

//Bagian ubah kkm
const KKM = 79;

router.get('/mapel', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM mata_pelajaran ORDER BY id ASC');
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.post('/mapel', async (req, res) => {
    try {
        const { nama_mapel } = req.body;
        if (!nama_mapel) {
            return res.status(400).json({ message: 'Nama mata pelajaran wajib diisi.' });
        }

        const [existing] = await pool.query('SELECT id FROM mata_pelajaran WHERE nama_mapel = ?', [nama_mapel]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Mata pelajaran sudah ada.' });
        }

        await pool.query('INSERT INTO mata_pelajaran (nama_mapel) VALUES (?)', [nama_mapel]);
        return res.status(201).json({ message: 'Mata pelajaran berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.get('/kelas/:kelasId', async (req, res) => {
    try {
        const [mapel] = await pool.query('SELECT * FROM mata_pelajaran ORDER BY id ASC');

        const [siswaRows] = await pool.query(`
            SELECT s.id AS siswa_id, s.nis, s.nama
            FROM siswa s
            WHERE s.kelas_id = ?
            ORDER BY s.nis ASC
        `, [req.params.kelasId]);

        const [nilaiRows] = await pool.query(`
            SELECT n.siswa_id, n.mapel_id, n.nilai
            FROM nilai n
            INNER JOIN siswa s ON s.id = n.siswa_id
            WHERE s.kelas_id = ?
        `, [req.params.kelasId]);

        const data = siswaRows.map((s) => {
            const nilaiSiswa = {};
            let total = 0;

            mapel.forEach((m) => {
                const found = nilaiRows.find((n) => n.siswa_id === s.siswa_id && n.mapel_id === m.id);
                const val = found ? Number(found.nilai) : 0;
                nilaiSiswa[m.id] = val;
                total += val;
            });

            const rata_rata = mapel.length > 0 ? Math.round((total / mapel.length) * 100) / 100 : 0;

            return { ...s, nilai: nilaiSiswa, rata_rata };
        });

        return res.status(200).json({ mapel, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.put('/:siswaId', async (req, res) => {
    try {
        const { nilai } = req.body;
        const siswaId = req.params.siswaId;

        if (!nilai || typeof nilai !== 'object') {
            return res.status(400).json({ message: 'Data nilai tidak valid.' });
        }

        for (const [mapelId, val] of Object.entries(nilai)) {
            await pool.query(`
                INSERT INTO nilai (siswa_id, mapel_id, nilai)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE nilai = ?
            `, [siswaId, mapelId, val, val]);
        }

        return res.status(200).json({ message: 'Nilai berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

router.get('/kelas/:kelasId/kenaikan', async (req, res) => {
    try {
        const [mapel] = await pool.query('SELECT * FROM mata_pelajaran ORDER BY id ASC');

        const [siswaRows] = await pool.query(`
            SELECT s.id AS siswa_id, s.nis, s.nama
            FROM siswa s
            WHERE s.kelas_id = ?
            ORDER BY s.nis ASC
        `, [req.params.kelasId]);

        const [nilaiRows] = await pool.query(`
            SELECT n.siswa_id, n.mapel_id, n.nilai
            FROM nilai n
            INNER JOIN siswa s ON s.id = n.siswa_id
            WHERE s.kelas_id = ?
        `, [req.params.kelasId]);

        const data = siswaRows.map((s) => {
            let total = 0;
            mapel.forEach((m) => {
                const found = nilaiRows.find((n) => n.siswa_id === s.siswa_id && n.mapel_id === m.id);
                total += found ? Number(found.nilai) : 0;
            });

            const rata_rata = mapel.length > 0 ? Math.round((total / mapel.length) * 100) / 100 : 0;

            return {
                siswa_id: s.siswa_id,
                nis: s.nis,
                nama: s.nama,
                nilai_rata_rata: rata_rata,
                status_kenaikan: rata_rata >= KKM ? 'Lulus' : 'Tidak Lulus',
            };
        });

        return res.status(200).json({ kkm: KKM, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;