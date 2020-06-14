// This model is used to queue the outgoing messages of a particular user

module.exports = function(sequelize, DataTypes) {
    global.OutboxMessages = sequelize.define("OutboxMessages", {
        sender: DataTypes.STRING,
        action: DataTypes.INTEGER, // Currently, this would be 1 for requests and 2 for updates
        message: DataTypes.STRING,
        messageType: DataTypes.STRING,
        reciver: DataTypes.STRING,
        reciverType: DataTypes.STRING,
        priority: DataTypes.DOUBLE
    })
    return OutboxMessages
}