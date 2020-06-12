module.exports = function(sequelize, DataTypes) {
    global.fileBook = sequelize.define("fileBook", {
      ipfs_hash: DataTypes.STRING,
      name:DataTypes.STRING,
    },{
      getterMethods: {
        h_classifier: function() {return "FileHash"},
        n_classifier: function() {return "Name"} }
      }
    )
    return global.fileBook
  }