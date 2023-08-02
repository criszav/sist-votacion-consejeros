const Carrera = require("../../models/carrera");
const Consejero = require("../../models/consejero");
const Escuela = require("../../models/escuela");
const Jornada = require("../../models/jornada");
const Usuario = require("../../models/usuario");
const Votacion = require("../../models/votacion");


// muestra vista para editar director
module.exports.renderEditDirector = async (req, res) => {

    try {

        // obtiene id del director que se quiere editar
        const idDirector = req.params.id;

        // obtiene datos del director desde la DB para mostrarlos en formulario para editar director
        const directorEdit = await Usuario.findOne({
            where: { id: idDirector },
            include: [
                {
                    model: Escuela, // INNER JOIN con tabla Escuela
                    required: true
                }
            ]
        })
            .catch(error => {
                console.log('Error al obtener director desde DB', error);
            })

        // muestra por pantalla vista con formulario para editar director
        res.render('admin/editar-director', { directorEdit });

    } catch (error) {
        res.redirect('/inicioAdmin/administradores');
    }

}


// edita al director seleccionado
module.exports.editarDirector = async (req, res) => {

    try {

        // obtiene nueva informacion del director para actualizar
        const { director, nombre, apellido, correo } = req.body;

        if(!nombre){
            req.flash('error', 'Error, director no ha sido actualizado correctamente');
            return res.redirect('/inicioAdmin/administradores');
        }

        // edita al director con los nuevos datos ingresados por el superadmin
        const directorEditado = await Usuario.update({
            nombre: nombre,
            apellido: apellido,
            correo: correo
        },
            {
                where: { id: director }
            })
            .then(() => {
                console.log('Director editado exitosamente');
            })
            .catch((error) => {
                req.flash('error', 'Error, director no ha sido actualizado correctamente');
                res.redirect('/inicioAdmin/administradores');
            })

        req.flash('success', 'Director editado exitosamente');
        res.redirect('/inicioAdmin/administradores');

    } catch (error) {
        req.flash('error', 'Error, director no ha sido actualizado correctamente');
        res.redirect('/inicioAdmin/administradores');
    }

}


// muestra por pantalla vista para editar consejero rellenado con campos existentes
module.exports.renderEditConsejero = async (req, res) => {

    try {

        // obtiene id del consejero que se va a editar
        const idConsejero = req.params.id;

        // obtener datos del consejero a editar desde DB
        const consejeroEdit = await Consejero.findOne({
            where: { id: idConsejero },
            include: [
                {
                    model: Carrera, // INNER JOIN con tabla Carrera
                    required: true
                },
                {
                    model: Jornada, // INNER JOIN con tabla Jornada
                    required: true
                },
                {
                    model: Votacion, // INNER JOIN con tabla Votacion
                    required: true
                }
            ]
        })
            .catch(err => {
                console.log('Consejero no encontrado en base de datos: ', err);
            })


        res.render('admin/editar-consejero', { consejeroEdit });


    } catch (error) {
        res.redirect('/inicioAdmin/consejeros');
    }

}


// actualiza al consejero con los nuevos datos ingresados
module.exports.editarConsejero = async (req, res) => {

    try {

        // obtiene nueva informacion del consejero para actualizar 
        const { consejero, nombre, apellido, correo, telefono } = req.body;

        if(!nombre || !apellido || !correo || !telefono) {
            req.flash('error', 'Error, consejero no ha sido actualizado correctamente');
            return res.redirect('/inicioAdmin/consejeros');
        }

        // edita al consejero en la base de datos
        const consejeroEdit = await Consejero.update({
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            telefono: telefono
        },
            {
                where: { id: consejero }
            }
        )
            .then(resultados => {
                console.log('Consejero editado exitosamente: ', resultados)
            })
            .catch(error => {
                req.flash('error', 'Error, consejero no ha sido actualizado correctamente');
                res.redirect('/inicioAdmin/consejeros');
            })

        req.flash('success', 'Consejero editado exitosamente');
        res.redirect('/inicioAdmin/consejeros');


    } catch (error) {
        req.flash('error', 'Error, consejero no ha sido actualizado correctamente');
        res.redirect('/inicioAdmin/consejeros');
    }

}


// muestra vista para editar votacion
module.exports.renderEditVotacion = async (req, res) => {

    try {

        // obtiene todas las carreras
        const carreras = await Carrera.findAll();

        // obtiene id del consejero que se va a editar
        const idVotacion = req.params.id;


        // obtener datos del consejero a editar desde DB
        const votacionEdit = await Votacion.findOne({
            where: { id: idVotacion },
            include: [
                {
                    model: Carrera, // INNER JOIN con tabla Carrera
                    required: true
                }
            ]
        })
            .catch(err => {
                console.log('Votacion no encontrada en base de datos: ', err);
            })

        res.render('admin/editar-votacion', { votacionEdit, carreras });


    } catch (error) {
        res.redirect('/inicioAdmin/votaciones');
    }

}


// edita la votacion en DB
module.exports.editarVotacion = async (req, res) => {

    try {


        // obtiene nueva informacion del director para actualizar
        const { votacion, nombre_votacion } = req.body;

        const fecha_termino = req.body.end_date;

        if (!fecha_termino) {
            req.flash('error', 'Error, votación no ha sido actualizada correctamente');
            return res.redirect('/inicioAdmin/votaciones');
        }

    


        // edita al director con los nuevos datos ingresados por el superadmin
        const votacionEditada = await Votacion.update({
            nombreVotacion: nombre_votacion,
            fecha_termino: fecha_termino
        },
            {
                where: { id: votacion }
            })
            .then(() => {
                console.log('Votacion editada exitosamente');
            })
            .catch((error) => {
                console.log('Error al actualizar votación en la base de datos: ', error);
                req.flash('error', 'Error, votación no ha sido actualizada correctamente');
                res.redirect('/inicioAdmin/votaciones');
            })

        req.flash('success', 'Votación editada exitosamente');
        res.redirect('/inicioAdmin/votaciones');

    } catch (error) {
        req.flash('error', 'Error, votación no ha sido actualizada correctamente');
        res.redirect('/inicioAdmin/votaciones');
    }

}