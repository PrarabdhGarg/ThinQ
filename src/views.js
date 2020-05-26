const html = require('choo/html')
const gdf = require('./gdf')
const addressBook = require('./addressbook')
const ROOM = require('ipfs-pubsub-room')

function mainView(state, emit) {
    let messages = state.messages
    let peers = []

    let participants = [state.userid , state.params[Object.keys(state.params)[0]]]
    participants.sort()

    console.log(`Recipient: ${state.params[Object.keys(state.params)[0]]} Room : ${participants[0]}||${participants[1]}`)

    if(state.recipient!=state.params[Object.keys(state.params)[0]])
    {
        state.recipient = state.params[Object.keys(state.params)[0]]
        state.room = ROOM(state.ipfs, `${participants[0]}||${participants[1]}`)

        state.room.on('peer joined', (peer) => console.log("Joined"))
        // state.room.on('peer left', (peer) => emit("render"))
        state.room.on('message', async (message) => {
            state.messages.push(message.data.toString())
            emit("render")
        })
    }

    function onsubmit(e) {
        e.preventDefault();
        let form = e.currentTarget
        let data = new FormData(form)

        state.room.broadcast(gdf.gdf_encode(data.get("message") , state.userid , state.recipient))
    }

    if(state.room)
        peers = state.room.getPeers()

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
            if(state.recipient == tmsg.sender || state.recipient == tmsg.recipient){
                let sender
                if(tmsg.sender == state.userid)
                    sender = "ME"
                else if(state.addressBook[tmsg.sender])
                    sender = state.addressBook[tmsg.sender]
                else
                    sender = tmsg.sender
                return html`
                    <li>${sender} : ${tmsg.message}</li>
                `
            }
            else
                return html``
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
        <a href='/'>Address Book</a>
      </body>
    `
}

function handshakeForm(state, emit) {
    async function onsubmit(e) {
        e.preventDefault()
        var form = e.currentTarget
        var data = new FormData(form)
        var body = {}
        for (var pair of data.entries()) body[pair[0]] = pair[1]
        await addressBook.addAddress(state.ipfs, state.userid.toString(), body['Name'].toString(), body['IPFS'].toString());
        addressBook.getAddressBook(state.ipfs, state.userid.toString()).then((res)=>{
            state.addressBook = res
            emit("render")
        });
    }

    contactlist = state.addressBook

    return html`
    <body>
        <h2>Contacts</h2>
        <ol>
            ${Object.keys(contactlist).map((contact , i)=>{
                return html`
                   <li><a href="/chat/${contact}">${contactlist[contact]}</a></li>
                `
            })}
        </ol>
        <hr>
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
}

module.exports = {
    mainView: mainView,
    handshakeForm: handshakeForm
}