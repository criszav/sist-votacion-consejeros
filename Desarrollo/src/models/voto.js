const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Voto = sequelize.define("voto", {
    fechaVoto: {
        type: DataTypes.DATE,
        allowNull: false
    },
    idPerfilAlumno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
    // tabla voto conectada con tabla alumno, consejero (por el que voto), votacion
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Voto'
    })

module.exports = Voto;