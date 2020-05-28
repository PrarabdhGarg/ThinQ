const axios = require('axios')

async function addRecord(sender , message , recipient) {
    axios.post('http://localhost:3001/insertrecord', {
        sender: sender,
        message: message,
        reciver: recipient
    })
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res)
    })
    .catch((error) => {
        console.error(error)
    })
}

async function addQueue(sender , message , recipient) {
    axios.post('http://localhost:3001/insertqueue', {
        sender: sender,
        message: message,
        reciver: recipient
    })
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res)
    })
    .catch((error) => {
        console.error(error)
    })
}

async function getRecords(recipient){
    let chat_hist = (await axios.get(`http://localhost:3001/getrecord/${recipient}`)).data

    return JSON.parse(chat_hist)
}

async function getQueue(){
    let queue = (await axios.post('http://localhost:3001/getqueue')).data

    return JSON.parse(queue)
}

module.exports = {
    addRecord: addRecord,
    addQueue: addQueue,
    getRecords: getRecords,
    getQueue: getQueue
}