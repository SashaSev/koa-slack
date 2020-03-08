const Sequelize = require('sequelize');

 const sequelize = new Sequelize('postgres','postgres', '123456',{
    host:'localhost',
    dialect: 'postgres',
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
module.exports = sequelize;
global.sequelize = sequelize;


