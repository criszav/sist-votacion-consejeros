// inicializando modelos, base de datos
const initModel = require('./models/initModel');
const { conexionDB, sequelize } = require('./config/db');

const seedSuperadmin = require('./seed/seedSuperadmin');


// Genera conexion a DB
conexionDB();

// Inicializa los modelos de DB
initModel();

// sincronizacion de modelos con la base de datos
sequelize.sync()
    
    .then(() => {

        // crea usuario superadmin en DB al momento de crear y poblar tablas
        seedSuperadmin.seedSuperadmin('Cristian', 'Zavala', 'cr.zavala@duocuc.cl');
        console.log('Usuario Superadmin ha sido insertado');

    })
    .then(() => {

        console.log('Base de datos sincronizada exitosamente');

    })
    .catch((error) => {

        // captura error si existe algun al poblar base de datos
        console.log("Error al sincronizar DB: ", error);
        // termina el proceso con codigo de error
        process.exit(1);
        
    })