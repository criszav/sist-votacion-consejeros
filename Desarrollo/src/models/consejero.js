const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Consejero = sequelize.define("consejero", {
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
    },
    telefono: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    electo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    urlImg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    motivacion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postulacionAceptada: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    idPerfilAlumno: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    periodo: {
        type: DataTypes.INTEGER
    }
    // tabla consejero conectada a tabla carrera, jornada, votacion
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Consejero'
    })

module.exports = Consejero;