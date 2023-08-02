const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Escuela = sequelize.define("escuela", {
    escuela: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        timestamps: false,
        underscored: true,
        tableName: 'Escuela'
    })

module.exports = Escuela;