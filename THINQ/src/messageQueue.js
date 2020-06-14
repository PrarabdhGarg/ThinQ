async function addMessageToOutbox(message, priority) {
    message.priority = priority
    if(message.hasOwnProperty('reciver')) {
        message.reciverType = "USER"
        global.OutboxMessages.create(message).then((msg) => {
            console.log('Message added to outbox sucessfully')
        })
    } else {
        global.User.findAll().then((users) => {
            for(let i = 0; i < users.length; i++) {
                if(users[i].dataValues.ipfs != message.sender) {
                    message.reciverType = "USER"
                    message.reciver = users[i].dataValues.ipfs
                    global.OutboxMessages.create(message).then((msg) => {
                        console.log('Message added to outbox sucessfully')
                    })
                }
            }
        })
    }
}

module.exports = {
    addMessageToOutbox: addMessageToOutbox
}