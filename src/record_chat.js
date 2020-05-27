//stores new message in gdf format
async function recordChatMessage(ipfs, roomId, message) {
    // Read the previous chat record from the file
    documentPath = '/chatRecords/' + roomId + '.txt'
    let previousChat
    try {
        previousChat = await ipfs.files.read(documentPath)
        // console.log("File = " + previousChat)
    } catch(e) {
        console.log(e.toString())
    }
    res = await ipfs.files.write(documentPath, Buffer.from(previousChat + message + '||'), {
        create: true,
        parents: true
    }, (err, res) => {
        if(err) {
            console.log('Result of add1 = ' + JSON.stringify(res))
            console.log('Error of add1' + JSON.stringify(err))
        }
    })
}

//returns an array of messages in gdf format
async function getChatHistory(ipfs, roomId) {
    let previousChat = ""
    try {
        previousChat = await ipfs.files.read('/chatRecords/' + roomId + '.txt')
        console.log("File = " + previousChat)
    } catch(e) {
        console.log(e.toString())
    }
    let chat_hist = await (previousChat.toString()).split("||")
    return chat_hist
}

module.exports = {
    getChatHistory: getChatHistory,
    recordChatMessage: recordChatMessage
}