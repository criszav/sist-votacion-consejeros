const express = require('express');
const router = express.Router();
const directorController = require('../controllers/director/director');
const rolMiddleware = require('../rolMiddleware');
const { isLoggedIn, guardarDirector } = require('../authMiddleware');

// obtiene gestion de carga de img de los consejeros
const { upload } = require('../config/cloudinaryConfig');


// muestra por pantalla vista de inicio de directores
router.get('/', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.renderInicioDirector); //ya no existe



// muestra por pantalla la vista para ingresar un consejero
router.get('/registro-consejero', isLoggedIn, guardarDirector, rolMiddleware.rolRequerido('director'), directorController.renderRegistroConsejero); //ya no existe

// registra un consejero en el sistema (candidato)
router.post('/registro-consejero', isLoggedIn, upload.single('photo'), directorController.registrarConsejero); //ya no existe



// muestra por pantalla vista para crear una votacion
router.get('/crear-votacion', isLoggedIn, guardarDirector, rolMiddleware.rolRequerido('director'), directorController.renderCrearVotacion);

// registra una nueva votacion
router.post('/crear-votacion', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.crearVotacion);



// obtiene todos los consejeros de carrera
router.get('/consejeros', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.getAllConsejeros);

// muestra por pantalla formulario para editar un consejero
router.get('/consejeros/:id/editar', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.renderEditarConsejero);


// obtiene los nuevos datos y edita un consejero
router.put('/consejeros', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.editarConsejero);


// elimina un consejero
router.delete('/consejeros/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.eliminarConsejero);



// obtiene el listado de votaciones para director segun su escuela
router.get('/votaciones', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.getAllVotaciones);



// obtiene todas las postulaciones que corresponden a carreras de la escuela del director
router.get('/postulaciones', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.getAllPostulaciones);

// redirige a vista de postulacion especifica seleccionada por el director
router.get('/postulaciones/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.verPostulacion);

// ruta para cambiar el campo 'postulacion_aceptada' a true en DB cuando director presione boton de 'aceptar postulacion'
router.post('/postulaciones/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.definirPostulacion);

// ruta para cambiar el campo 'postulacion_aceptada' a true en DB cuando director presione boton de 'aceptar postulacion'
router.delete('/postulaciones/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.rechazarPostulacion);

// ruta para mostrar votaciones finalizadas 
router.get('/fin-votacion', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.renderVotacionesFinalizadas);

// ruta visualizar votacion seleccionada
router.get('/fin-votacion/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.renderVotacionSeleccionada);

// ruta para envio de resultados por parte del director
router.post('/fin-votacion/:id', isLoggedIn, rolMiddleware.rolRequerido('director'), directorController.enviarResultados);


module.exports = router;