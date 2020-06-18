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

router.get('/cRequests' , (req , res)=>{
    global.ClosedRequest.findAll({where: {status: "created"}}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
                
            res.render('request.ejs' , {requestType: "Created" , requests:requests})
        })
        
    })
})

router.get('/c_sp_Requests' , (req , res)=>{
    global.ClosedRequest.findAll({where: {status: "created"}}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
                
            res.render('request.ejs' , {requestType: "CreatedSP" , requests:requests})
        })
        
    })
})

router.get('/spackRequests' , (req , res)=>{
    global.ClosedRequest.findAll({where: {status: "sp_ack"}}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
                
            res.render('request.ejs' , {requestType: "SP_Acknowledged" , requests:requests})
        })
        
    })
})

router.get('/cackRequests' , (req , res)=>{
    global.ClosedRequest.findAll({where: {status: "c_ack"}}).then((requests)=>{
        let promises = []
        for(request of requests)
            promises.push(global.User.findOne({where: {ipfs:request.dataValues.sender}}))

        Promise.all(promises).then((users)=>{
            for(let i=0 ; i<requests.length ; i++)
                requests[i].dataValues.sender = users[i].dataValues.name
                
            res.render('request.ejs' , {requestType: "Resolved" , requests:requests})
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
    global.node.id().then((info)=>{
        documentPath='/ratings/' + info.id.toString() + '.txt'
    global.node.files.write(documentPath, Buffer.from(info.id.toString()+'|0|0'), {
        create: true,
        parents: true
        }, (err, res) => {
         if(err) {
            console.log("--------------------------Error in inserting file " + err.message)
        } 
        else {
        global.node.files.stat(documentPath, (err, respon) => {
        if(err) {
            // console.log("Error in inserting rating" + err.message)
        }
        console.log('Stat Result = ' + JSON.stringify(respon))
        hash = respon.hash
        console.log('File Hash = ' + hash)
       
            
            global.User.update({ratinghash:hash,rating:'0'},{where: {ipfs:info.id}}).then((result)=>{
                console.log("results of filehash is :",result)
            })
        })
    }
        })
        })
        

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
    console.log("Node id is:",nodeid['id'])
    global.User.findAll({}).then((contacts)=>{
        let promises = []
        let flag
        if(contacts.length==0)
            res.json([])
        for(let i=0 ; i<contacts.length ; i++) {
            contacts[i] = contacts[i].dataValues
            promises.push(global.node.get(contacts[i].bio))
        }
        for(let i=0 ; i<contacts.length ; i++) {
            let responses = []
            // contacts[i] = contacts[i].dataValues
            documentPath = '/ratings/' + contacts[i].ipfs + '.txt'
            global.node.files.read(documentPath
                , (err, res) => {
                    if(err) {
                        console.log("Error in reading file for addressbook:",err.toString())
                   } 
                   else {
                    console.log("the response of read is:",res)
                    responses.push(res)
                    Promise.all(responses).then((results)=>{
                        console.log("Results are",results[0].toString())
                        prevrating=results[0].toString()
                        if(prevrating !== undefined)
                        {   
                            contacts[i].rating = prevrating.split("|")[1].toString()
                            console.log("Rating passed form getAddress is:",contacts[i].rating)
                            global.User.update({rating:contacts[i].rating},{where: {ipfs:contacts[i].ipfs}}).then((result)=>{
                                // console.log("results of filehash is :",result)
                            })
                        }
                        else
                        {   
                            console.log("Entering else condition in getAddress")
                        }
                    })
                }
        })
    }
        Promise.all(promises).then((bios)=>{
            for(let i=0; i<contacts.length ; i++)
                {
                contacts[i].bio = bios[i][0].content.toString()
                console.log("Rating passed form getAddress final is:",contacts[i].rating)
                }
                // contacts = contacts.filter((value , index , arr)=>{
                //     return !(value.ipfs==nodeid.id)
                // })
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

router.get('/updateType' , (req , res)=>{
    global.node.id().then((info)=>{
        global.User.findOne({where:{ipfs:info.id}}).then((user)=>{
            global.node.get(user.dataValues.filehash).then(([file])=>{
                let user_info = JSON.parse(file.content.toString())
                user_info.type = user_info.type==1? 2 : 1
                global.node.add(JSON.stringify(user_info)).then(([stat])=>{
                    global.User.update({filehash:stat.hash.toString() , type:user_info.type} , {where:{ipfs:info.id}}).then((result)=>{
                        message.broadcastMessageToAddressBook({
                            sender: info.id,
                            action: messageAction.UPDATE,
                            message: stat.hash.toString(),
                            messageType: 'Type'
                        }).then((result)=>{
                            res.json({type:user_info.type})
                        })
                    })
                })
            })
        })
    })
})

router.post('/deleteRequest' , (req , res)=>{
    global.User.findOne({where: {name:req.body.sender}}).then((sender)=>{
        global.SentRequest.destroy({where: {sender: sender.dataValues.ipfs}}).then((result)=>{
            global.node.id().then((info)=>{
                message.sendMessageToUser({
                    sender: info.id,
                    recipient: sender.dataValues.ipfs,
                    action: messageAction.DELETE
                } , sender.dataValues.ipfs).then((result)=>{
                    res.json({success : true})
                })
            })
        })
    })
})

router.post('/createcRequest' , function(req , res){
    global.User.findOne({where: {name:req.body.sender}}).then((sender)=>{
    global.SentRequest.destroy({where: {sender: sender.dataValues.ipfs}}).then((result)=>{
    global.ClosedRequest.create({sender:sender.dataValues.ipfs , status: "created"}).then((result)=>{   
        global.node.id().then((info)=>{
            message.sendMessageToUser({
                sender: info.id,
                recipient: sender.dataValues.ipfs,
                action: messageAction.C_CREATE
            } , sender.dataValues.ipfs).then((result)=>{
                res.json({success : true})
            })
        })
    })
})
})
})

router.post('/sp_ack_cRequest' , function(req , res){
    global.User.findOne({where: {name:req.body.sender}}).then((sender)=>{
        console.log("The reciever file name is:",sender.dataValues.ipfs)
        console.log("Document path is ack is",documentPath)
        let prevrating
        let flag
        let rating
        let transactions
        let promises = []
            // promises.push(global.node.files.read(documentPath))
            documentPath = '/ratings/' + sender.dataValues.ipfs.toString() + '.txt'
            global.node.files.read(documentPath
                , (err, res) => {
                    if(err) {
                        rating=req.body.userRating
                        transactions=1
                        global.node.files.write(documentPath, Buffer.from(sender.dataValues.ipfs+ '|'+ rating+ '|' +transactions), {
                            create: true,
                            parents: true
                            }, (err, res) => {
                             if(err) {
                                console.log("--------------------------Error in inserting file " + err.message)
                            } 
                            else {
                            global.node.files.stat(documentPath, (err, respon) => {
                            if(err) {
                                console.log("Error in inserting rating" + err.message)
                            }
                            console.log('Stat Result = ' + JSON.stringify(respon))
                            hash = respon.hash
                            console.log('File Hash = ' + hash)
                            })
                            }
                            })
                   } 
                   else {
                    promises.push(res)
                    // flag=0
                    Promise.all(promises).then((results)=>{
                        console.log("Reults are",results[0].toString())
                        prevrating=results[0].toString()
                        if(prevrating !== undefined)
                        {   
                            console.log("Entering if condition")
                            console.log("previous rating is:",parseFloat((prevrating.split("|")[1])))
                            console.log("Rating provided is:",parseInt(req.body.userRating))
                            rating=(parseFloat((prevrating.split("|")[1])*parseInt(prevrating.split("|")[2])+parseInt(req.body.userRating)))/(parseInt(prevrating.split("|")[2])+1)
                            transactions=parseInt(prevrating.split("|")[2])+1
                            console.log("New rating is:",rating)
                            console.log("transaction number is",transactions)
                        }
                        else
                        {   
                            console.log("Entering else condition")
                            rating=req.body.userRating
                            transactions=1
                        }
                        global.node.files.write(documentPath, Buffer.from(prevrating.split("|")[0]+ '|'+rating + '|' + transactions), {
                            create: true,
                            parents: true
                            }, (err, res) => {
                             if(err) {
                                console.log("Error in inserting file " + err.message)
                            } 
                            else {
                            global.node.files.stat(documentPath, (err, respon) => {
                            if(err) {
                                console.log("Error in inserting rating" + err.message)
                            }
                            console.log('Stat Result = ' + JSON.stringify(respon))
                            hash = respon.hash
                            global.User.update({ratinghash:hash},{where: {ipfs:sender.dataValues.ipfs}}).then((result)=>{
                                console.log("The updated hash spack is:",hash)
                            })
                            console.log('File Hash = ' + hash)
                            })
                            }
                            })
                })
                   }
                   })
    global.ClosedRequest.update({status:"sp_ack"},{where: {sender:sender.dataValues.ipfs , status: "created"}}).then((result)=>{   
        global.node.id().then((info)=>{
            message.sendMessageToUser({
                sender: info.id,
                recipient: sender.dataValues.ipfs,
                action: messageAction.SP_ACK,
                rating:rating.toString(),
                transact:transactions.toString()
            } , sender.dataValues.ipfs).then((result)=>{
                res.json({success : true})
            })
        })
    })
})
})

router.post('/c_ack_cRequest' , function(req , res){
    global.User.findOne({where: {name:req.body.sender}}).then((sender)=>{
        console.log("The reciever file name is:",sender.dataValues.ipfs)
        documentPath = '/ratings/' + sender.dataValues.ipfs.toString() + '.txt'
        console.log("Document path is ack is",documentPath)
        let prevrating
        let flag
        let rating
        let transactions
        let promises = []
            // promises.push(global.node.files.read(documentPath))
            global.node.files.read(documentPath
                , (err, res) => {
                    if(err) {
                        rating=req.body.userRating
                        transactions=1
                        global.node.files.write(documentPath, Buffer.from(sender.dataValues.ipfs+ '|' +rating + '|' + transactions), {
                            create: true,
                            parents: true
                            }, (err, res) => {
                             if(err) {
                                console.log("--------------------------Error in inserting file " + err.message)
                            } 
                            else {
                            global.node.files.stat(documentPath, (err, respon) => {
                            if(err) {
                                console.log("Error in inserting rating" + err.message)
                            }
                            console.log('Stat Result = ' + JSON.stringify(respon))
                            hash = respon.hash
                            console.log('File Hash = ' + hash)
                            })
                            }
                            })
                   } 
                   else {
                    promises.push(res)
                    // flag=0
                    Promise.all(promises).then((results)=>{
                        console.log("Results are",results[0].toString())
                        prevrating=results[0].toString()
                        if(prevrating !== undefined)
                        {   
                            console.log("Entering if condition")
                            console.log("previous rating is:",parseFloat((prevrating.split("|")[0])))
                            console.log("Rating provided is:",parseInt(req.body.userRating))
                            rating=(parseFloat((prevrating.split("|")[1])*parseInt(prevrating.split("|")[2])+parseInt(req.body.userRating)))/(parseInt(prevrating.split("|")[2])+1)
                            transactions=parseInt(prevrating.split("|")[2])+1
                            console.log("New rating is:",rating)
                            console.log("transaction number is",transactions)
                        }
                        else
                        {   
                            console.log("Entering else condition")
                            rating=req.body.userRating
                            transactions=1
                        }
                        global.node.files.write(documentPath, Buffer.from(prevrating.split("|")[0]+ '|' +rating + '|' + transactions), {
                            create: true,
                            parents: true
                            }, (err, res) => {
                             if(err) {
                                console.log("Error in inserting file " + err.message)
                            } 
                            else {
                            global.node.files.stat(documentPath, (err, respon) => {
                            if(err) {
                                console.log("Error in inserting rating" + err.message)
                            }
                            console.log('Stat Result = ' + JSON.stringify(respon))
                            hash = respon.hash
                            global.User.update({ratinghash:hash},{where: {ipfs:sender.dataValues.ipfs}}).then((result)=>{
                                console.log("The updated hash cack is:",hash)
                            })
                            console.log('File Hash = ' + hash)
                            })
                            }
                            })
                })
                   }
                   })
                // responses.push(global.node.files.read(documentPath))
            
            // Promise.all(promises).then((results)=>{
            //         console.log("Reults are",results[0].toString())
            //         prevrating=results[0].toString()
            //         if(prevrating !== undefined)
            //         {   
            //             console.log("Entering if condition")
            //             console.log("previous rating is:",parseFloat((prevrating.split("|")[0])))
            //             console.log("Rating provided is:",parseInt(req.body.userRating))
            //             rating=(parseFloat((prevrating.split("|")[0])*parseInt(prevrating.split("|")[1])+parseInt(req.body.userRating)))/(parseInt(prevrating.split("|")[1])+1)
            //             transactions=parseInt(prevrating.split("|")[1])+1
            //             console.log("New rating is:",rating)
            //             console.log("transaction number is",transactions)
            //         }
            //         else
            //         {   
            //             console.log("Entering else condition")
            //             rating=req.body.userRating
            //             transactions=1
            //         }
            //         global.node.files.write(documentPath, Buffer.from(rating + '|' + transactions), {
            //             create: true,
            //             parents: true
            //             }, (err, res) => {
            //              if(err) {
            //                 console.log("Error in inserting file " + err.message)
            //             } 
            //             else {
            //             global.node.files.stat(documentPath, (err, respon) => {
            //             if(err) {
            //                 console.log("Error in inserting rating" + err.message)
            //             }
            //             console.log('Stat Result = ' + JSON.stringify(respon))
            //             hash = respon.hash
            //             console.log('File Hash = ' + hash)
            //             })
            //             }
            //             })
            // })
        global.ClosedRequest.update({status:"c_ack"},{where: {sender:sender.dataValues.ipfs , status: "sp_ack"}}).then((result)=>{    
        global.node.id().then((info)=>{
            message.sendMessageToUser({
                sender: info.id,
                recipient: sender.dataValues.ipfs,
                action: messageAction.C_ACK,
                rating:rating.toString(),
                transact:transactions.toString()
            } , sender.dataValues.ipfs).then((result)=>{
                res.json({success : true})
            })
        })
    })
})
})

router.post('/spcreatecRequest' , function(req , res){
    global.User.findOne({where: {name:req.body.sender}}).then((sender)=>{
    global.PendingRequest.destroy({where: {sender: sender.dataValues.ipfs}}).then((result)=>{
    global.ClosedRequest.create({sender:sender.dataValues.ipfs , status: "sp_ack"}).then((result)=>{   
        global.node.id().then((info)=>{
            message.sendMessageToUser({
                sender: info.id,
                recipient: sender.dataValues.ipfs,
                action: messageAction.SP_C_CREATE
            } , sender.dataValues.ipfs).then((result)=>{
                res.json({success : true})
            })
        })
    })
})
})
})


module.exports = router
