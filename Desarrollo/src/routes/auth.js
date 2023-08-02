const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isLoggedIn } = require('../authMiddleware');
const { authRolRedirect } = require('../rolMiddleware');

const passport = require('passport');


// renderizar vista login
router.get('/auth', authController.renderAuth);

// login con google (correo institucional)
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', passport.authenticate('google',
    { failureRedirect: '/auth' }),
    authRolRedirect // redirige al perfil que le corresponde a quien esta iniciando sesion
);



// ruta logout para cerrar sesion del alumno
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy();
        res.redirect('https://accounts.google.com/Logout');
    });
});



module.exports = router;