const Alumno = require("../../models/alumno");
const Carrera = require("../../models/carrera");
const Jornada = require("../../models/jornada");
const Consejero = require('../../models/consejero');
const Voto = require('../../models/voto');
const Usuario = require('../../models/usuario');
const Escuela = require('../../models/escuela');
const Votacion = require("../../models/votacion");

const { sequelize } = require('../../config/db');

const { enviarCorreo } = require('../../config/nodeMailer');

// obtiene configuracion de cloudinary para cargar img a la nube de Cloudinary
const { cloudinary } = require('../../config/cloudinaryConfig');

// obtiene fecha actual del sistema
const { fechaActualSys } = require('../../services/obtenerFechaActual');



// muestra pagina de inicio del alumno
module.exports.renderInicio = (req, res) => {

        // muestra por pantalla la vista 'inicio' con los datos del alumno que acaba de ingresar
        res.render('alumno/inicio');
}


// muestra por pantalla vista para ingresar que alumno seleccione carrera y jornada
module.exports.renderCarreraJornada = async (req, res) => {

        try {

                // obtiene todas las carreras de la base de datos
                const carreras = await Carrera.findAll();

                // obtiene todas las jornadas de la base de datos
                const jornadas = await Jornada.findAll();

                res.render('alumno/carrera-jornada', { carreras, jornadas });

        } catch (e) {
                res.redirect('/inicio/carrera-jornada');
        }


}

// obtiene carrera y jornada de alumno registrados que aun no poseen esos campos
module.exports.carreraJornadaAlumno = async (req, res) => {

        try {
                // obtiene email del usuario que esta ingresando la carrera y jornada
                const { email } = req.user;

                // obtener id de carrera y jornada del alumno
                const { carrera, jornada } = req.body;

                // insertar carrera y jornada en tabla alumno
                await Alumno.update(
                        {
                                carreraId: carrera,
                                jornadaId: jornada
                        },
                        { where: { correo: email } }
                )
                        .then((data) => {
                                req.flash('success', 'Carrera y jornada recibidas con éxito.')
                                res.redirect('/inicio');
                        })
                        .catch((e) => {
                                req.flash('error', 'Error al ingresar carrera y jornada. Vuelve a intentarlo.')
                                res.redirect('/carrera-jornada');
                        })

        } catch (error) {
                res.redirect('/carrera');
        }

}


// muestra por pantalla vista de consejeros postulantes
module.exports.renderPostulantes = async (req, res) => {

        try {

                // obtiene id del alumno que esta votando, es decir, del alumno que inició sesion
                const idPerfilAlumnoLogeado = req.user.id;


                // obtiene el id de la carrera del alumno que esta emitiendo el voto
                const carreraAlumnoLogeado = await Alumno.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado },
                        attributes: ['carreraId']
                })


                // obtiene el id de la carrera del alumno que esta logeado
                const idCarreraAlumnoLogeado = carreraAlumnoLogeado.dataValues.carreraId;


                // obtiene todas las carreras de la base de datos
                const carreras = await Carrera.findAll();


                // obtiene todas los consejeros de la base de datos
                const consejeros = await Consejero.findAll({
                        where: {
                                carreraId: idCarreraAlumnoLogeado,
                                postulacionAceptada: true
                        },
                        include: [
                                {
                                        model: Carrera,
                                        required: true
                                }
                        ]
                });

                res.render('alumno/list-post', { carreras, consejeros }); 

        } catch (e) {
                console.log('Error al mostrar a los psotulantes desde controlador alumno (inicio): ', e);
                res.redirect('/inicio');
        }
}



// muestra por pantalla vista para que alumno emita el voto
module.exports.renderVoto = async (req, res) => {

        try {

                // obtiene el id del alumno que va a emitir el voto
                const idPerfilAlumnoLogeado = req.user.id;

                const votoAlumno = await Voto.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado }
                })

                // obtiene la carrera del alumno que esta logeado
                const carreraAlumnoLogeado = await Alumno.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado },
                        attributes: ['carreraId']
                })

                // obtiene el valor del id de la carrera del alumno que esta logeado
                const idCarreraAlumnoLogeado = carreraAlumnoLogeado.dataValues.carreraId;

                // obtiene votacion que le corresponde al alumno, segun su carrera
                const votacion = await Votacion.findOne({
                        where: { carreraId: idCarreraAlumnoLogeado }
                })


                if (votacion !== null) {

                        // Accede a las propiedades del objeto
                        console.log(votacion.dataValues);
                        const votacionAlumno = votacion.dataValues;


                        // obtiene todas los consejeros de la base de datos
                        const consejeros = await Consejero.findAll({
                                where: {
                                        carreraId: idCarreraAlumnoLogeado,
                                        postulacionAceptada: true
                                },
                                include: [
                                        {
                                                model: Carrera,
                                                required: true
                                        }
                                ]
                        }) // falta filtrar por la carrera

                        res.render('alumno/vote', { consejeros, votoAlumno, fechaActualSys, votacionAlumno, votacion });


                } else {
                        res.render('alumno/noVotacion');
                }


        } catch (e) {
                res.redirect('/inicio');
        }
}


// obtiene los datos de la emision del voto
module.exports.emitirVoto = async (req, res) => {

        try {

                const candidato = req.body.candidato; // obtiene id del consejero por el cual votó
                const { id, email } = req.user; // obtiene datos del alumno que esta votando


                // obtiene el id del candidato por cual vota el alumno para obtener id de votacion
                const consejero = await Consejero.findAll({
                        where: { id: candidato },
                        attributes: ['votacionId', 'nombre', 'apellido'] // es el id de la votacion a la que pertenece el postulante
                })


                // obtiene id de la votacion en la cual el alumno esta emitiendo su voto
                const idVotacion = consejero.map(consejero => consejero.votacionId);
                const nombre = consejero.map(consejero => consejero.nombre);
                const apellido = consejero.map(consejero => consejero.apellido);


                // asunto del correo de voto de recibo enviado a alumno votante
                const asuntoCorreoVoto = '¡Tu voto ha sido recibido con éxito!';

                // contenido del correo de voto de recibo enviado a alumno votante
                const contenidoVotoEmitido = '<h3>Gracias por participar en la votación de consejeros de carrera. </h3> \n'
                        + '<br>'
                        + `<p>Hemos recibido con éxito tu emitido para el candidato ${nombre} ${apellido}</p>`
                        + '<br>'
                        + '<p>¡Tu voto cuenta y tu voz importa!</p>'
                        + '<br>'
                        + '<p>Atentamente equipo votaciones  Duoc UC.</p>';


                // inserta el voto emitido en DB
                const votoEmitido = await Voto.create({
                        fechaVoto: new Date(),
                        idPerfilAlumno: id,
                        consejeroId: candidato,
                        votacionId: idVotacion
                })
                        .then(resultados => {
                                enviarCorreo(email, asuntoCorreoVoto, contenidoVotoEmitido);
                                console.log('Correo enviado a alumno: ', resultados)
                        })
                        .catch(error => {
                                console.log('Error el guardar voto en DB: ', error);
                                req.flash('error', 'No hemos podido recibir tu voto');
                                res.redirect('/inicio/votar');
                        })

                req.flash('success', 'Tu voto ha sido emitido exitosamente');
                res.redirect('/inicio/votar');


        } catch (error) {
                req.flash('error', 'No hemos podido recibir tu voto');
                res.redirect('/inicio/votar');
        }
}


// muestra por pantalla vista de seguimiento de la votacion
module.exports.renderResultados = async (req, res) => {

        try {

                // obtiene el id del alumno que va a emitir el voto
                const idPerfilAlumnoLogeado = req.user.id;

                const votoAlumno = await Voto.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado }
                })

                // obtiene la carrera del alumno que esta logeado
                const carreraAlumnoLogeado = await Alumno.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado },
                        attributes: ['carreraId']
                })

                // obtiene el id de la carrera del alumno votante
                const idCarreraAlumnoLogeado = carreraAlumnoLogeado.dataValues.carreraId;

                // obtiene votacion que le corresponde al alumno, segun su carrera
                const votacion = await Votacion.findOne({
                        where: { carreraId: idCarreraAlumnoLogeado }
                })

                if (votacion !== null) {

                        const votacionAlumno = votacion.dataValues;


                        const consultaSQL = 'SELECT'
                                + ' vc.nombre_votacion,'
                                + ' c.nombre,'
                                + ' c.apellido,'
                                + ' c.correo,'
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
                                + ' WHERE ca.id = ' + idCarreraAlumnoLogeado
                                + ' AND c.id = v.consejero_id'
                                + ' GROUP BY vc.nombre_votacion, c.nombre, c.apellido, c.correo, c.url_img'
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

                        res.render('alumno/resultados', { consejeros, votoAlumno, votacionAlumno });

                } else {
                        res.render('alumno/noResultados');
                }

        } catch (err) {
                res.redirect('/inicio');
        }
}


// muestra por pantalla vista con informacion para postularse como consejero
module.exports.renderPostularse = async (req, res) => {

        try {

                // obtiene id del alumno que esta votando, es decir, del alumno que inició sesion
                const idPerfilAlumnoLogeado = req.user.id;

                // obtiene datos del alumno que inició sesión
                const sesionAlumno = await Alumno.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado },
                        include: [
                                {
                                        model: Carrera, // inner join con tabla Carrera
                                        required: true
                                },
                                {
                                        model: Jornada, // inner join con tabla Jornada
                                        required: true
                                }
                        ]
                })

                const idCarreraAlumno = sesionAlumno.dataValues.carreraId;

                // verifica si alumno ya tiene una postulacion
                const existePostulante = await Consejero.findOne({
                        where: { idPerfilAlumno: idPerfilAlumnoLogeado }
                })


                // obtiene escuela a la que pertenece el alumno que esta logeado
                const escuelaAlumnoLogeado = await Carrera.findOne({
                        where: { id: idCarreraAlumno },
                        attributes: ['escuelaId']
                })


                // obtiene el valor del id de la carrera del alumno que esta logeado
                const idEscuelaAlumnoLogeado = escuelaAlumnoLogeado.dataValues.escuelaId;


                // obtiene director de escuela a la que pertenece el alumno
                const director = await Usuario.findOne({
                        where: { escuelaId: idEscuelaAlumnoLogeado },
                        include: [
                                {
                                        model: Escuela,
                                        required: true
                                }
                        ]
                })

                // muestra vista pasos para postularse
                res.render('alumno/postular', { director, sesionAlumno, existePostulante });

        } catch (error) {
                console.log('Error al mostrar vista de postulacion: ', error);
                res.redirect('/inicio');
        }
}


// realizar postulacion del alumno
module.exports.postular = async (req, res) => {

        try {

                const { id, given_name, family_name, email } = req.user;

                // obtiene datos del postulante
                const { phone, descripcion, photo, periodo, carreraId, jornadaId } = req.body;

                // accede al archivo de img del consejero cargado en formulario de registro
                const file = req.file;
                console.log('File data: ', file);

                // obtiene carrera del alumno
                const carreraAlumno = await Carrera.findOne({
                        where: { id: carreraId }
                })

                // obtiene nombre carrera
                const carreraAlumnoPostulante = carreraAlumno.dataValues.carrera

                // obtiene escuela del director (objeto)
                const escuelaDirector = await Carrera.findOne({
                        where: { id: carreraId },
                        attributes: ['escuelaId']
                })

                // obtiene id de la escuela correspondiente del director
                const idEscuelaDirector = escuelaDirector.dataValues.escuelaId;

                // obtiene director
                const director = await Usuario.findOne({
                        where: { escuelaId: idEscuelaDirector },
                        attributes: ['correo']
                })

                // obtiene el correo del director obtenido previamente
                const correoDirector = director.dataValues.correo;



                // asunto del correo enviado a alumno de postulacion recibida con exito
                const asuntoCorreoPostulacion = '¡Tu postulación ha sido recibida con éxito!';

                // contenido del correo enviado a alumno de postulacion recibida con exito
                const contenidoPostulacion = '<h3>Gracias por postular a la votación de consejeros de carrera.</h3>'
                        + '<br>'
                        + `<p>Estimado, ${given_name} ${family_name} </p>`
                        + '<br>'
                        + '<p>Te informamos que hemos recibido tu postulación de forma exitosa.</p>'
                        + '<br>'
                        + '<p>La postulación esta siendo procesada por el Director de tu carrera. Recibirás un correo con los resultados de tu postulación.</p>'
                        + '<br>'
                        + '<p>Atentamente equipo votaciones Duoc UC.</p>';


                // asunto del correo enviado a director informando una nueva postulacion
                const asuntoCorreoDirector = `Votación consejeros ${carreraAlumnoPostulante}: nueva postulación ha sido ingresada`;

                // contenido del correo enviado a director informando una nueva postulacion
                const contenidoCorreoDirector = '<h3>Ha sido ingresada una nueva postulación como candidato a consejero de carrera</h3>'
                        + '<p>Estimado Director(a),</p>'
                        + '<br>'
                        + `<p>El alumno <b>${given_name} ${family_name}</b> perteneciente a la carrera <b>${carreraAlumnoPostulante}</b> ha ingresado una postulación como candidato a consejero.</p>`
                        + '<br>'
                        + '<p>Puedes gestionar la postulación en el siguiente <a href="localhost:3000/director/postulaciones">link</a>.</p>'
                        + '<br>'
                        + '<p>Atentamente equipo votaciones Duoc UC.</p>';


                if (file == undefined) {
                        req.flash('error', 'Error, no se ha podido procesar tu postulación. Debes cargar una imagen.');
                        res.redirect('/inicio/postular');
                } else {

                        // inserta una nueva postulacion
                        const postulante = await Consejero.create({
                                nombre: given_name,
                                apellido: family_name,
                                correo: email,
                                telefono: phone,
                                electo: false, // se crea en false por defecto
                                urlImg: '', // url vacia momentaneamente hasta subir img a Cloudinary, luego se actualiza con url de img subida
                                motivacion: descripcion,
                                postulacionAceptada: false, // por defecto es false, cambiará a true si director acepta postulacion
                                idPerfilAlumno: id, // Google.id
                                periodo: new Date().getFullYear(),
                                carreraId: carreraId,
                                jornadaId: jornadaId
                        })
                                .then((consejero) => {

                                        // carga imagen de consejero a Cloudinary
                                        cloudinary.uploader.upload(req.file.path, (error, result) => {

                                                // captura error al subir img a nube Cloudinary
                                                if (error) {
                                                        req.flash('error', 'Error, no se ha podido procesar tu postulación. Intenta nuevamente.');

                                                } else {


                                                        // actualiza url de img del consejero registrado previamente
                                                        consejero.urlImg = result.secure_url;

                                                        // guarda los cmabios en url de img en DB
                                                        consejero.save();

                                                        // envia correo de confirmacion de postulacion al alumno
                                                        enviarCorreo(email, asuntoCorreoPostulacion, contenidoPostulacion);

                                                        // envia correo a director de aviso de alumno postulante
                                                        enviarCorreo(correoDirector, asuntoCorreoDirector, contenidoCorreoDirector);

                                                        req.flash('success', 'Tu postulación ha sido enviada exitosamente');

                                                        // una vez enviada la postulacion redirige a inicio
                                                        res.redirect('/inicio/postular');
                                                }

                                        })
                                })
                                .catch((error) => {
                                        req.flash('error', 'No hemos podido recibir tu postulación. Intenta nuevamente.');
                                        res.redirect('/inicio/postular');
                                })
                }



        } catch (error) {
                req.flash('error', 'No hemos podido recibir tu postulación. Intenta nuevamente.');
                res.status(500).json({ error });
        }

}


// obtiene los consejeros electos que le corresponden al alumno que esta logeado
module.exports.consejerosElectos = async (req, res) => {

        try {

                // obtiene id de la sesion del alumno que esta logeado
                const { id } = req.user;

                // obtiene la carrera del alumno que esta logeado
                const carreraAlumnoLogeado = await Alumno.findOne({
                        where: { idPerfilAlumno: id },
                        attributes: ['carreraId']
                })

                // obtiene el id de la carrera del alumno votante
                const idCarreraAlumnoLogeado = carreraAlumnoLogeado.dataValues.carreraId;


                // obtiene votacion que le corresponde al alumno, segun su carrera
                const votacion = await Votacion.findOne({
                        where: { carreraId: idCarreraAlumnoLogeado }
                })

                if (votacion !== null) {
                        // Accede a las propiedades del objeto
                        console.log(votacion.dataValues);


                        console.log(votacion);

                        // obtiene datos de la votacion del alumno obtenida previamente
                        const votacionAlumno = votacion.dataValues;



                        // obtiene la cantidad de votos de los consejeros candidatos correspondientes a carrera del alumno logeado
                        // ordena en forma descendente la cantidad de votos, limitando los resultados 3 consejeros (ganadores, ya que son 3 consejeros por carrera)
                        const consultaSQL = 'SELECT' // probablemente tambiens e puede hacer el insert directo ene sta consulta como una subconsulta
                                + ' vc.nombre_votacion,'
                                + ' c.nombre,'
                                + ' c.apellido,'
                                + ' c.correo AS correo,'
                                + ' c.telefono AS telefono,'
                                + ' ca.carrera,'
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
                                + ' WHERE ca.id = ' + idCarreraAlumnoLogeado
                                + ' AND c.id = v.consejero_id'
                                + ' AND c.electo = true'
                                + ' GROUP BY vc.nombre_votacion, c.nombre, c.apellido, c.correo, ca.carrera, j.jornada, c.url_img'
                                + ' ORDER BY votos DESC'
                                + ' LIMIT 3'; 



                        const consejeros = await sequelize.query(consultaSQL,
                                { type: sequelize.QueryTypes.SELECT })
                                .then(resultados => {
                                        console.log(resultados);
                                        return resultados;
                                })
                                .catch(error => {
                                        res.status(500).json({ message: error });
                                })

                        res.render('alumno/consejeros-electos', { consejeros, votacionAlumno });

                } else {
                        res.render('alumno/noConsejeros');
                }


        } catch (error) {
                console.log('Error al obtener consejeros electos: ', error);
        }

}
