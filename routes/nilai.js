// routes/nilai.js
// Endpoint untuk Akademik (Nilai) & Kenaikan Kelas:
// - GET /api/nilai/kelas/:kelasId          -> daftar nilai siswa di kelas + rata-rata otomatis
// - PUT /api/nilai/:siswaId                -> edit nilai per mapel
// - GET /api/nilai/kelas/:kelasId/kenaikan -> status kenaikan kelas berdasarkan KKM

const express = require('express');
const router = express.Router();
const pool = require('../db');
 
// Bagian buat mengubah KKM 
const KKM = 79; 

router.get('/kelas/:kelasId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.id AS siswa_id, s.nis, s.nama,
                   COALESCE(n.matematika, 0) AS matematika,
                   COALESCE(n.b_inggris, 0) AS b_inggris,
                   COALESCE(n.b_indonesia, 0) AS b_indonesia
            FROM siswa s
            LEFT JOIN nilai n ON n.siswa_id = s.id
            WHERE s.kelas_id = ?
            ORDER BY s.nis ASC
        `, [req.params.kelasId]);

        // Hitung rata-rata otomatis di kode (bukan di database),
        // supaya selalu konsisten dengan nilai mapel yang ada
        const data = rows.map((r) => {
            const rataRata = (
                (Number(r.matematika) + Number(r.b_inggris) + Number(r.b_indonesia)) / 3
            );
            return { ...r, rata_rata: Math.round(rataRata * 100) / 100 };
        });

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Edit nilai per mapel untuk 1 siswa
router.put('/:siswaId', async (req, res) => {
    try {
        const { matematika, b_inggris, b_indonesia } = req.body;
        const siswaId = req.params.siswaId;

        if (matematika === undefined || b_inggris === undefined || b_indonesia === undefined) {
            return res.status(400).json({ message: 'Semua nilai mata pelajaran harus diisi.' });
        }

        // Pakai INSERT...ON DUPLICATE supaya aman walau baris nilai belum ada
        await pool.query(`
            INSERT INTO nilai (siswa_id, matematika, b_inggris, b_indonesia)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE matematika = ?, b_inggris = ?, b_indonesia = ?
        `, [siswaId, matematika, b_inggris, b_indonesia, matematika, b_inggris, b_indonesia]);

        return res.status(200).json({ message: 'Nilai berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Data Kenaikan Kelas: status Lulus/Tidak Lulus dihitung otomatis dari rata-rata vs KKM
router.get('/kelas/:kelasId/kenaikan', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.id AS siswa_id, s.nis, s.nama,
                   COALESCE(n.matematika, 0) AS matematika,
                   COALESCE(n.b_inggris, 0) AS b_inggris,
                   COALESCE(n.b_indonesia, 0) AS b_indonesia
            FROM siswa s
            LEFT JOIN nilai n ON n.siswa_id = s.id
            WHERE s.kelas_id = ?
            ORDER BY s.nis ASC
        `, [req.params.kelasId]);

        const data = rows.map((r) => {
            const rataRata = Math.round(
                ((Number(r.matematika) + Number(r.b_inggris) + Number(r.b_indonesia)) / 3) * 100
            ) / 100;
            return {
                siswa_id: r.siswa_id,
                nis: r.nis,
                nama: r.nama,
                nilai_rata_rata: rataRata,
                status_kenaikan: rataRata >= KKM ? 'Lulus' : 'Tidak Lulus',
            };
        });

        return res.status(200).json({ kkm: KKM, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
