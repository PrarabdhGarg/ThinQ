const md5 = require('md5')

module.exports = function(sequelize, DataTypes) {
    global.PendingRequest = sequelize.define("PendingRequest", {
      sender: DataTypes.STRING,
      status: DataTypes.STRING, //currently not used
    })
    return PendingRequest
}