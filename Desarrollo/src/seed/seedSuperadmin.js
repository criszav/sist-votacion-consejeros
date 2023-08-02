const Usuario = require('../models/usuario');


module.exports.seedSuperadmin = async (nombre, apellido, email) => {

    try {

        // Inserta usuario superadmin con clave hasheada
        const superadmin = await Usuario.findOrCreate({
            where: { correo: email },
            defaults: {
                nombre: nombre,
                apellido: apellido,
                correo: email
            }
        });

    } catch (error) {
        console.log('Error al insertar superadmin: ', error);
    }

}