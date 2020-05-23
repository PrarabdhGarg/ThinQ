const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')
const gdf = require('./gdf')
const recordChat = require('./record_chat')
const addressBook = require('./addressbook')
const views = require('./views')

var app = choo()
app.use(startup)
app.route('/', views.mainView)
app.route('/handshake', views.handshakeForm)
app.mount('body')

function startup(state, emitter) {
    state.messages = []
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
        state.ipfs = ipfs
        app.push
            
        ipfs.once('ready', () => ipfs.id((err, info) => {
          if (err) { throw err }
          console.log('IPFS node ready with address ' + info.id)
          state.userid = info.id
          state.room = ROOM(ipfs, 'Room1')
          state.room.on('peer joined', (peer) => emitter.emit("render"))
          state.room.on('peer left', (peer) => emitter.emit("render"))
          state.room.on('message', async (message) => {
            state.messages.push(message.data.toString())
            emitter.emit("render")
          })
        })
      )
  })
}
