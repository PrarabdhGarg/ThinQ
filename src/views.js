const html = require('choo/html')
const gdf = require('./gdf')
const addressBook = require('./addressbook')

function mainView(state, emit) {
    let messages = state.messages
    let peers = []

    if(state.room)
        peers = state.room.getPeers()

    function onsubmit(e) {
        e.preventDefault();
        let form = e.currentTarget
        let data = new FormData(form)

        state.room.broadcast(gdf.gdf_encode(data.get("message") , state.userid))
    }

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
            if(tmsg.sender == state.userid)
                sender = "ME"
            else if(state.addressBook[tmsg.sender])
                sender = state.addressBook[tmsg.sender]
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
}

function handshakeForm(state, emit) {
    function onsubmit(e) {
        e.preventDefault()
        var form = e.currentTarget
        var data = new FormData(form)
        var body = {}
        for (var pair of data.entries()) body[pair[0]] = pair[1]
        addressBook.addAddress(state.ipfs, state.userid.toString(), body['Name'].toString(), body['IPFS'].toString());
        addressBook.getAddressBook(state.ipfs, state.userid.toString()).then((res)=>{
            state.addressBook = res
        });
    }

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
        <a href='/'>Chat Box</a>
    </body>
    `
}

module.exports = {
    mainView: mainView,
    handshakeForm: handshakeForm
}