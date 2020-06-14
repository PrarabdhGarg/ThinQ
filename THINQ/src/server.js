const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const router = require('./router')
const http = require('http')
const ipfs = require('./ipfs')
const db = require('../models/database')
const Sequelize = require('sequelize')
const cryptography = require('./cryptography')
const gdf = require('./gdf')
const messageAction = require('./messageAction')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use("/", router)

let server = http.createServer(app)
server.listen(3000, async () => {
    await ipfs.initializeIPFS()
    global.User.sync({force: false}).then(() => {
        console.log('USER table created')
    })
    global.PendingMessages.sync({force: false}).then(() => {
        console.log('Pending table created')
    })

    global.room.on("message" , (message)=>{
        let decrypted_msg = cryptography.getDecryptedText(message.data.toString())
        let decoded_msg = gdf.gdf_decode(decrypted_msg)

        if(decoded_msg.action == messageAction.UPDATE)
        {
            global.User.findOne({where : {ipfs:message.from}}).then((user_info)=>{
                if(user_info==null)
                    return
                
                global.node.get(decoded_msg.message).then(([file]) => {
                    data = JSON.parse(file.content.toString())

                    let update = new Object()
                    update['filehash'] = decoded_msg.message
                    if(decoded_msg.messageType == 'Bio')
                        update['bio'] = data.bio
                    else if(decoded_msg.messageType == 'PublicKey')
                        update['publicKey'] = data.PublicKey

                    global.User.update(update , {where: {ipfs:message.from}}).then((res)=>{
                        console.log("DataBase Updated Sucessfully")
                    })
                })
            })
        }
    })
})