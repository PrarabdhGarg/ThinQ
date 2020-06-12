const cryptography = require('./cryptography')
const gdf = require('./gdf')

function broadcastMessageToRoom(message) {
    message['recipient'] = 'All'
    global.room.broadcast(gdf.gdf_encode(message))
}

async function sendMessageToUser(msg, user) {
    message = gdf.gdf_encode(msg)
    pkHash = (await global.User.findOne({where: {ipfs: user}})).dataValues.publicKey
    global.node.get(pkHash).then(([file]) => {
        cryptography.getEncryptedText(message, file.content.toString()).then((msg) => {
            global.room.sendTO(user, msg)
        })
    })
}

module.exports = {
    broadcastMessageToRoom: broadcastMessageToRoom,
    sendMessageToUser: sendMessageToUser
}