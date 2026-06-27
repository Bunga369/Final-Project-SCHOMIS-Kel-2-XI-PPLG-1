require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const kelasRoutes = require('./routes/kelas');
const siswaRoutes = require('./routes/siswa');
const nilaiRoutes = require('./routes/nilai');
const { cekLogin, cekLoginAPI } = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, 
    },
}));

app.use('/api', authRoutes);
app.use('/api/kelas', cekLoginAPI, kelasRoutes);
app.use('/api/siswa', cekLoginAPI, siswaRoutes);
app.use('/api/nilai', cekLoginAPI, nilaiRoutes);

const halamanTerlindungi = [
    '/manajemen-kelas.html',
    '/manajemen-siswa.html',
    '/akademik.html',
    '/kenaikan-kelas.html',
];

halamanTerlindungi.forEach((halaman) => {
    app.get(halaman, cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', halaman));
    });
});

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.redirect('/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
