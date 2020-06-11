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
    updateBio: updateBio
}