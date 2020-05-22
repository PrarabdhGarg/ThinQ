const IPFS = require('ipfs')
const html = require('choo/html')
const choo = require('choo')
const ROOM = require('ipfs-pubsub-room')
const gdf = require('./gdf')
// const recordChat = require('./record_chat')
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
        console.log(body);
        console.log(userid);
        // console.log(userid,body['Name'],body['IPFS']);
        addressBook.addAddress(ipfs1,userid.toString(),body['Name'].toString(),body['IPFS'].toString());
        // console.log(getAddressBook(userid));
      }
  }
// const bodyParser = require('body-parser');
// app1.listen(3000);
// // Allows us to parse url forms.Attaches the data to request body.Extended option false as currently only dealing with strings
// app1.use(bodyParser.urlencoded({ extended: false }));
// // In app.post give route same as action field in form tag of html
// app1.post('/contact',(req,res)=>{
//   console.log(req.body);
//   addAddress(userid,req.body.name,req.body.IPFS);
//   console.log(getAddressBook(userid));
//   res.send('successfully posted data');
// });
function mainView (state, emit) {
    return html`
      <body>
        <a href='/handshake'>Open handshake web</a>
      </body>
    `
}
let ipfs1
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

        ipfs1=ipfs
        app.push
            
        ipfs.once('ready', () => ipfs.id((err, info) => {
        if (err) { throw err }
        console.log('IPFS node ready with address ' + info.id)
        userid=info.id
        const room = ROOM(ipfs, 'Room1')
        
        room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
        room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))
        
        room.on('message', async (message) => {
            console.log('got message from ' + message.from + ': ' + gdf.gdf_decode(message.data.toString()).message)
            await recordChat.recordChatMessage(ipfs , 'Room1'  , message.data.toString())
        })
        
        
        setInterval(() => room.broadcast(gdf.gdf_encode('hey everyone!' + Math.random())), 2000)
        }))
    })
}
