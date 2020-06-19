const md5 = require('md5')

module.exports = function(sequelize, DataTypes) {
    global.ClosedRequest = sequelize.define("ClosedRequest", {
      sender: DataTypes.STRING,
      status: DataTypes.STRING, //{"created":Consumer creates request,"sp_ack":Sp acknowledges,"c_ack":consumer acknowledges}
      display:DataTypes.STRING
    })
    return ClosedRequest
}