const Consejero = require('../../models/consejero');
const Votacion = require('../../models/votacion');
const Carrera = require('../../models/carrera');
const Jornada = require('../../models/jornada');
const Usuario = require('../../models/usuario');
const Alumno = require('../../models/alumno');

// obtiene configuracion de cloudinary para cargar img a la nube de Cloudinary
const { cloudinary } = require('../../config/cloudinaryConfig');

const { sequelize } = require('../../config/db');

const { enviarCorreo } = require('../../config/nodeMailer');

// obtiene fecha actual del sistema
const { fechaActualSys } = require('../../services/obtenerFechaActual');


module.exports.renderInicioDirector = (req, res) => {
    res.render('director/home-director');
}

// muestra por pantalla la vista para ingresar un nuevo consejero
module.exports.renderRegistroConsejero = async (req, res) => {

    try {

        // obtiene Google.id del director quee sta logeado
        const { id } = req.user;

        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: id },
            attributes: ['escuelaId']
        });

        const idEscuelaDirector = escuelaDirector.escuelaId;

        // obtiene las carreras que pertenecen a la escuela del director
        const carreras = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }
        })


        // obtiene el id de las carreras que pertenecen a la escuela del director
        const carrerasVotacion = carreras.map(carrera => carrera.dataValues.id);

        // obtener las votaciones filtrado segun carrera
        const votaciones = await Votacion.findAll({
            where: {
                carreraId: carrerasVotacion
            }
        });

        // obtener las jornadas 
        const jornadas = await Jornada.findAll();

        res.render('director/registro-consejero', { carreras, votaciones, jornadas });

    } catch (error) {
        res.redirect('/director/register');
    }

}


module.exports.registrarConsejero = async (req, res) => {

    try {

        // obtiene los datos del consejero ingresado
        const { name, last_name, email, phone, carrera, votacion, jornada } = req.body;

        // busca en la base de datos el consejero que se sta intentando crear   
        const existeConsejero = await Consejero.findOne({ where: { correo: email } });

        // verifica si el consejero ya existe y envía mensaje y codigo de error, si es el caso
        if (existeConsejero) {
            req.flash('error', 'Consejero ya existe');
            res.redirect('/director/register');
        }

        // inserta un nuevo consejero si es que este no existe 
        const nuevoConsejero = await Consejero.create({
            nombre: name,
            apellido: last_name,
            correo: email,
            telefono: phone,
            electo: false,
            urlImg: '', // url vacia momentaneamente hasta subir img a Cloudinary, luego se actualiza con url de img subida
            carreraId: carrera,
            votacionId: votacion,
            jornadaId: jornada,
        })
            .then((consejero) => {

                // carga imagen de consejero a Cloudinary
                cloudinary.uploader.upload(req.file.path, (error, result) => {

                    // captura error al subir img a nube Cloudinary
                    if (error) {
                        req.flash('error', 'No se ha podida guardar la imagen. Intenta nuevamente.');
                        console.log('Error al cargar imagen: ', error);

                    } else {

                        // actualiza url de img del consejero registrado previamente
                        consejero.urlImg = result.secure_url;

                        // guarda los cmabios en url de img en DB
                        consejero.save();

                        req.flash('success', 'Consejero ha sido registrado con éxito');
                        res.redirect('/director/registro-consejero');
                    }

                })
            })
            .catch((error) => {
                res.redirect('/director/register');
            })



    } catch (e) {
        res.redirect('/director/register');
    }

}


// obtiene todos los consejeros de carrera
module.exports.getAllConsejeros = async (req, res) => {

    try {

        // obtiene Google.id del director quee sta logeado
        const { id } = req.user;

        // obtiene director que esta logeado
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: id },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;

        // obtiene carreras que pertenecen a la escuela del director
        const carrerasEscuelaDirector = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }
        })

        const carrerasDirector = carrerasEscuelaDirector.map(carrera => carrera.dataValues.id);

        // obtiene votaciones de las carreras del director logeado
        const votacionesDirector = await Votacion.findAll({
            where: { carreraId: carrerasDirector }
        })


        // obtiene todos los consejeros de la DB (join con tabla Carrera y Jornada)
        const consejeros = await Consejero.findAll({
            where: {
                // verifica que el id de la carrera del consejero
                // corresponda con alguno de los id de las carreras de la escuela del director
                carreraId: carrerasDirector,
                // obtiene a los consejeros cuya postulacion fue aceptada por el director de su carrera
                postulacionAceptada: true // verificar si el true es asi o va con comillas simples 'true'
            },
            include: [
                {
                    model: Carrera,
                    required: true
                },
                {
                    model: Jornada,
                    required: true
                }
            ]
        });


        // muestra por pantalla vista con lista de consejeros
        res.render('director/list-consejeros', { consejeros, carrerasEscuelaDirector, votacionesDirector });

    } catch (e) {
        res.redirect('/director/consejeros');
    }

}


// muestra por pantalla vista con formulario para crear votacion
module.exports.renderCrearVotacion = async (req, res) => {

    try {

        // obtiene Google.id del director quee sta logeado
        const { id } = req.user;


        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: id },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;

        // obtiene todas las carreras de la DB
        const carreras = await Carrera.findAll({
            where: {
                escuelaId: idEscuelaDirector
            }
        });

        const consejerosPostulantes = await Consejero.findAll(); 

        res.render('director/registro-votacion', { carreras, consejerosPostulantes });

    } catch (e) {
        res.redirect('/director/crear-votacion');
    }
}


// registrar una votacion
module.exports.crearVotacion = async (req, res) => {

    try {

        console.log(req);

        // obtiene los datos de la votacion creada
        const { nombre_votacion, start_date, end_date, carrera } = req.body;

        // obtiene id del director que crea una votacion
        const idDirector = req.user.id;

        if (!carrera) {
            req.flash('error', 'Error, no se ha podido crear la votación. Intente nuevamente.');
            return res.redirect('/director/crear-votacion');
        }

        const votacionExiste = await Votacion.findOne({
            where: { carreraId: carrera }
        });

        if (votacionExiste) {
            req.flash('error', 'Ya existe una votación para esta carrera.');
             return res.redirect('/director/crear-votacion');
        }

        // inserta un nuevo consejero si es que este no existe 
        const nuevaVotacion = await Votacion.create({
            nombreVotacion: nombre_votacion,
            fecha_inicio: start_date,
            fecha_termino: end_date,
            carreraId: carrera,
            idPerfilUsuario: idDirector,
            activa: true
        })

        req.flash('success', 'Votación creada con éxito. Ahora puedes agregar candidatos a esta votación.');
        res.redirect('/director/crear-votacion');


    } catch (e) {
        console.log('Error al crear una nueva votacion: ', e);
        req.flash('error', 'Error, no se ha podido crear la votación. Intente nuevamente.');
        res.redirect('/director/crear-votacion');
    }

}


// Obtiene todas las votaciones
module.exports.getAllVotaciones = async (req, res) => {

    try {

        // obtiene Google.id del director que esta logeado
        const { id } = req.user;


        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: id },
            attributes: ['escuelaId']
        });

        console.log('escuelaDirector: ', escuelaDirector);

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;



        // obtiene todas las carreras registradas que pertenecen a la escuela del director
        const carreras = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }

        });

        const carrerasDirector = carreras.map(carrera => carrera.dataValues.id);

        // obtiene todas las votaciones registradas
        const votaciones = await Votacion.findAll({
            where: { carreraId: carrerasDirector },
            include: [
                {
                    model: Carrera,
                    required: true // indica INNER JOIN
                }
            ]
        });

        res.render('director/list-votaciones', { carreras, votaciones });

    } catch (e) {
        res.redirect('/director/votaciones');
    }

}


// muestra por pantalla el formulario para editar un consejero
module.exports.renderEditarConsejero = async (req, res) => {

    try {

        // obtener id del consejero que se quiere edirar
        const { id } = req.params;

        // obtener consejero desde DB
        const consejeroEdit = await Consejero.findOne({
            where: { id: id }
        })

        res.render('director/editarConsejero', { consejeroEdit });

    } catch (e) {
        res.redirect('/director/consejeros');
    }

}

// edita los datos de un consejero
module.exports.editarConsejero = async (req, res) => {

    try {

        // obtiene los nuevos datos ingresados por el usuario
        const { consejero, nombre, apellido, email, telefono } = req.body;

        // editar al consejero en la base de datos
        const consejeroEditado = await Consejero.update({
            nombre: nombre,
            apellido: apellido,
            correo: email,
            telefono: telefono
        },
            {
                where: { id: consejero }
            }
        )
            .then(() => {
                console.log('Consejero editado exitosamente');
            })
            .catch(error => {
                req.flash('error', 'Error, consejero no ha podido ser editado. Intente nuevamente.');
                res.redirect('/director/consejeros');
            });

        req.flash('success', 'Consejero ha sido editado exitosamente');
        res.redirect('/director/consejeros');

    } catch (e) {
        req.flash('error', 'Error, consejero no ha podido ser editado. Intente nuevamente.');
        res.redirect('/director/consejeros');
    }

}

// elimina un consejero
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
            .catch((error) => {
                req.flash('error', 'Error, no se ha podido eliminar al consejero. Intente nuevamente.');
                res.redirect('/director/consejeros');
            })

        req.flash('success', 'Consejero eliminado exitosamente');
        res.redirect('/director/consejeros');


    } catch (error) {
        req.flash('error', 'Error, no se ha podido eliminar al consejero. Intente nuevamente.');
        res.redirect('/director/consejeros');

    }

}



// ver todas las postulaciones existentes
module.exports.getAllPostulaciones = async (req, res) => {

    try {

        // obtiene Google.id del director que esta logeado
        const { id } = req.user;

        // obtiene escuela del director que esta logeado
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: id },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;

        // obtiene carreras que pertenecen a la escuela del director
        const carrerasEscuelaDirector = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }
        })

        const carrerasDirector = carrerasEscuelaDirector.map(carrera => carrera.dataValues.id);

        // obtiene a todos los postulantes cuya postulacion aun no sea aceptada
        const consejeros = await Consejero.findAll({
            where: {
                // verifica que el id de la carrera de la postulacion
                // corresponda con alguno de los id de las carreras de la escuela del director
                carreraId: carrerasDirector,
                postulacionAceptada: false
            },
            include: [
                {
                    model: Carrera,
                    required: true
                },
                {
                    model: Jornada,
                    required: true
                }
            ]
        });

        res.render('director/postulaciones', { consejeros, carrerasEscuelaDirector });

    } catch (error) {
        console.log('Error al listar todas las postulaciones: ', error);
    }

}



// ver postulacion
module.exports.verPostulacion = async (req, res) => {

    try {

        // obtiene id del consejero que esta postulando
        const { id } = req.params;

        // obtiene carrera del consejero que postuló
        const carreraPostulante = await Consejero.findOne({
            where: { id: id },
            attributes: ['carreraId']
        })

        // obtiene id de la carrera del consejero que postuló
        const idCarreraPostulante = carreraPostulante.carreraId;

        // obtiene Google.id del director que esta logeado
        const idPerfilDirector = req.user.id;


        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: idPerfilDirector },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;


        // obtiene todas las carreras registradas que pertenecen a la escuela del director
        const carreras = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }

        });

        const carrerasDirector = carreras.map(carrera => carrera.dataValues.id);

        // obtiene todas las votaciones registradas
        const votaciones = await Votacion.findAll({
            where: { carreraId: carrerasDirector },
            include: [
                {
                    model: Carrera,
                    required: true // indica INNER JOIN
                }
            ]
        });


        // obtiene votacion segun carrera del postulante que debe ser asignada, en caso de aceptar postulación
        const votacionPostulante = await Votacion.findOne({
            where: { carreraId: idCarreraPostulante }
        })


        // obtiene al consejero el cual se esta revisando su postulacion
        const consejero = await Consejero.findOne({
            where: { id: id },
            include: [
                {
                    model: Carrera, // INNER JOIN entre tabla Carrera y Consejero
                    required: true
                },
                {
                    model: Jornada, // INNER JOIN entre tabla Carrera y Jornada
                    required: true
                }
            ]
        });

        res.render('director/postulante', { consejero, votaciones, votacionPostulante });

    } catch (error) {
        console.log('Error al ver la postulacion: ', error);
    }

}


module.exports.definirPostulacion = async (req, res) => {

    try {

        // obtiene id del postulante aceptado
        const idPostulanteAceptado = req.params.id;

        // obtiene postulante aceptado
        const alumnoPostulante = await Alumno.findOne({
            where: { id: idPostulanteAceptado }
        })

        console.log('CORREO REQ.USER: ', req.user.email);
        const correoDirector = req.user.email;
        const nombreDirector = req.user.given_name;
        const apellidoDirector = req.user.family_name;


        // obtiene id de la votacion a la cual se asigno si es que su postulacion fue aceptada
        const { votacion, postulacion_aceptada, correo, name, last_name } = req.body;

        const asuntoPostulacionAceptada = '¡Tu postulación como candidato a la elección de consejeros de carrera ha sido aceptada!';

        const contenidoPostulacionAceptada = `<h3>Estimado(a) ${name} ${last_name}, </h3>`
            + '<br>'
            + '<p>Te informamos que tu postulación a la votación de consejeros de carrera ha sido aceptada exitosamente.</p>'
            + '<br>'
            + '<p>Para obtener mayor información, te recomendamos ponerte en contacto con el Director(a) de tu de carrera.</p>'
            + '<br>'
            + `<p>Correo Director(a): ${correoDirector}</p>`
            + '<br>'
            + '<p>Gracias por postular a la votación de consejeros de carrera.</p>'
            + '<br>'
            + '<p>Atentamente equipo votaciones Duoc UC.</p>';


        const postulanteAceptado = await Consejero.update({
            postulacionAceptada: postulacion_aceptada,
            votacionId: votacion
        },
            {
                where: { id: idPostulanteAceptado }
            })
            .then(() => {
                enviarCorreo(correo, asuntoPostulacionAceptada, contenidoPostulacionAceptada);
                console.log('Correo de postulacion aceptada enviado exitosamente');
            })
            .catch(error => {
                req.flash('error', 'Error al aceptar postulación');
                res.redirect('/director/postulaciones');
            })

        req.flash('success', 'Postulación ha sido aceptada exitosamente');
        res.redirect('/director/postulaciones');

    } catch (error) {
        req.flash('error', 'Error al aceptar postulación');
        console.log('Error en controlador de director "definir postulacion": ', error);
    }
}


// logica para rechazar una postulacion (elimina la postulacion)
module.exports.rechazarPostulacion = async (req, res) => {

    try {

        // obtiene id del postulante
        const { id } = req.params;

        // obtiene correo del alumno postulante
        const { correo, name, last_name } = req.body;

        // datos director de carrera
        const correoDirector = req.user.email;
        const nombreDirector = req.user.given_name;
        const apellidoDirector = req.user.family_name;


        // asunto y contenido correo postulacion rechazada
        const asuntoPostulacionRechazada = 'Tu postulación como candidato a la elección de consejeros de carrera ha sido rechazada';

        const contenidoPostulacionRechazada = `<h3>Estimado(a) ${name} ${last_name}, </h3>`
            + '<br>'
            + '<p>Te informamos que tu postulación a la votación de consejeros de carrera ha sido rechazada. '
            + '<br>'
            + '<p>Para obtener mayor información, te recomendamos ponerte en contacto con el Director(a) tu de carrera.</p>'
            + '<br>'
            + `<p>Correo Director(a): ${correoDirector}</p>`
            + '<br>'
            + '<p>Gracias por postular a la votación de consejeros de carrera.</p>'
            + '<br>'
            + '<p>Atentamente equipo votaciones Duoc UC.</p>';


        const consejeroEliminado = await Consejero.destroy({
            where: { correo: correo }
        })
            .then(() => {
                enviarCorreo(correo, asuntoPostulacionRechazada, contenidoPostulacionRechazada);
                console.log('Correo de postulacion aceptada enviado exitosamente');
            })
            .catch(error => {
                req.flash('success', 'Postulación ha sido rechazada exitosamente');
                req.flash('error', 'Error al rechazar la postulación');
            })

        req.flash('success', 'Postulación ha sido rechazada exitosamente');
        res.redirect('/director/postulaciones');

    } catch (error) {
        console.log('Error al rechazar postulacion: ', error);
    }
}


// muestra por pantalla vista de seguimiento/resultados 
module.exports.renderResultadosVotaciones = async (req, res) => {

    try {

        // obtiene Google.id del director que esta logeado
        const idPerfilDirector = req.user.id;


        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: idPerfilDirector },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;


        // obtiene todas las carreras registradas que pertenecen a la escuela del director
        const carrerasEscuelaDirector = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }
        });

        const carrerasDirector = carrerasEscuelaDirector.map(carrera => carrera.dataValues.id);


        const consultaSQL = 'SELECT'
            + ' vc.nombre_votacion,'
            + ' c.nombre,'
            + ' c.apellido,'
            + ' c.correo,'
            + ' c.url_img,'
            + ' ca.id AS id_carrera,'
            + ' COUNT(v.consejero_id) AS votos'
            + ' FROM'
            + ' consejero c'
            + ' INNER JOIN'
            + ' voto v ON c.id = v.consejero_id'
            + ' INNER JOIN'
            + ' votacion vc ON c.votacion_id = vc.id'
            + ' INNER JOIN'
            + ' carrera ca ON c.carrera_id = ca.id'
            + ' WHERE ca.id IN (' + carrerasDirector + ')'
            + ' AND c.id = v.consejero_id'
            + ' GROUP BY vc.nombre_votacion, c.nombre, c.apellido, c.correo, c.url_img, ca.id'
            + ' ORDER BY votos DESC';


        const consejeros = await sequelize.query(consultaSQL,
            { type: sequelize.QueryTypes.SELECT })
            .then(resultados => {
                console.log(resultados);
                return resultados;
            })
            .catch(error => {
                console.log('Error al obtener el conteo de votos: ', error);
                res.status(500).json({ message: error });
            })

        res.render('director/seguimiento', { consejeros, carrerasEscuelaDirector, fechaActualSys });

    } catch (error) {
        console.log('Error al mostrar vista de resultados: ', error);
    }

}


// muestra por pantalla vista de votaciones finalizadas
module.exports.renderVotacionesFinalizadas = async (req, res) => {

    try {

        // obtiene Google.id del director que esta logeado
        const idPerfilDirector = req.user.id;


        // obtiene id de la escuela a la que pertenece el director
        const escuelaDirector = await Usuario.findOne({
            where: { idPerfilUsuario: idPerfilDirector },
            attributes: ['escuelaId']
        });

        // obtiene el id de la escuela del director logeado
        const idEscuelaDirector = escuelaDirector.escuelaId;


        // obtiene todas las carreras registradas que pertenecen a la escuela del director
        const carrerasEscuelaDirector = await Carrera.findAll({
            where: { escuelaId: idEscuelaDirector }

        });

        const carrerasDirector = carrerasEscuelaDirector.map(carrera => carrera.dataValues.id);

        // obtiene todas las votaciones registradas
        const votaciones = await Votacion.findAll({
            where: { carreraId: carrerasDirector },
            // falta logica para filtrar por aquellas votaciones que hayan terminados ¿activa = false?
            include: [
                {
                    model: Carrera,
                    required: true // indica INNER JOIN
                }
            ]
        });

        res.render('director/fin-votacion', { votaciones, carrerasEscuelaDirector });

    } catch (error) {
        console.log('Error al mostrar vista de resultados: ', error);
    }

}


// obtiene vista de votacion seleccionada por director
module.exports.renderVotacionSeleccionada = async (req, res) => {

    try {

        // obtiene id de la votacion seleccionada
        const idVotacion = req.params.id;

        // obtiene votacion segun id de la votacion seleccionada
        const votacionSeleccionada = await Votacion.findByPk(idVotacion);


        // consulta que obtiene resultados de votacion seleccionada por director
        const consultaSQL = 'SELECT'
            + ' vc.nombre_votacion,'
            + ' c.nombre,'
            + ' c.apellido,'
            + ' c.url_img,'
            + ' vc.id AS votacion_id,'
            + ' COUNT(v.consejero_id) AS votos'
            + ' FROM'
            + ' consejero c'
            + ' INNER JOIN'
            + ' voto v ON c.id = v.consejero_id' // join tabla consejero - voto
            + ' INNER JOIN'
            + ' votacion vc ON c.votacion_id = vc.id' // join tabla consejero - votacion
            + ' INNER JOIN'
            + ' carrera ca ON c.carrera_id = ca.id' // join tabla consejero - carrera
            + ' WHERE'
            + ' vc.id = ' + idVotacion // obtiene los resultados segun id de la votacion seleccionada por el director
            + ' AND c.id = v.consejero_id'
            + ' GROUP BY vc.nombre_votacion , c.nombre , c.apellido , c.url_img, vc.id'
            + ' ORDER BY votos DESC;'


        const consejeros = await sequelize.query(consultaSQL,
            { type: sequelize.QueryTypes.SELECT })
            .then(resultados => {
                console.log(resultados);
                return resultados; // verificar si este return esta correcto aqui
            })
            .catch(error => {
                console.log('Error al obtener el conteo de votos: ', error);
                res.status(500).json({ message: error });
            })

        // obtiene de votacion seleccionada para enviar los resultados a alumnos que pertenecen a la carrera de la votacion
        res.render('director/enviar-resultados', { consejeros, votacionSeleccionada })



    } catch (error) {
        console.log('Error al obtener vista de postulacion seleccionada: ', error);
    }

}


// enviar resultados de votaciones a alumnos
module.exports.enviarResultados = async (req, res) => {

    try {

        // obtiene id de la votacion de la cual se enviaran los resultados
        const idVotacionEnvioResultados = req.params.id;

        // obtiene el false para desactivar la votacion
        const { votacionDesactiva } = req.body;

        // obtiene votacion mediante el id de la votacion obtendo previamente
        const votacion = await Votacion.findOne({
            where: { id: idVotacionEnvioResultados },
            attributes: ['carreraId']
        });

        // obtiene id de la carrera a la cual pertenece la votacion
        const idCarreraVotacion = votacion.carreraId;

        // obtiene carrera del alumno
        const carreraVotacion = await Carrera.findOne({
            where: { id: idCarreraVotacion }
        })

        // obtiene nombre carrera
        const nombreCarreraVotacion = carreraVotacion.dataValues.carrera

        // obtiene a todos los alumnos cuya carrera corresponde al id de la carrera de la votacion en la cual direcor esta enviado resultados;
        const alumnosCarreraVotacion = await Alumno.findAll({
            where: { carreraId: idCarreraVotacion }
        });


        // consulta SQL que actualiza consejeros electos a true en tabla consejeros
        const consultaSQL = 'SELECT'
            + ' vc.nombre_votacion,'
            + ' c.nombre,'
            + ' c.apellido,'
            + ' c.correo AS correo,'
            + ' c.telefono AS telefono,'
            + ' j.jornada,'
            + ' c.url_img,'
            + ' COUNT(v.consejero_id) AS votos'
            + ' FROM'
            + ' consejero c'
            + ' INNER JOIN'
            + ' voto v ON c.id = v.consejero_id'
            + ' INNER JOIN'
            + ' votacion vc ON c.votacion_id = vc.id'
            + ' INNER JOIN'
            + ' carrera ca ON c.carrera_id = ca.id'
            + ' INNER JOIN'
            + ' jornada j ON c.jornada_id = j.id'
            + ' WHERE ca.id = vc.carrera_id'
            + ' AND c.id = v.consejero_id'
            + ' GROUP BY vc.nombre_votacion, c.nombre, c.apellido, c.correo, j.jornada, c.url_img'
            + ' ORDER BY votos DESC'
            + ' LIMIT 3'; 
        + ' )'; 

        const consejeros = await sequelize.query(consultaSQL,
            { type: sequelize.QueryTypes.SELECT })
            .catch(error => {
                console.log('Error al obtener el conteo de votos: ', error);
                res.status(500).json({ message: error });
            })


        // consulta sql que actualiza a electo=true a los consejeros ganadores
        const actualizarElectoSQL = 'UPDATE consejero SET electo = true WHERE correo=?';

        for (consejero of consejeros) {
            console.log(consejero.correo);

            // guarda el correo de los consejeros electos
            let correoConsejeroElecto = consejero.correo;

            // consulta que actualiza la columna 'electo' a true en tabla consejeros
            await sequelize.query(actualizarElectoSQL, {
                replacements: [correoConsejeroElecto],
                type: sequelize.QueryTypes.UPDATE,
            })
                .catch(error => {
                    console.log('Error al realizar la actualización: ', error);
                    res.status(500).json({ message: error });
                });

        }


        // asunto correo envio de resultados alumnos, especificando la carrera de votacion
        const asuntoResultados = `Cierre de votación consejeros de carrera: ${nombreCarreraVotacion}`;
        const contenidoResultados = '<h3>Los resultados de la votación de consejeros ya están disponibles</3>'
            + '<br>'
            + 'Puedes visitar el siguiente <a href="localhost:3000/inicio/resultados">link</a> para conocer los resultados de la votación de consejeros de tu carrera.'
            + '<br>'
            + 'En el siguiente <a href="localhost:3000/inicio/resultados">link</a> puedes quiénes son los consejeros de tu carrera y así contactarte con ellos.'
            + '<br>'
            + 'Atentamente equipo votaciones Duoc UC.'


        // cambia desactiva la votacion DB
        const votacionDesactivada = await Votacion.update({
            activa: votacionDesactiva
        },
            {
                where: { id: idVotacionEnvioResultados }
            })
            .then(() => {

                // envio de correo con los consejeros ganadores a alumnos correspondientes a una carrera
                for (alumno of alumnosCarreraVotacion) {
                    let correoAlumno = alumno.correo;
                    enviarCorreo(correoAlumno, asuntoResultados, contenidoResultados);
                }

            })
            .catch(error => {
                console.log('Error al desactivar votacion: ', error);
            })



        req.flash('success', 'Resultados enviados a los alumnos exitosamente')
        res.redirect(`/director/fin-votacion`);



    } catch (error) {
        console.log('Error al enviar resultados votacion: ', error);
        req.flash('error', 'Error al enviar los resultados. Intente nuevamente.');
    }

}