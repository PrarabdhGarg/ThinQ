var models  = require('../../models');
const express = require('express');
var router = express.Router();
<<<<<<< HEAD
const Sequelize = require('sequelize')
=======
const Op = Sequelize.Op
>>>>>>> 038234e66e6eb31aa2352ec6c14986ec71aad86b

router.get('/' , function(req, res) {
    res.render('addressbook')
})

router.get('/chat/:recip' , function(req , res) {
    res.render('chat')
})

router.get('/getAddress' , function(req , res){
    models.addressRecord.findAll({}).then((result)=>{
        let addressBook = {}
        for(address of result)
            addressBook[address.dataValues.ipfs] = address.dataValues.name
        res.json(addressBook)
    })
})

router.post('/addAddreess', function(req, res) {
    console.log('Entered POST route')
    models.addressRecord.create({ipfs: req.body.ipfs, name: req.body.name}).then((addressRecord) => {
        res.json({name: addressRecord.dataValues.name , ipfs: addressRecord.dataValues.ipfs})
    }).catch((error) => {
        console.log(error)
    })
})

router.post('/insertqueue', function(req, res) {
    models.messageQueue.create({ sender: req.body.sender, message: req.body.message,recipient:req.body.reciver }).then(function(messagequeue) {
        console.log("Record inserted in queue");
        res.json(messagequeue);
      }).catch((error) => {
        res.json(new Object())
    })
});

router.get('/getRecord/:recip', function(req, res) {
    models.chatRecord.findAll({ where: Sequelize.or({recipient: req.params.recip} , {sender: req.params.recip})}).then(function(chats) {
        let messages = {}
        let count = 0
        for(chat of chats){
            messages[count++] = {
                sender : chat.dataValues.sender ,
                message : chat.dataValues.message
            }
        }
        res.json(messages)


router.get('/getqueue', function(req, res) {
    models.messageQueue.findAll().then(function(messageQueues) {
        res.json(messageQueues);
      }).catch((error) => {
        console.error(error)
    })
});


module.exports = router;