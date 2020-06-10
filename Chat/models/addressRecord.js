module.exports = function(sequelize, DataTypes) {
    global.addressRecord = sequelize.define("addressRecord", {
      ipfs: DataTypes.STRING,
      name: DataTypes.STRING,
      publicKey: DataTypes.STRING
    },{
      getterMethods: {
        i_classifier: function() {return "IPFS"},
        n_classifier: function() {return "NAME"},
        p_classifier: function() { return "Public Key" }
      }
    })
    return global.addressRecord
  }