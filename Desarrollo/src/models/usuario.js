const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define("usuario", {
    nombre: {
        type: DataTypes.STRING,
    },
    apellido: {
        type: DataTypes.STRING
    },
    correo: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    idPerfilUsuario: {
        type: DataTypes.STRING,
        unique: true
    }
    // tabla usuario conectada a tablas rol, votacion y escuela
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Usuario'
    })

module.exports = Usuario;