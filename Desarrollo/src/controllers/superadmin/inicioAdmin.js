const Usuario = require('../../models/usuario');
const Carrera = require('../../models/carrera');
const Escuela = require('../../models/escuela');
const Votacion = require('../../models/votacion');
const Consejero = require('../../models/consejero');
const Jornada = require('../../models/jornada');

const { Op } = require('sequelize');

const { enviarCorreo } = require('../../config/nodeMailer');


// muestra por pantalla pagina de inicio superadmin
module.exports.renderInicioSuperadmin = (req, res) => {
    res.render('admin/home-admin');
}


// muestra la vista de registro de administradores
module.exports.renderRegister = async (req, res) => {

    try {

        // obtiene todas las carreras de la base de datos
        const escuelas = await Escuela.findAll();

        res.render('admin/register', { escuelas });

    } catch (e) {
        res.redirect('/inicioAdmin/register');
    }
}


// registra a un director en DB
module.exports.register = async (req, res) => {

    try {


        // obtenemos los datos del usuario registrado mediante el formulario de registro
        const { email, escuela } = req.body;

        // verificamos si el usuario ya existe mediante el correo y el nombre de usuario
        const usuarioExiste = await Usuario.findOne({
            where: { correo: email }
        })


        if (usuarioExiste) {
            console.log('Usuario ya existe');
            req.flash('error', 'Director ya existe');
            return res.redirect('/inicioAdmin/register'); 
        }


        const asuntoDirector = 'Ha sido inscrito al Sistema de Votación de Consejeros como Director de Carrera';
        const contenidoDirector = '<3>Estimado(a) Director(a), </h3>'
            + '<br>'
            + 'Le informamos que el equipo de votación Duoc UC lo ha agregado al sistema de votación como Director de Carrera.'
            + '<br>'
            + 'Debe ingresar con sus credenciales de Duoc en el siguiente <a href="localhost:3000/auth">link</a> en donde podrá gestionar las votaciones, así como también los candidatos.'
            + '<br>'
            + '<Atentamente equipo votaciones Duoc UC.>';


        // si no hay errores, entonces cramos y guardamos al usuario en la DB
        const nuevoUsuario = await Usuario.create({
            correo: email,
            rolId: 3, // rol de director (segun tabla rol) 
            escuelaId: escuela
        })
            .then((usuario) => {

                enviarCorreo(email, asuntoDirector, contenidoDirector);
                req.flash('success', 'Director ha sido creado exitosamente');
                res.redirect('/inicioAdmin/register');

            })
            .catch((err) => {
                req.flash('error', `Error al crear director: ${err.message}`);
                return res.redirect('/inicioAdmin/register');
            })


    } catch (e) {
        req.flash('error', `Error al crear director: ${err.message}`);
        res.redirect('/inicioAdmin/register');
    }

}


// obtiene todos los administradores de la DB
module.exports.getAllAdmin = async (req, res) => {

    try {

        // genera la consulta de todos los admins a la base de datos
        const admins = await Usuario.findAll({
            where: { rolId: 3, nombre: { [Op.ne]: null } }, // verifica que el rol del usuario sea Director (id 3)
            include: [
                {
                    model: Escuela,
                    required: true // indica INNER JOIN
                }
            ]
        });

        // obtiene todas las carreras de la base de datos 
        const escuelas = await Escuela.findAll();

        // despliega la vista index con todos los resultados de los admins
        res.render('admin/list-director', { admins, escuelas });

    } catch (e) {
        res.redirect('/inicioAdmin/administradores');
    }
}

// elimina un director seleccionado
module.exports.eliminarDirector = async (req, res) => {
    try {

        // obtiene id del consejero que se va a eliminar
        const { id } = req.params;

        // elimina el consejero de la DB
        const directorEliminado = await Usuario.destroy({
            where: { id: id }
        })
            .then(() => {
                console.log('Director eliminado exitosamente.');
            })
            .catch((error) => {
                req.flash('error', `Error al eliminar director: ${error.message}`);
                res.redirect('/inicioAdmin/administradores');
            })

        req.flash('success', 'Director eliminado exitosamente')
        res.redirect('/inicioAdmin/administradores');

    } catch (error) {
        req.flash('error', `Error al eliminar director: ${error.message}`);
        res.redirect('/inicioAdmin/administradores');
    }
}




// obtiene todas las votaciones
module.exports.getAllVotaciones = async (req, res) => {

    try {

        // obtiene todas las carreras
        const carreras = await Carrera.findAll();

        // obtiene todas las votaciones (incluyendo carrera y encargado de la votacion)
        const votaciones = await Votacion.findAll({
            include: [
                {
                    model: Carrera,
                    required: true // indica INNER JOIN
                }
            ]
        });

        // muestra por pantalla el listado de las votaciones, con un filtro por carrera
        res.render('admin/list-votaciones', { carreras, votaciones });


    } catch (error) {
        console.log('Error al obtener todas las votaciones: ', error);
        res.redirect('/inicioAdmin/votaciones');
    }

}

// eliminar una votacion seleccionado
module.exports.eliminarVotacion = async (req, res) => {
    try {

        // obtiene id del consejero que se va a eliminar
        const { id } = req.params;

        // elimina el consejero de la DB
        const votacionEliminada = await Votacion.destroy({
            where: { id: id }
        })
            .then(() => {
                console.log('Votacion eliminada exitosamente');
            })
            .catch((error) => {
                req.flash(`Error, la votación seleccionada no ha podido ser eliminada: ${error.message}`);
                res.redirect('/inicioAdmin/votaciones');
            })

        req.flash('success', 'Votación eliminada exitosamente');
        res.redirect('/inicioAdmin/votaciones');

    } catch (error) {
        req.flash(`La votación seleccionada no ha podido ser eliminada: ${error.message}`);
        res.redirect('/inicioAdmin/votaciones');
    }
}




// obtiene todos los consejeros
module.exports.getAllConsejeros = async (req, res) => {

    try {

        // obtiene todas las carreras
        const carreras = await Carrera.findAll();

        // obtiene a todos los consejeros
        const consejeros = await Consejero.findAll({
            include: [
                {
                    model: Carrera,
                    required: true // indica INNER JOIN
                },
                {
                    model: Jornada,
                    required: true // indica INNER JOIN
                },
                {
                    model: Votacion,
                    required: true
                }
            ]
        });


        res.render('admin/list-consejeros', { carreras, consejeros });

    } catch (error) {
        res.redirect('/inicioAdmin/consejeros');
    }

}


// elimina un consejero seleccionado
module.exports.eliminarConsejero = async (req, res) => {
    try {

        // obtiene id del consejero que se va a eliminar
        const { id } = req.params;

        // elimina el consejero de la DB
        const consejeroEliminado = await Consejero.destroy({
            where: { id: id }
        })
            .then(() => {
                console.log('Consejero eliminado exitosamente');
            })
            .catch(error => {
                req.flash('error', `Error, el consejero seleccionado no ha podido ser eliminado: ${error.message}`);
                res.redirect('/inicioAdmin/consejeros');
            })

        req.flash('success', 'Consejero eliminado exitosamente');
        res.redirect('/inicioAdmin/consejeros');

    } catch (error) {
        req.flash('error', `Error, el consejero seleccionado no ha podido ser eliminado: ${error.message}`);
        res.redirect('/inicioAdmin/consejeros');
    }
}
