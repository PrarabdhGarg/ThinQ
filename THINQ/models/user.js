module.exports = function(sequelize, DataTypes) {
    global.User = sequelize.define("User", {
      ipfs: DataTypes.STRING,
      name: DataTypes.STRING,
      type: DataTypes.INTEGER, //1 for Service Provider and 2 for Consumer
      publicKey: DataTypes.STRING, // This field would store the hash of the ipfs file where the actual public key resides
      bio: DataTypes.STRING // This field will store the hash of the file where his bio page resides
    })
    return User
}