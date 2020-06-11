const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const http = require('http')
const ipfs = require('./ipfs')
const db = require('../models/database')
const cryptography = require('./cryptography')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/' , function(req, res) {
    global.node.id().then((info)=>{
        global.User.findOne({where: {ipfs: info.id}}).then((info)=>{
            if(info==null)
                res.render('login')
            else
                res.redirect('/contacts')
        })
    })
})

app.post('/init' , function(req , res){
    let init_info = req.body
    global.node.id().then((info)=>{
        await cryptography.generateKeys()
        let public_key = cryptography.getPublicKey()
        global.node.add(public_key).then(([stat]) => {
            init_info['PublicKey'] = stat.hash.toString()
            init_info['IPFSHash'] = info.id.toString()
            global.node.add(JSON.stringify(init_info)).then(([stat])=>{
                console.log('File hash = ' + stat.hash.toString())
                global.User.create({name:init_info.name , ipfs:info.id , bio:init_info.bio , type:init_info.user , filehash:stat.hash.toString()}).then((result)=>{
                    res.redirect('/contacts')
                })
            })
        })
    })
})

app.get('/contacts' , function(req , res){
    global.node.id().then((info)=>{
        global.User.findOne({where : {ipfs:info.id}}).then((result)=>{
            res.render("addressbook" , {name:result.dataValues.name , type:result.dataValues.type , bio:result.dataValues.bio})
        })
    })
})

let server = http.createServer(app)
server.listen(3000, () => {
    ipfs.initializeIPFS()
    global.User.sync({force: false}).then(() => {
        console.log('USER table created')
    })
})