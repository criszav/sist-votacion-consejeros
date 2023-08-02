const { Sequelize } = require('sequelize');


// crea instancia de sequelize para genrar conexion a DB
const sequelize = new Sequelize(
    process.env.DATABASE_NAME, 
    process.env.DATABASE_USERNAME, 
    process.env.DATABASE_PASSWORD, 
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

const conexionDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión exitosa a la Base de Datos");
    } catch (error) {
        console.error("Error al conectarse a la Base de Datos: ", error);
    }
};


module.exports = { conexionDB, sequelize };