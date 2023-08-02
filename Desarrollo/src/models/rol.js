const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rol = sequelize.define("rol", {
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Rol'
    });

module.exports = Rol;