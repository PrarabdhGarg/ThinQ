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


var ipfs , room , recip , socket
let connected = false

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'ejs')
app.use("/", router)
app.use(express.static('public'))

app.get('/getRecord/:recip', function(req, res) {
    models.chatRecord.findAll({ where: Sequelize.or({recipient: req.params.recip} , {sender: req.params.recip})}).then(function(chats) {
        if(chats.length == 0)
        {
            res.json(new Object())
            return
        }
        let messages = {}
        let promises = []
        let count = 0
        for(chat of chats){
            messages[count++] = {
                sender : chat.dataValues.sender
            }
            try {
                promises.push(ipfs.files.read(`/ipfs/${chat.dataValues.message}`))
            } catch(e) {
                console.log(e.toString())
            }
        }
        Promise.all(promises).then((results)=>{
            for(let i=0 ; i<count ; i++)
                messages[i].message = results[i].toString()
            res.json(messages)
        })
    })
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
                        models.chatRecord.create({sender:info.id , message: hash.toString() , recipient: recip})
                        mes=gdf.gdf_encode(hash.toString(),info.id, recip)
                        if(room.hasPeer(recip))
                            room.sendTo(recip,mes)
                        else
                            models.messageQueue.create({sender:info.id , message: hash.toString() , recipient: recip})
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
        console.log('IPFS node ready with address ' + info.id)
        room = ROOM(ipfs, "ThinQInformationRoom")

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
                        encodedMessage = gdf.gdf_encode(message.message, message.sender, message.recipient)
                        room.sendTo(cid, encodedMessage)
                        models.messageQueue.destroy({
                            where: {
                                id: message.id
                            }
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
            let tmsg = gdf.gdf_decode(message.data.toString())
            models.chatRecord.create({sender: tmsg.sender , message: tmsg.message , recipient: tmsg.recipient})
            if(connected && recip == tmsg.sender)
            {
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
        })

      })
    )

    console.log('Database Server started at port 3001!!!')
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
    global.addressRecord.sync({force:false}).then(() => {
        console.log("Address Table Created")
    })
})
