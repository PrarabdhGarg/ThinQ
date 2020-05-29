var models  = require('../../models');
const express = require('express');
var router = express.Router();

router.post('/insertrecord', function(req, res) {
    models.chatRecord.create({ sender: req.body.sender, message: req.body.message,recipient:req.body.reciver }).then(function(chatrecord) {
        console.log("Record inserted in db");
        res.json(chatrecord);
      }).catch((error) => {
        console.error(error)
    })
});

router.post('/insertqueue', function(req, res) {
    models.messageQueue.create({ sender: req.body.sender, message: req.body.message,recipient:req.body.reciver }).then(function(messagequeue) {
        console.log("Record inserted in queue");
        res.json(messagequeue);
      }).catch((error) => {
        console.error(error)
    })
});

router.get('/getrecord/:recip', function(req, res) {
    models.chatRecord.findAll({ where: { [Op.or]: [{recipient: req.params.recip} , {sender: req.params.recip}] } }).then(function(chats) {
        res.json(chats);
      }).catch((error) => {
        console.error(error)
    })
});

router.get('/getqueue', function(req, res) {
    models.messageQueue.findAll().then(function(messageQueues) {
        res.json(messageQueues);
      }).catch((error) => {
        console.error(error)
    })
});


module.exports = router;