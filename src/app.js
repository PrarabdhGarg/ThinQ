const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')
const gdf = require('./gdf')
const recordChat = require('./record_chat')
const addressBook = require('./addressbook')
const views = require('./views')
const database = require('./database')

var app = choo()
app.use(startup)
app.route('/chat/:recipient ', views.mainView)
app.route('/', views.handshakeForm)
app.mount('body')

function startup(state, emitter) {
    state.messages = []
    state.recipient = ""
    state.addressBook = new Object()
    emitter.on('DOMContentLoaded', async() => {
        const ipfs = new IPFS({
            repo: 'ipfs/thinq/',
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
        state.ipfs = ipfs
        app.push

        database.addMessage()
            
        ipfs.once('ready', () => ipfs.id((err, info) => {
          if (err) { throw err }
          console.log('IPFS node ready with address ' + info.id)
          state.userid = info.id
          addressBook.getAddressBook(state.ipfs, state.userid.toString()).then((res)=>{
            state.addressBook = res
            emitter.emit('render')
          });
        })
      )
  })

    emitter.on('navigate', async() => {
      addressBook.getAddressBook(state.ipfs, state.userid.toString()).then((res)=>{
        state.addressBook = res
        emitter.emit('render')
      });
    })
}
