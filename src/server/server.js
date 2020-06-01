const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require("body-parser")
const Sequelize = require('sequelize')
const cors = require('cors')
const IPFS = require('ipfs')
const router = require('./router')
const ROOM = require('ipfs-pubsub-room')

let ipfs
let room

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'ejs')
app.use("/", router)

app.listen(3001, () => {
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
      })
    )

    console.log('Database Server started at port 3001!!!')
    var sequelize = new Sequelize({
        dialect: 'sqlite',
        storage:'/databases/messages.db'
    })
    global.ChatRecord.sync({force: true}).then(() => {
        console.log('Message Record table created')
    })
    global.MessageQueue.sync({force: true}).then(() => {
        console.log('Message Queue Table created')
    })
})