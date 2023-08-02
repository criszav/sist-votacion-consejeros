const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Carrera = sequelize.define("carrera", {
    carrera: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Carrera'
    })

module.exports = Carrera;