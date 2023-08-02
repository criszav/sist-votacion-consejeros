const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Votacion = sequelize.define("votacion", {
    nombreVotacion: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_termino: {
        type: DataTypes.DATE,
        allowNull: false
    },
    idPerfilUsuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activa: {
        type: DataTypes.BOOLEAN
    }
    // tabla votacion conectada a tabla carrera, usuario, consejero, voto
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Votacion'
    })

module.exports = Votacion;