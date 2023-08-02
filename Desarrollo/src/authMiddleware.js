const Alumno = require('./models/alumno');
const Usuario = require('./models/usuario');

module.exports.isLoggedIn = (req, res, next) => {
    // verificamos si usuario esta autenticado
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth');

}

module.exports.guardarAlumno = async (req, res, next) => {
    try {

        // Obtiene el objeto usuario (alumno)
        const { id, given_name, family_name, email } = req.user;

        // verifica si el alumno que esta ingresando existe 
        const alumnoExiste = await Alumno.findOne({
            where: {
                correo: email
            }
        })

        // si el alumno no existe, entonces lo agrega a la base de datos
        if (!alumnoExiste) {

            // crea un nuevo alumno en DB con los datos obtenidos al logearse con correo DUOC
            const alumno = await Alumno.create({
                nombre: given_name,
                apellido: family_name,
                correo: email,
                rolId: 1, // rol de 'alumno' segun tabla rol
                idPerfilAlumno: id
            });

            console.log('Alumno guardado en la DB');
            console.log(alumno._previousDataValues);
            res.redirect('/inicio');

        } else {
            next();
        }

    } catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
}


module.exports.redirigirAlumno = async (req, res, next) => {

    try {

        const { email } = req.user._json;

        // verifica si alumno ya tiene ingresada una carrera y jornada
        const alumno = await Alumno.findOne({
            where: {
                correo: email
            }
        })

        if (!alumno.carreraId || !alumno.jornadaId) {

            console.log('Alumno NO tiene id de carrera o NO id de jornada, redirigiendo a Pagina ingresar jornada y carrera...');
            res.redirect('/inicio/carrera-jornada');

        } else {

            console.log('Alumno tiene id de carrera y id de jornada, redirigiendo a Inicio Alumno...');
            next();
        }

    } catch (e) {
        console.log('Error al redirigir al alumno luego de iniciar sesion: ', e);
        res.send(e);
    }

}


// guardar datos del director
module.exports.guardarDirector = async (req, res, next) => {
    try {

        // obtiene datos de la cuenta que se esta registrando
        const { id, given_name, family_name, email } = req.user;
        console.log('google id: ', id);
        console.log('nombre director: ', given_name);
        console.log('apellidos director: ', family_name);
        console.log('email director: ', email);


        // crea un nuevo alumno en DB con los datos obtenidos al logearse con correo DUOC
        const director = await Usuario.update({
            nombre: given_name,
            apellido: family_name,
            idPerfilUsuario: id
        },
            {
                // actualizará los datos del usuario que sea director (id 3) y filtrará por correo
                where: {
                    correo: email,
                    rolId: 3
                }
            })
            .catch(error => {
                console.log('Error al actualizar datos del director: ', error);
                res.redirect('/director/crear-votacion');
            });

        console.log(`Datos del director ${family_name} actualizados exitosamente`);
        console.log('Director actualizado: ', director);
        next(); 


    } catch (error) {
        res.status(500).json({ message: error });
        //    res.redirect('/director/registro-consejero'); 
    }
}


// guardar googleId del superadmin
module.exports.guardarSuperadmin = async (req, res, next) => {
    try {


        // obtiene datos de la cuenta que se esta registrando
        const { id, given_name, email } = req.user;

        // crea un nuevo alumno en DB con los datos obtenidos al logearse con correo DUOC
        const superadmin = await Usuario.update({
            idPerfilUsuario: id
        },
            {
                // actualizará los datos del usuario que sea director (id 3) y filtrará por correo
                where: {
                    correo: email,
                    rolId: 4
                }
            })
            .catch(error => {
                console.log('Error al actualizar Google.Id del superadmin: ', error);
                res.redirect('/inicioAdmin/register');
            });

        console.log(`Google Id del superadmin ${given_name} actualizados exitosamente`);
        next(); // luego de gaber actualizado el Google.id del superadmin, pasa al siguinete middleware del archivo routes 


    } catch (error) {
        res.status(500).json({ message: error });
    }
}