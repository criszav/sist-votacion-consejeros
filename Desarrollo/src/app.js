
const express = require('express');
const app = express();
const methodOverride = require('method-override'); // permite enviar otras HTTP request ademas de POST y GET
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');


// configuracion archivo .env que contiene las variables de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Inicializa sincronizacion y poblamiento de base de datos (escuelas, carreras y roles)
require('./dbSync');

// importando rutas
const authRoute = require('./routes/auth'); // login 
const inicioRoute = require('./routes/inicio'); // alumno
const adminRoute = require('./routes/inicioAdmin'); // superadmin
const directorRoute = require('./routes/director'); // directores de carrera

// inicializacion estrategia de autenticación con Google
require('./services/googleAuth');


// define al motor EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method')); // especifica como vamos a pasar HTTP requests que no sean POST y GEST 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


// Configura sesiones de Express
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true,
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24, // cookie expira en 24 horas desde la fecha actual
        maxAge: 3 * 24 * 60 * 60 * 10000 // maxima duracion de la cookie es 3 dias
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());


// Configura ruta de autenticacion de alumnos
app.use('/', authRoute);

// Configura ruta de pagina de inicio para alumnos
app.use('/inicio', inicioRoute);

// Configura ruta de inicio de la vista administradores (equipo apt)
app.use('/inicioAdmin', adminRoute);

// Configura rutas de directores (agregar consejero, crear votacion)
app.use('/director', directorRoute);



// falta ruta por si hay errores en la URL 
app.get('*', (req, res) => {
    res.status(404).send('Error, página no encontrada');
})


// Inicia el servidor (puerto)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App ejecutandose en el puerto: ${port}`)
})

