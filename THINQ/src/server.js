const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const http = require('http')
const ipfs = require('./ipfs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/' , function(req, res) {
    res.render('addressbook')
})

let server = http.createServer(app)
server.listen(3000, () => {
    ipfs.initializeIPFS()
})