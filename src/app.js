const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')

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
    let ipfs

    emitter.on('DOMContentLoaded', async() => {
        ipfs = await IPFS.create({
            repo: 'ipfs/thinq/' + Math.random(),
            EXPERIMENTAL: {
                ipnsPubsub: true
            }
        })
        id = await ipfs.id().toString()
        console.log('IPFS running sucessfully at ' + id)

        await ipfs.pubsub.subscribe('Room1', (msg) => {
            console.log('Message Recived = ' + msg)
        })
        console.log('Subscribed to log sucessfully')

        setInterval(() => ipfs.pubsub.publish('Room1', 'This is a message'), 2000)
    })
}