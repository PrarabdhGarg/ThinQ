const cryptography = require('./cryptography')
const gdf = require('./gdf')

// Assumption is that the message is already gdf encoded
function broadcastMessageToRoom(message) {
    global.room.broadcast(message)
}

// Assumption is that the message is already gdf encoded
async function sendMessageToUser(message, user) {
    messageObject = gdf.gdf_decode(message)
}

module.exports = {
    broadcastMessageToRoom: broadcastMessageToRoom,
    sendMessageToUser: sendMessageToUser
}