const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const router = express.Router()
const sqlite = require('sqlite3')
const Sequelize = require('sequelize')
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

router.post('/insert', (req, res) => {
    var sender = req.body.sender
    var text = req.body.message
    var reciver = req.body.reciver
    console.log('Request = ' + sender + ' ' + text + ' ' + reciver)
    res.end('yes')
})

app.listen(3001, () => {
    console.log('Database Server started at port 3001!!!')
    var sequelize = new Sequelize({
        dialect: 'sqlite',
        storage:'/databases/messages.db'
    })
    var Message = sequelize.define('message', {
        sender: {
            type: Sequelize.STRING
        },
        text: {
            type: Sequelize.STRING
        },
        reciver: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true
    })
})

app.use("/", router);