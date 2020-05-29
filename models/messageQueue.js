const md5 = require("md5")

module.exports = function(sequelize, DataTypes) {
    global.MessageQueue = sequelize.define("messageQueue", {
      sender: DataTypes.STRING,
      message: DataTypes.STRING,
      recipient: DataTypes.STRING
    },{
      getterMethods: {
        uid: function() {return md5(this.sender + this.message + this.recipient)},
        s_classifier: function() {return "USER"},
        m_classifier: function() {return "MESSAGE"},
        r_classifier: function() {return "USER"}
      }
    })
    return global.MessageQueue
  }