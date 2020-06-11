const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require("body-parser")
const Sequelize = require('sequelize')
const cors = require('cors')
const IPFS = require('ipfs')
const router = require('./router')
const ROOM = require('ipfs-pubsub-room')
const http = require('http')
const gdf = require('./gdf')
const recordChat = require('./record_chat')
var models  = require('../../models');
const encryption = require('./encryption')

var ipfs , room , recip , socket , ipfsid
let connected = false

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.set('view engine', 'ejs')
app.use("/", router)
app.use(express.static('public'))

app.get('/' , function(req, res) {

    res.render('addressbook' , {ipfsid : ipfsid})
})

app.get('/fb' , function(req, res) {

    res.render('filebook')
})



let server = http.createServer(app)

const io = require('socket.io')(server)

io.on('connection' , (soc)=>{
    socket = soc
    connected = true;
    socket.on('disconnect' , ()=>{connected = false})
    socket.on('recipid' , (message)=>{
        models.addressRecord.findOne({where : {ipfs : message.recip}}).then((res)=>{
            recip = message.recip
            socket.emit('initinfo' , {
                name : res.dataValues.name ,
                ipfs : res.dataValues.ipfs , 
                online : room.hasPeer(res.dataValues.ipfs)
            })
        })
    })
    socket.on('sendMessage' , (res)=>{
        ipfs.id((err , info)=>{  
            let hash
            documentPath = path.join(__dirname , 'ipfs/thinq/messages/')
            documentPath = path.join(documentPath, recip + 'sent/' + Date.now() + '.txt')
            ipfs.files.write(documentPath, Buffer.from(res.message), {
                create: true,
                parents: true
            }, (err, resp) => {
                if(err) {
                    console.log("Error in inserting message " + err.message)
                } else {
                    ipfs.files.stat(documentPath, (err, respon) => {
                        if(err) {
                            console.log("Error in inserting message " + err.message)
                        }
                        console.log('Stat Result = ' + JSON.stringify(respon))
                        hash = respon.hash
                        console.log('File Hash = ' + hash)
                        models.chatRecord.create({sender:info.id , message: hash.toString() , recipient: recip,classifier:"MESSAGE"})
                        mes=gdf.gdf_encode(hash.toString(),info.id, recip, "MESSAGE")
                        if(room.hasPeer(recip)) {
                            models.addressRecord.findOne({where : {ipfs : recip}}).then((res)=>{ 
                                encryptedMessage = encryption.getEncryptedText(mes, res.dataValues.publicKey)
                                console.log(encryptedMessage)
                                room.sendTo(recip,encryptedMessage)
                             })
                        }
                        else
                            models.messageQueue.create({sender:info.id , message: hash.toString() , recipient: recip,classifier:"MESSAGE"})
                    })
                }
            })
        })
    })
    socket.on('sendFile' , (res)=>{
        ipfs.id((err , info)=>{  
            // let hash
            models.chatRecord.create({sender:info.id , message: res.hash.toString() , recipient: recip ,classifier:"IMAGE"})
                        mes=gdf.gdf_encode(res.hash.toString(),info.id, recip, "IMAGE")
                        console.log('recipient is:',recip)
                        if(room.hasPeer(recip))
                            room.sendTo(recip,mes)
                        else
                            models.messageQueue.create({sender:info.id , message: res.hash.toString() , recipient: recip,classifier:"IMAGE"})
                        socket.emit('renderimage', { link : res.hash.toString() });
            // documentPath = path.join(__dirname , 'ipfs/thinq/files/')
            // documentPath = path.join(documentPath, recip + 'sent/' + Date.now() + '.'+res.extension)
            // ipfs.files.write(documentPath, Buffer.from(res.file), {
            //     create: true,
            //     parents: true
            // }, (err, resp) => {
            //     if(err) {
            //         console.log("Error in inserting file " + err.message)
            //     } else {
            //         ipfs.files.stat(documentPath, (err, respon) => {
            //             if(err) {
            //                 console.log("Error in inserting file" + err.message)
            //             }
            //             console.log('Stat Result = ' + JSON.stringify(respon))
            //             hash = respon.hash
            //             console.log('File Hash = ' + hash)
            //             dname=path.join(__dirname , 'ipfs/thinq/files/')
            //             ipfs.files.ls(path.join(dname, recip + 'sent/'),(err,response)=>{
            //                 console.log(response);
            //             })
            //             models.chatRecord.create({sender:info.id , message: hash.toString() , recipient: recip ,classifier:"IMAGE"})
            //             mes=gdf.gdf_encode(hash.toString(),info.id, recip, "IMAGE")
            //             if(room.hasPeer(recip))
            //                 room.sendTo(recip,mes)
            //             else
            //                 models.messageQueue.create({sender:info.id , message: hash.toString() , recipient: recip,classifier:"IMAGE"})
            //             socket.emit('renderimage', { link : hash.toString() });
            //         })
            //     }
            // })
        })
    })
    socket.on('upload_filebook' , (res)=>{
        ipfs.id((err , info)=>{  
            let hash
            documentPath = path.join(__dirname , 'ipfs/thinq/filebook/')
            documentPath = path.join(documentPath, info.id +  Date.now() + '.'+res.extension)
            ipfs.files.write(documentPath, Buffer.from(res.file), {
                create: true,
                parents: true
            }, (err, resp) => {
                if(err) {
                    console.log("Error in inserting file " + err.message)
                } else {
                    ipfs.files.stat(documentPath, (err, respon) => {
                        if(err) {
                            console.log("Error in inserting file" + err.message)
                        }
                        console.log('Stat Result = ' + JSON.stringify(respon))
                        hash = respon.hash
                        console.log('File Hash = ' + hash)
                        models.fileBook.findOne({ where: { 'ipfs_hash':hash.toString()} }).then(token => {
                            if(token === null)
                            {
                            models.fileBook.create({ipfs_hash: hash.toString(),name:res.name})
                            socket.emit('addfb', { name:res.name,link : hash.toString() });
                            }
                         })
                        })
                        
                    }
                })
            
        })
    })
})

server.listen(3001, () => {
    ipfs = new IPFS({
        repo: path.join(__dirname , 'ipfs/thinq/'),
        init: true,
        EXPERIMENTAL: {
            pubsub: true
        },
        config: {
            Addresses: {
              Swarm: [
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
              ]
            }
        }
    })

    ipfs.once('ready', () => ipfs.id((err, info) => {
        if (err) { throw err }
        global.ipfs = ipfs
        console.log('IPFS node ready with address ' + info.id)
        console.log('Server Ready.................................\nIPFS node ready with address ' + info.id)
        room = ROOM(ipfs, "ThinQInformationRoom")
        console.log('Loading Keys..............')
        encryption.generateKeys()

        ipfsid = info.id

        room.on('peer joined' , (cid)=>{
            if(connected && recip == cid)
                socket.emit('ostat' , {online:true})
            models.messageQueue.findAll({
                where: {
                    recipient: cid
                }
            }).then((res) => {
                console.log("List of messages = " + JSON.stringify(res))
                if(res.length != 0) {
                    for (let message of res) {
                        encodedMessage = gdf.gdf_encode(message.message, message.sender, message.recipient,message.classifier)
                        models.addressRecord.findOne({where : {ipfs : recip}}).then((res)=>{ 
                            encryptedMessage = encryption.getEncryptedText(mes, res.dataValues.publicKey)
                            console.log(encryptedMessage)
                            room.sendTo(recip,encryptedMessage)
                            models.messageQueue.destroy({
                                where: {
                                    id: message.id
                                }
                            })
                         })
                    }
                }
            })
        })

        room.on('peer left' , (cid)=>{
            if(connected && recip == cid)
                socket.emit('ostat' , {online:false})
        })

        room.on('message' , (message)=>{
            encryption.getDecryptedText(message.data.toString()).then((msg) => {
                let tmsg = gdf.gdf_decode(msg)
                models.chatRecord.create({sender: tmsg.sender , message: tmsg.message , recipient: tmsg.recipient,classifier:tmsg.object_type})
                console.log("Object type is:"+tmsg.object_type.toString())
                if(connected && recip == tmsg.sender)
                {
                    if(tmsg.object_type.toString()=="MESSAGE")
                    {
                        console.log("Message condition")
                    try {
                        ipfs.files.read(`/ipfs/${tmsg.message}`).then((res)=>{
                            socket.emit('receiveMessage' , {
                                sender: tmsg.sender ,
                                message: res.toString()
                            })
                        })
                    } catch(e) {
                        console.log(e.toString())
                    }
                    }
                else if(tmsg.object_type.toString()=="IMAGE")
                { 
                    console.log("Image condition")
                    try 
                    {
                        ipfs.files.read(`/ipfs/${tmsg.message}`).then((res)=>
                        {
                            socket.emit('receiveImage' , {
                                sender: tmsg.sender ,
                                filesrc: tmsg.message.toString()
                            })
                        })
                    } 
                    catch(e) 
                    {
                        console.log(e.toString())
                    }
                    }          
                
                } 
            })
        })

      })
    )

    var sequelize = new Sequelize({
        dialect: 'sqlite',
        storage:'/databases/messages.db'
    })
    global.ChatRecord.sync({force: false}).then(() => {
        console.log('Message Record table created')
    })
    global.MessageQueue.sync({force: false}).then(() => {
        console.log('Message Queue Table created')
    })
    global.addressRecord.sync({force: false}).then(() => {
        console.log("Address Table Created")
    })
    global.fileBook.sync({force: false}).then(() => {
        console.log("Filebook Table Created")
    })
})

module.exports = {ipfsid : ipfsid}
