const cryptography = require('./cryptography')
const message = require('./message')
const MessageAction = require('./messageAction')

async function createUserRecord(init_info , res) {
    global.node.id().then(async (info)=>{
        await cryptography.generateKeys()
        let public_key = cryptography.getPublicKey()
        Promise.all([global.node.add(public_key) , global.node.add(init_info.bio)]).then((stats) => {
            init_info['PublicKey'] = stats[0][0].hash.toString()
            init_info['IPFSHash'] = info.id.toString()
            init_info['bio'] = stats[1][0].hash.toString()
            console.log(JSON.stringify(init_info))
            global.node.add(JSON.stringify(init_info)).then(([stat])=>{
                console.log('File hash = ' + stat.hash.toString())
                global.User.create({name:init_info.name , ipfs:info.id , bio:init_info.bio, publicKey:stats[0][0].hash.toString(), type:init_info.type , filehash:stat.hash.toString()}).then((result)=>{
                    res.redirect("/contacts")
                })
            })
        })
    })
}

async function updateBio(updatedBio) {
    global.node.id().then((info) => {
        global.User.findOne({where : {ipfs:info.id}}).then((result) => {
            let prevFileHash = result.dataValues.filehash
            global.node.get(prevFileHash).then(([file]) => {
                console.log(JSON.stringify(file))
                data = JSON.parse(file.content.toString())
                console.log(file.content.toString())
                global.node.add(updatedBio).then(([stat]) => {
                    data['bio'] = stat.hash.toString()
                    global.node.add(JSON.stringify(data)).then(([stat2]) => {
                        global.User.update({bio: stat.hash.toString(), filehash: stat2.hash.toString()}, {where: {ipfs: info.id}}).then((result1) => {
                            console.log('Database updated sucessfully')
                            message.broadcastMessageToAddressBook({
                                sender: info.id,
                                action: MessageAction.UPDATE,
                                message: stat.hash.toString(),
                                messageType: 'Bio'
                            })
                        })
                    })
                })
            })
        })
    })
}

module.exports = {
    createUserRecord: createUserRecord,
    updateBio: updateBio
}