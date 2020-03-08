const Sequelize  = require('sequelize');
const db = require('../config/database');

const User = db.define('users', {
    email: {
       type: Sequelize.STRING,
        required: true,
        unique: 1
    },
    name: {
        type: Sequelize.STRING,
        required: true,
        maxLength :100
    }, password: {
        type: Sequelize.STRING,
        required: true,
        minLength: 7
    }
});
module.exports = User;