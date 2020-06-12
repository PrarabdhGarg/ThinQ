// This model is used to queue the outgoing messages of a particular user

module.exports = function(sequelize, DataTypes) {
    global.OutboxMessages = sequelize.define("OutboxMessages", {
        uid: DataTypes.STRING,
        sender: DataTypes.STRING,
        action: DataTypes.INTEGER, // Currently, this would be 1 for requests and 2 for updates
        message: DataTypes.STRING,
        messageType: DataTypes.STRING,
        reciver: DataTypes.STRING,
        reciverType: DataTypes.STRING,
        timestamp: DataTypes.DATE,
        priority: DataTypes.DOUBLE
    })
    return User
}