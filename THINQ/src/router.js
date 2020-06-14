const express = require('express');
var router = express.Router();
const userInfo = require('./userInfo')
const messageAction = require('./messageAction')
const message = require('./message')

router.get('/' , function(req, res) {
    global.node.id().then((info)=>{
        global.User.findOne({where: {ipfs: info.id}}).then((info)=>{
            if(info==null)
                res.render('login')
            else
                res.redirect('/contacts')
        })
    })
})

router.get('/sentRequests' , (req , res)=>{
    global.SentRequest.findAll({}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
                
            res.render('request.ejs' , {requestType: "Sent" , requests:requests})
        })
        
    })
})

router.get('/pendingRequests' , (req , res)=>{
    global.PendingRequest.findAll({}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
            
            res.render('request.ejs' , {requestType: "Pending" , requests:requests})
        })
        
    })
})

router.post('/init' , async function(req , res){
    let init_info = req.body
    userInfo.createUserRecord(init_info , res)
})

router.get('/contacts' , function(req , res){
    global.node.id().then((info)=>{
        global.User.findOne({where : {ipfs:info.id}}).then((result)=>{
            global.node.get(result.dataValues.bio).then(([bio])=>{
                res.render("addressbook" , {filehash:result.dataValues.filehash , name:result.dataValues.name , type:result.dataValues.type , bio:bio.content.toString()})
            })
        })
    })
})

router.get('/getAddress' , async function(req , res){
    let nodeid = await global.node.id()
    global.User.findAll({}).then((contacts)=>{
        let promises = []
        if(contacts.length==0)
            res.json([])

        for(let i=0 ; i<contacts.length ; i++) {
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

router.post('/addAddress' , function(req , res){
    global.node.get(req.body.id).then(([info])=>{
        let user_info = JSON.parse(info.content.toString())
        global.User.create({type:user_info.type , name:req.body.name , filehash:req.body.id , publicKey:user_info.PublicKey , ipfs:user_info.IPFSHash , bio:user_info.bio})
        user_info['name'] = req.body.name
        global.node.get(user_info.bio).then(([bio])=>{
            user_info['bio'] = bio.content.toString()
            user_info['ipfs'] = user_info['IPFSHash']
            console.log(JSON.stringify(user_info))
            res.json(user_info)
        })
    })
})

router.post('/addRequest' , function(req , res){
    global.SentRequest.create({sender:req.body.ipfs , status: "Unused"}).then((result)=>{
        
        global.node.id().then((info)=>{
            let msg = {
                sender : info.id,
                recipient: req.body.ipfs,
                action: messageAction.REQUEST
            }
            console.log(req.body.ipfs)
            message.sendMessageToUser(msg , req.body.ipfs ).then((result)=>{
                res.json({success:true})
            })
        })
    })
})

router.post('/updateBio', (req, res) => {
    let updatedBio = req.body.bio
    userInfo.updateBio(updatedBio).then(() => {
        res.json(updatedBio)
    })
})

module.exports = router