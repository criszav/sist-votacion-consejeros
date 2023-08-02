const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Jornada = sequelize.define("jornada", {
    jornada: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Jornada'
    })

module.exports = Jornada;