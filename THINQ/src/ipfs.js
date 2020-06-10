const IPFS = require('ipfs')
const path = require('path')
const Room = require('ipfs-pubsub-room')

async function initializeIPFS() {
    const node = await IPFS.create({
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
    const id = await node.id()
    console.log('IPFS node running with id ', id.id)
    const room = Room(node, 'room1')
    room.on('peer joined', (peer) => {
        console.log(peer + ' Joined')
    })
    global.node = node
    global.room = room
}

module.exports = {
    initializeIPFS: initializeIPFS
}