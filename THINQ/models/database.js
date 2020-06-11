'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

let sequelize = new Sequelize({
    "dialect": "sqlite",
    "storage": path.join(__dirname , "database.sqlite3")
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
