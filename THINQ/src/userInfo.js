const cryptography = require('./cryptography')

async function createUserRecord(init_info) {
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
                global.User.create({name:init_info.name , ipfs:info.id , bio:init_info.bio , type:init_info.type , filehash:stat.hash.toString()}).then((result)=>{
                    return result
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
                data['bio'] = updatedBio
                global.node.add(JSON.stringify(data)).then(([stat]) => {
                    console.log('Hash of new file = ' + stat.hash.toString())
                    global.node.add(updatedBio).then(([stat2]) => {
                        console.log('Hash of bio file = ' + stat2.hash.toString())
                        global.User.update({bio: stat2.hash.toString(), filehash: stat.hash.toString()}, {where: {ipfs: info.id}}).then((result1) => {
                            console.log('Database updated sucessfully')
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