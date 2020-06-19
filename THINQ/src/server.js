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
const messages = require('./message')

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
    global.SentRequest.sync({force: false}).then(() => {
        console.log('Sent Request table created')
    })
    global.PendingRequest.sync({force: false}).then(() => {
        console.log('Pending Request table created')
    })
    global.ClosedRequest.sync({force: false}).then(() => {
        console.log('Closed Request table created')
    })
    global.room.on('peer joined', (cid) => {
        global.PendingMessages.findAll({
            where: {
                reciver: cid
            }
        }).then((res) => {
            console.log("List of messages = " + JSON.stringify(res))
            if(res.length != 0) {
                for (let message of res) {
                    messages.sendMessageToUser(message, cid)
                }
                global.PendingMessages.destroy({
                    where: {
                        id: message.id
                    }
                })
            }
        })
    })

    global.room.on("message" , async (message)=>{
        let decrypted_msg = await cryptography.getDecryptedText(message.data.toString())
        let decoded_msg = await gdf.gdf_decode(decrypted_msg)

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
                    else if(decoded_msg.messageType == 'Type')
                        update['type'] = data.type

                    global.User.update(update , {where: {ipfs:message.from}}).then((res)=>{
                        console.log("DataBase Updated Sucessfully")
                    })
                })
            })
        }
        else if(decoded_msg.action == messageAction.REQUEST)
        {
            global.User.findOne({where: {
                ipfs: message.from
            }}).then((user) => {
                let rating = 0
                console.log('Rating = ' + JSON.stringify(user))
                try {
                    rating = parseFloat(user.dataValues.rating)
                } catch(e) {
                    rating = 0
                }
                console.log('Rating = ' + rating.toString())
                global.PendingRequest.create({sender: message.from , status: "Unused", rating: rating})
            })
        }
        else if(decoded_msg.action == messageAction.DELETE)
        {
            global.PendingRequest.destroy({where : {sender: message.from}})
        }
        else if(decoded_msg.action == messageAction.C_CREATE)
        {
            global.PendingRequest.destroy({where : {sender: message.from}})
            global.ClosedRequest.create({sender:message.from,status:"created",display:"2"})
        }
        else if(decoded_msg.action == messageAction.SP_ACK)
        {
            global.ClosedRequest.update({status:"sp_ack",display:"2"},{where: {sender:message.from , status: "created"}})
            global.node.id().then((info)=>{
                console.log("server SP_ack infoid is written here:",info.id.toString())
                documentPath='/ratings/' + info.id.toString() + '.txt'
                console.log('The rating in spack is written here:',decoded_msg.rating.toString())
            global.node.files.write(documentPath, Buffer.from(info.id.toString()+'|'+decoded_msg.rating+'|'+decoded_msg.transact), {
                create: true,
                parents: true
                }, (err, res) => {
                 if(err) {
                    console.log("--------------------------Error in inserting file " + err.message)
                } 
                else {
                global.node.files.stat(documentPath, (err, respon) => {
                if(err) {
                    // console.log("Error in inserting rating" + err.message)
                }
                console.log('Stat Result = ' + JSON.stringify(respon))
                hash = respon.hash
                console.log('File Hash = ' + hash)
                    global.User.update({ratinghash:hash,rating:decoded_msg.rating},{where: {ipfs:info.id}}).then((result)=>{
                        console.log("results of filehash is :",result)
                    })
                })
            }
                }) 

            messages.broadcastMessageToAddressBook({
                sender: info.id,
                messageAction:messageAction.RATE_UPDATE,
                rating:decoded_msg.rating,
                transact:decoded_msg.transact
            })
        })     
        }
        else if(decoded_msg.action == messageAction.C_ACK)
        {
            global.ClosedRequest.update({status:"c_ack"},{where: {sender:message.from , status: "sp_ack"}})
            global.node.id().then((info)=>{
                console.log("server C_ack infoid is:",info.id.toString())
                documentPath='/ratings/' + info.id.toString() + '.txt'
                console.log('The rating in cack is written here:',decoded_msg.rating.toString())
            global.node.files.write(documentPath, Buffer.from(info.id.toString()+'|'+decoded_msg.rating+'|'+decoded_msg.transact), {
                create: true,
                parents: true
                }, (err, res) => {
                 if(err) {
                    console.log("--------------------------Error in inserting file " + err.message)
                } 
                else {
                global.node.files.stat(documentPath, (err, respon) => {
                if(err) {
                    // console.log("Error in inserting rating" + err.message)
                }
                console.log('Stat Result = ' + JSON.stringify(respon))
                hash = respon.hash
                console.log('File Hash = ' + hash)
                    global.User.update({ratinghash:hash,rating:decoded_msg.rating},{where: {ipfs:info.id}}).then((result)=>{
                        console.log("results of filehash is :",result)
                    })
                })
            }
                }) 

            messages.broadcastMessageToAddressBook({
                sender: info.id,
                messageAction:messageAction.RATE_UPDATE,
                rating:decoded_msg.rating,
                transact:decoded_msg.transact
            })
        })   
        }
        else if(decoded_msg.action == messageAction.SP_C_CREATE)
        {
            global.SentRequest.destroy({where : {sender: message.from}})
            global.ClosedRequest.create({sender:message.from,status:"created",display:"1"})
        }
        else if(decoded_msg.action == messageAction.RATE_UPDATE)
        {
            documentPath='/ratings/' + message.from.toString() + '.txt'
            console.log("------------------------server rateupdate id is:",message.from.toString())
            console.log("server rate_update documentpath is:",documentPath)
            console.log('The rating in rate_update is written here:',decoded_msg.rating.toString())
            global.node.files.write(documentPath, Buffer.from(message.from.toString()+'|'+decoded_msg.rating+'|'+decoded_msg.transact), {
                create: true,
                parents: true
                }, (err, res) => {
                 if(err) {
                    console.log("--------------------------Error in inserting file " + err.message)
                } 
                else {
                global.node.files.stat(documentPath, (err, respon) => {
                if(err) {
                    // console.log("Error in inserting rating" + err.message)
                }
                console.log('Stat Result = ' + JSON.stringify(respon))
                hash = respon.hash
                console.log('File Hash = ' + hash)
                    global.User.update({ratinghash:hash,rating:decoded_msg.rating.toString()},{where: {ipfs:message.from}}).then((result)=>{
                        console.log("results of filehash is :",result)
                    })
                })
            }
            }) 
        }
    })
})

