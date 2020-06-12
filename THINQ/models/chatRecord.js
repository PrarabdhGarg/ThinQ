// This model is used to store the history of messages

module.exports = function(sequelize, DataTypes) {
    global.ChatRecord = sequelize.define("ChatRecord", {
        uid: DataTypes.STRING,
        sender: DataTypes.STRING,
        action: DataTypes.INTEGER, // Currently, this would be 1 for requests and 2 for updates
        message: DataTypes.STRING,
        messageType: DataTypes.STRING,
        reciver: DataTypes.STRING,
        reciverType: DataTypes.STRING,
        timestamp: DataTypes.DATE
    })
    return ChatRecord
}