const express = require('express');
const router = express.Router();
const inicioController = require('../controllers/alumno/inicio');
const { isLoggedIn, guardarAlumno, redirigirAlumno } = require('../authMiddleware');

// obtiene gestion de carga de img de los consejeros
const { upload } = require('../config/cloudinaryConfig');


// ruta protegida para usuarios autenticados
router.get('/', isLoggedIn, guardarAlumno, redirigirAlumno, inicioController.renderInicio);

// muestra vista previa al inicio para que alumno ingrese carrera y jornada
router.get('/carrera-jornada', inicioController.renderCarreraJornada);

// obtiene datos del alumno (carrera y jornada)
router.post('/carrera-jornada', inicioController.carreraJornadaAlumno);

// ruta muestra vista de consejeros postulantes (alumno debe haber iniciado sesion)
router.get('/postulantes', isLoggedIn, inicioController.renderPostulantes);

// ruta muestra vista para emitir voto del alumno (alumno debe haber iniciado sesion)
router.get('/votar', isLoggedIn, inicioController.renderVoto);

// ruta que ejecuta el voto del alumno
router.post('/votar', isLoggedIn, inicioController.emitirVoto);

// ruta que muestra por pantalla, vista seguimiendo de votos
router.get('/resultados', isLoggedIn, inicioController.renderResultados);

// faltan rutas postular y seguimiento
router.get('/postular', isLoggedIn, inicioController.renderPostularse);

// ruta para realizar la postulacion
router.post('/postular', isLoggedIn, upload.single('photo'), inicioController.postular);


// ruta para visualizar los consejeros que le corresponden al alumno que está logeado
router.get('/consejeros-electos', isLoggedIn, inicioController.consejerosElectos);


module.exports = router;

