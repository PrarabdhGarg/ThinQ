var toBuffer = require('to-buffer');

async function recordChatMessage(ipfs, roomId, message) {
    const chunks = []
    try {
        for await (const chunk of ipfs.files.read('/chatRecords/' + roomId + '.txt')) {
            chunks.push(chunk)
        }
    } catch (e) {
        console.log(e.toString())
    }
    await ipfs.files.write('/chatRecords/' + roomId + '.txt', message + "\n" + Buffer.concat(chunks).toString(), {
        create: true,
        parents: true
    })
    console.log('File Status = ' + Buffer.concat(chunks).toString())
}

exports.recordChatMessage = recordChatMessage