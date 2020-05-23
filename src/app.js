const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')
const gdf = require('./gdf')
const recordChat = require('./record_chat')
const addressBook = require('./addressbook')
var app = choo()
app.use(startup)
app.route('/', mainView)
app.route('/handshake', handshakeForm)
app.mount('body')
let userid
function handshakeForm(state, emit) {
    return html`
    <body>
    <form id="login" onsubmit=${onsubmit}>
      <label for="Name">
        Name
      </label>
      <input id="Name" name="Name"
        type="text"
        required
      >
      <label for="IPFS">
        IPFS
      </label>
      <input id="IPFS" name="IPFS"
        type="text"
        required
      >
      <input type="submit" value="Login">
    </form>
  </body>
    `
    function onsubmit (e) {                                              
        e.preventDefault()
        var form = e.currentTarget
        var data = new FormData(form)                                       // 2.
        var headers = new Headers({ 'Content-Type': 'application/json' })   // 3.
        var body = {}
        for (var pair of data.entries()) body[pair[0]] = pair[1]            // 4.
        // body = JSON.stringify(body)                                         // 5.
        // console.log(body);
        // console.log(userid);
        // console.log(userid,body['Name'],body['IPFS']);
        addressBook.addAddress(ipfs1,userid.toString(),body['Name'].toString(),body['IPFS'].toString());
        contacts=addressBook.getAddressBook(ipfs1,userid.toString());
        contacts.then((result)=>{
            console.log(result)
        });
      }
  }
function mainView (state, emit) {
    let messages = state.messages
    let peers = []
    
    if(room1)
        peers = room1.getPeers()

    return html`
      <body>
        <h3>Connected Peers</h3>
        <ol>
        ${peers.map((peer , i)=>{
            return html`
                <li>${peer}</li>
            `
        })}
        </ol>
        <hr>
        <h3>Chat</h3>
        <ul id="inbox" style="list-style-type:none;">
        ${messages.map((msg , i)=>{
            tmsg = gdf.gdf_decode(msg)
            let sender
            if(tmsg.sender == userid)
                sender = "ME"
            else
                sender = tmsg.sender
            return html`
                <li>${sender} : ${tmsg.message}</li>
            `
        })}
        </ul>
        <hr>
        <form id="login" onsubmit=${onsubmit}>
        <label for="message">
            Enter Message:
        </label>
        <input id="message" name="message"
            type="text"
            required
        >
        <input type="submit" value="Send">
        </form>
        <hr>
        <a href='/handshake'>Address Book</a>
      </body>
    `
    function onsubmit(e){
        e.preventDefault();
        let form = e.currentTarget
        let data = new FormData(form)

        room1.broadcast(gdf.gdf_encode(data.get("message") , userid))
    }

}
let ipfs1
let room1 = null
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

        ipfs1=ipfs
        app.push
            
        ipfs.once('ready', () => ipfs.id((err, info) => {
        if (err) { throw err }
        console.log('IPFS node ready with address ' + info.id)
        userid=info.id
        const room = ROOM(ipfs, 'Room1')

        room1 = room
        
        room.on('peer joined', (peer) => emitter.emit("render"))
        room.on('peer left', (peer) => emitter.emit("render"))
        
        room.on('message', async (message) => {
            state.messages.push(message.data.toString())
            emitter.emit("render")
        })
        
        
        // setInterval(() => room.broadcast(gdf.gdf_encode('hey everyone!' + Math.random())), 2000)
        }))
    })
}
