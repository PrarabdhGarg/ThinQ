const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')
const gdf = require('./gdf')
const recordChat = require('./record_chat')

var app = choo()
app.use(startup)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
    return html`
      <body>
        <p>This is a web page</p>
      </body>
    `
}

function startup(state, emitter) {

    emitter.on('DOMContentLoaded', async() => {
        const ipfs = new IPFS({
            repo: 'ipfs/thinq/' + Math.random(),
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
        
        const room = ROOM(ipfs, 'Room1')
        
        room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
        room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))
        
        room.on('message', (message) => {
            console.log('got message from ' + message.from + ': ' + gdf.gdf_decode(message.data.toString()).message)
            // recordChat.recordChatMessage(ipfs , 'Room1'  , message.data.toString())
        })
        
        
        setInterval(() => room.broadcast(gdf.gdf_encode('hey everyone!' + Math.random())), 2000)
        }))
    })
}

