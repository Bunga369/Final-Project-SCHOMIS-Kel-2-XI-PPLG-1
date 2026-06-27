function cekLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/login.html');
}

function cekLoginAPI(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Sesi login berakhir, silakan login kembali.' });
}

module.exports = { cekLogin, cekLoginAPI };
