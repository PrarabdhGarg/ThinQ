const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const Sequelize = require('sequelize')
const cors = require('cors')
const router = require('./router')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use("/", router)

app.listen(3001, () => {
    console.log('Database Server started at port 3001!!!')
    var sequelize = new Sequelize({
        dialect: 'sqlite',
        storage:'/databases/messages.db'
    })
    global.ChatRecord.sync({force: true}).then(() => {
        console.log('Message Record table created')
    })
    global.MessageQueue.sync({force: true}).then(() => {
        console.log('Message Queue Table created')
    })
})