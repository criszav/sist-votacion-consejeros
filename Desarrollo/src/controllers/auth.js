const passport = require('passport');

// renderizar vista login
module.exports.renderAuth = (req, res) => {
    res.render('auth');
}

// genera autenticacion por medio de google
module.exports.googleAuth = passport.authenticate('google', { scope: ['email', 'profile'] });

