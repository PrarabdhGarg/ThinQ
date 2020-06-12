const express = require('express');
var router = express.Router();
const userInfo = require('./userInfo')

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

router.post('/init' , async function(req , res){
    let init_info = req.body
    await userInfo.createUserRecord(init_info)
    res.redirect('/contacts')
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
            console.log(JSON.stringify(user_info))
            res.json(user_info)
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