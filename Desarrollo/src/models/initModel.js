const Alumno = require('./alumno');
const Carrera = require('./carrera');
const Consejero = require('./consejero');
const Escuela = require('./escuela');
const Jornada = require('./jornada');
const Rol = require('./rol');
const Usuario = require('./usuario');
const Votacion = require('./votacion');
const Voto = require('./voto');



const initModel = () => {

    // conexion tabla ROL - USUARIO
    Rol.hasMany(Usuario);
    Usuario.belongsTo(Rol);

    // conexion tabla USUARIO - VOTACION
    Usuario.hasMany(Votacion);
    Votacion.belongsTo(Usuario);

    // conexion tabla CONSEJERO - VOTO
    Consejero.hasMany(Voto);
    Voto.belongsTo(Consejero);

    // conexion tabla ESCUELA - CARRERA
    Escuela.hasMany(Carrera);
    Carrera.belongsTo(Escuela);

    // conexion tabla CARRERA - CONSEJERO
    Carrera.hasMany(Consejero);
    Consejero.belongsTo(Carrera);

    // conexion tabla ROL - ALUMNO
    Rol.hasMany(Alumno);
    Alumno.belongsTo(Rol);

    // conexion tabla ALUMNO - VOTO (mediante id del perfil google)
    Alumno.hasOne(Voto);
    Voto.belongsTo(Alumno);

    // conexion tabla CARRERA - ALUMNO
    Carrera.hasMany(Alumno);
    Alumno.belongsTo(Carrera);

    // conexion tabla VOTACION VOTO
    Votacion.hasMany(Voto);
    Voto.belongsTo(Votacion);

    // coenxion tabla CARRERA - VOTACION
    Carrera.hasOne(Votacion);
    Votacion.belongsTo(Carrera);

    // conexion tabla JORNADA - ALUMNO
    Jornada.hasMany(Alumno);
    Alumno.belongsTo(Jornada);

    // conexion tabla JORNADA - CONSEJERO
    Jornada.hasOne(Consejero);
    Consejero.belongsTo(Jornada);

    // conexion tabla VOTACION - CONSEJERO
    Votacion.hasMany(Consejero);
    Consejero.belongsTo(Votacion);

    // conexion tabla USUARIO - ESCUELA
    Escuela.hasMany(Usuario);
    Usuario.belongsTo(Escuela);

}


module.exports = initModel;
