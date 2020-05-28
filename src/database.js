const axios = require('axios')

async function addMessage() {
    axios.post('http://localhost:3001/insert', {
        sender: 'Sender',
        message: 'Text',
        reciver: 'Someone'
    })
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res)
    })
    .catch((error) => {
        console.error(error)
    })
}

module.exports = {
    addMessage: addMessage
}