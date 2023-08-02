const express = require('express');
const router = express.Router();
const adminController = require('../controllers/superadmin/inicioAdmin');
const adminEditarController = require('../controllers/superadmin/editar');
const rolMiddleware = require('../rolMiddleware');
const { isLoggedIn, guardarSuperadmin } = require('../authMiddleware');

// ruta de pagina de inicio de los superadmin
router.get('/', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.renderInicioSuperadmin);


// obtiene vista de registro de directores y la muestra por pantalla
router.get('/register', isLoggedIn, guardarSuperadmin, rolMiddleware.rolRequerido('superadmin'), adminController.renderRegister);

// ruta para registrar un nuevo admin
router.post('/register', isLoggedIn, adminController.register);


// ruta para obtener todos los administradores 
router.get('/administradores', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.getAllAdmin); 

// ruta para ejecutar la edicion de un director en la DB
router.get('/administradores/:id/editar', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.renderEditDirector);

// ruta para mostrar vista para editar un director
router.put('/administradores', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.editarDirector);

// ruta para eliminar un director del sistema
router.delete('/administradores/:id', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.eliminarDirector);




// ruta para obtener todas las votaciones
router.get('/votaciones', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.getAllVotaciones);

// ruta para mostrar vista para editar una votacion
router.get('/votaciones/:id/editar', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.renderEditVotacion);

// ruta para editar los datos del consejero desde rol superadmin
router.put('/votaciones', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.editarVotacion);

// ruta para eliminar una votacion del sistema
router.delete('/votaciones/:id', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.eliminarVotacion);




// ruta para obtener todos los consejeros
router.get('/consejeros', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.getAllConsejeros);

// ruta para mostrar vista para editar un consejero
router.get('/consejeros/:id/editar', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.renderEditConsejero);

// ruta para editar los datos del consejero desde rol superadmin
router.put('/consejeros', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminEditarController.editarConsejero);

// ruta para eliminar un consejero del sistema
router.delete('/consejeros/:id', isLoggedIn, rolMiddleware.rolRequerido('superadmin'), adminController.eliminarConsejero);





module.exports = router;