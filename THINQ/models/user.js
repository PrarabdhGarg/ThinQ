module.exports = function(sequelize, DataTypes) {
    global.User = sequelize.define("User", {
      ipfs: DataTypes.STRING,
      name: DataTypes.STRING,
      type: DataTypes.INTEGER, //1 for Service Provider and 2 for Consumer
      publicKey: DataTypes.STRING,
      bio: DataTypes.STRING ,
      filehash: DataTypes.STRING
    })
    return User
}