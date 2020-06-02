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


let ipfs , room , recip , socket
let connected = false

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'ejs')
app.use("/", router)
app.use(express.static('public'))

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
        ipfs.id(async (err , info)=>{
            fileHash = await recordChat.recordChatMessage(ipfs=ipfs, message=gdf.gdf_encode(res.message, info.id, recip), sent=true)
            console.log('Hash returned to server = ' + fileHash)
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
        })

        room.on('peer left' , (cid)=>{
            if(connected && recip == cid)
                socket.emit('ostat' , {online:false})
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
    global.MessageQueue.sync({force: true}).then(() => {
        console.log('Message Queue Table created')
    })
    global.addressRecord.sync({force:false}).then(() => {
        console.log("Address Table Created")
    })
})