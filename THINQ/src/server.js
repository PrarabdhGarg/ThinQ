const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const http = require('http')
const ipfs = require('./ipfs')
const db = require('../models/database')
const Sequelize = require('sequelize')
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
    global.node.id().then(async (info)=>{
        await cryptography.generateKeys()
        let public_key = cryptography.getPublicKey()
        Promise.all([global.node.add(public_key) , global.node.add(req.body.bio)]).then((stats) => {
            init_info['PublicKey'] = stats[0][0].hash.toString()
            init_info['IPFSHash'] = info.id.toString()
            init_info['bio'] = stats[1][0].hash.toString()
            console.log(JSON.stringify(init_info))
            global.node.add(JSON.stringify(init_info)).then(([stat])=>{
                console.log('File hash = ' + stat.hash.toString())
                global.User.create({name:init_info.name , ipfs:info.id , bio:init_info.bio , type:init_info.type , filehash:stat.hash.toString()}).then((result)=>{
                    res.redirect('/contacts')
                })
            })
        })
    })
})

app.get('/contacts' , function(req , res){
    global.node.id().then((info)=>{
        global.User.findOne({where : {ipfs:info.id}}).then((result)=>{
            global.node.get(result.dataValues.bio).then(([bio])=>{
                res.render("addressbook" , {filehash:result.dataValues.filehash , name:result.dataValues.name , type:result.dataValues.type , bio:bio.content.toString()})
            })
        })
    })
})

app.get('/getAddress' , async function(req , res){
    let nodeid = await global.node.id()
    global.User.findAll({}).then((contacts)=>{
        let promises = []

        if(contacts.length==0)
            res.json([])

        for(let i=0 ; i<contacts.length ; i++)
        {
            contacts[i] = contacts[i].dataValues
            promises.push(global.node.get(contacts[i].bio))
        }

        Promise.all(promises).then((bios)=>{
            for(let i=0; i<contacts.length ; i++)
                contacts[i].bio = bios[i][0].content.toString() 
            
            contacts = contacts.filter((value , index , arr)=>{
                return !(value.ipfs==nodeid.id)
            })
            res.json(contacts)
        })
    })
})

app.post('/addAddress' , function(req , res){
    global.node.get(req.body.id).then(([info])=>{
        let user_info = JSON.parse(info.content.toString())
        global.User.create({type:user_info.type , name:req.body.name , filehash:req.body.id , ipfs:user_info.IPFSHash , bio:user_info.bio})
        user_info['name'] = req.body.name
        global.node.get(user_info.bio).then(([bio])=>{
            user_info['bio'] = bio.content.toString()
            console.log(JSON.stringify(user_info))
            res.json(user_info)
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