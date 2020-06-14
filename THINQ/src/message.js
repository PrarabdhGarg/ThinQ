const cryptography = require('./cryptography')
const gdf = require('./gdf')

function broadcastMessageToRoom(message) {
    message['recipient'] = 'All'
    global.room.broadcast(gdf.gdf_encode(message))
}

async function broadcastMessageToAddressBook(message) {
    global.User.findAll().then((users) => {
        for(let i = 0; i < users.length; i++) {
            if(users[i].dataValues.ipfs != message.sender) {
                message.reciverType = "USER"
                message.reciver = users[i].dataValues.ipfs
                if(global.room.hasPeer(users[i].dataValues.ipfs))
                    sendMessageToUser(message, users[i].dataValues.ipfs)
                else
                    global.PendingMessages.create(message)
            }
        }
    })
}

async function sendMessageToUser(msg, user) {
    message = gdf.gdf_encode(msg)
    pkHash = (await global.User.findOne({where: {ipfs: user}})).dataValues.publicKey
    global.node.get(pkHash).then(([file]) => {
        cryptography.getEncryptedText(message, file.content.toString()).then((msg) => {
            global.room.sendTo(user, msg)
        })
    })
}

module.exports = {
    broadcastMessageToRoom: broadcastMessageToRoom,
    sendMessageToUser: sendMessageToUser,
    broadcastMessageToAddressBook: broadcastMessageToAddressBook
}