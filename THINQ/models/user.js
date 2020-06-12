module.exports = function(sequelize, DataTypes) {
    global.User = sequelize.define("User", {
      ipfs: DataTypes.STRING,
      name: DataTypes.STRING,
      type: DataTypes.INTEGER, //1 for Service Provider and 2 for Consumer
      bio: DataTypes.STRING ,
      publickey: DataTypes.STRING,
      filehash: DataTypes.STRING
    })
    return User
}