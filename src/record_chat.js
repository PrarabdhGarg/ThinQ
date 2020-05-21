var toBuffer = require('to-buffer');

//stores new message in gdf format
async function recordChatMessage(ipfs, roomId, message) {
    const chunks = []
    try {
        for await (const chunk of ipfs.files.read('/chatRecords/' + roomId + '.txt')) {
            chunks.push(chunk)
        }
    } catch (e) {
        console.log(e.toString())
    }
    await ipfs.files.write('/chatRecords/' + roomId + '.txt', Buffer.concat(chunks).toString() + message + "||" , {
        create: true,
        parents: true
    })
    console.log('File Status = ' + Buffer.concat(chunks).toString())
}

//returns an array of messages in gdf format
async function getChatHistory(ipfs, roomId){
    const chunks = []
    try {
        for await (const chunk of ipfs.files.read('/chatRecords/' + roomId + '.txt')) {
            chunks.push(chunk)
        }
    } catch (e) {
        console.log(e.toString())
    }

    let raw_history = Buffer.concat(chunks).toString()
    let chat_hist = raw_history.split("||")

    return chat_hist
}

exports.recordChatMessage = recordChatMessage
exports.getChatHistory = getChatHistory