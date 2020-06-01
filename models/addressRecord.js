module.exports = function(sequelize, DataTypes) {
    global.addressRecord = sequelize.define("addressRecord", {
      ipfs: DataTypes.STRING,
      name: DataTypes.STRING
    },{
      getterMethods: {
        i_classifier: function() {return "IPFS"},
        n_classifier: function() {return "NAME"},
      }
    })
    return global.addressRecord
  }