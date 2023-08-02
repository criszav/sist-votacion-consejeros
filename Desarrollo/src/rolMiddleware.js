const Usuario = require('./models/usuario');
const Rol = require('./models/rol');


module.exports.rolRequerido = (rol) => {

  return async function (req, res, next) {

    try {

      // obtiene el usuario actual desde la DB
      const usuario = await Usuario.findOne({ where: { idPerfilUsuario: req.user.id } });


      // obtiene el rol del usuario encontrado previamente
      const rolUsuario = await Rol.findByPk(usuario.rolId);


      // verifica si el rol del usuario coincide con el rol requerido para acceder
      if (rolUsuario.rol === rol) {

        // si el usuario tiene el rol requerido para acceder, entonces sigue con el siguiente middleware
        next();

      } else {

        // si el usuario NO tiene el rol requerido para acceder, se niega la entrada y redirige al login
        res.redirect('/auth');
      }

    } catch (e) {
      console.log('Error en el middleware de roles: ', e);
      res.status(403).redirect('/auth');
    }


  }

}


module.exports.authRolRedirect = async (req, res) => {

  try {

    // obtiene el usuario desde la DB filtrando por correo
    const isUsuario = await Usuario.findOne({ where: { correo: req.user.email } });


    // verifica si quien se esta logeando existe en la tabla Usuario (si existe significa que es Superadmin o Director)
    if (isUsuario) {
      const rolIdUsuario = isUsuario.dataValues.rolId;
 
      if (rolIdUsuario === 4) { 

        return res.redirect('/inicioAdmin/register');

      } else if (rolIdUsuario === 3) { 

        console.log('Cayó en la vista director (tiene rolId 3)');
        return res.redirect('/director/crear-votacion');
        
      }
    }

    return res.redirect('/inicio');


  } catch (error) {
    console.log('Error en middleware rolMiddleware "authRolRedirect"');
    res.redirect('/auth')
  }
};