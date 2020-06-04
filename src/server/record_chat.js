const database = require('../database')
const gdf = require('./gdf')
const path = require('path')

async function recordChatMessage(ipfs, message, sent = false) {
    var decodedMessage = gdf.gdf_decode(message)
    documentPath = path.join(__dirname , 'ipfs/thinq/messages/')
    dateTime = new Date()
    console.log('Date Time of adding message = ' + dateTime)
    if(sent) 
        documentPath = path.join(documentPath, decodedMessage.recipient + 'sent/' + dateTime + '.txt')
    else
        documentPath = path.join(documentPath, decodedMessage.sender + 'recieved/' + dateTime + '.txt')
    res = await ipfs.files.write(documentPath, Buffer.from(decodedMessage.message), {
        create: true,
        parents: true
    }, (err, res) => {
        if(err) {
            console.log("Error in inserting message " + err.message)
        } else {
            ipfs.files.stat(documentPath, (err, res) => {
                if(err) {
                    console.log("Error in inserting message " + err.message)
                }
                console.log('Stat Result = ' + JSON.stringify(res))
                fileHash = res.hash
                console.log('File Hash = ' + fileHash)
                models.chatRecord.create({sender:info.id , message: res.message , recipient: recip,classifier:"Message"})
            })
        }
    })
}

async function getChatHistory(ipfs, roomId) {
    let previousChat = ""
    try {
        previousChat = await ipfs.files.read('/chatRecords/' + roomId + '.txt')
        console.log("File = " + previousChat)
    } catch(e) {
        console.log(e.toString())
    }
    // let chat_hist = await (previousChat.toString()).split("||")
    let chat_hist
    if(roomId.split("||")[0] == ipfs)
        chat_hist = await database.getRecords(roomId.split("||")[1])
    else
        chat_hist = await database.getRecords(roomId.split("||")[0])
    console.log("Prev Chats = " + JSON.stringify(chat_hist))
    return chat_hist
}

module.exports = {
    getChatHistory: getChatHistory,
    recordChatMessage: recordChatMessage
}