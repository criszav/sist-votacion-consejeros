const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Alumno = sequelize.define("alumno", {
    idPerfilAlumno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
    // tabla alumno conectada a tablas carrera, rol, jornada, voto
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Alumno'
    })

module.exports = Alumno;