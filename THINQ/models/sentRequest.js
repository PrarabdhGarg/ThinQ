module.exports = function(sequelize, DataTypes) {
    global.SentRequest = sequelize.define("SentRequest", {
      sender: DataTypes.STRING,
      status: DataTypes.STRING, //currently not used
    })
    return SentRequest
}