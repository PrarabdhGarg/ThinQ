const fs = require('fs');
function handshakeForm(state, emit) {
    return html`
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contact List</title>
      <link rel="stylesheet" href="public/css/index.css">
    </head>
    <body>
      <h1>Add user to contact list</h1>
      <form action="/contact" method="POST" id="form">
          <div>
            <label for="Name">Name:</label>
            <input type="text" name="email" />
          </div>
          <div>
            <label for="IPFS">IPFS:</label>
            <input type="text" name="IPFS" />
          </div>
          <button type="submit">Submit</button>
      </form>
      <script type="text/javascript" src="public/js/index.js"></script>
      <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
      </body>
      </html>
    `
  }

async function addAddress(ipfs,ipfs_user,name,ipfs_contact) {
    // try {
    //     if(fs.existsSync('/addressbooks/'+ipfs_user+'.txt')) {
    //         fs.appendFile('/addressbooks/'+ipfs_user+'.txt',name+':'+ipfs_contact, (error) => {
    //             if (error) {
    //               console.error(error);
    //             } else {
    //               console.log('Contact added to addressbook');
    //             }
    //           });
    //     } 
    //     else 
    //     {
    //         fs.writeFile('/addressbooks/'+ipfs_user+'.txt',name+':'+ipfs_contact, (error) => {
    //             if (error) 
    //             {
    //               console.error(error);
    //             }
    //              else 
    //             {
    //               console.log('file created!');
    //             }
    //      });
    //     } 
    // }
    // catch (err) 
    // {
    //     console.error(err);
    // }
    // const chunks = []
    // try {
    //     for await (const chunk of ipfs.files.read('/addressbooks/'+ipfs_user+'.txt')) {
    //         chunks.push(chunk)
    //     }
    // } catch (e) {
    //     console.log('abcd');
    //     console.log(e.toString())
    // }
    // console.log('efgh')
    // await ipfs.files.write('/addressbooks/'+ipfs_user+'.txt', Buffer.concat(chunks).toString() + name+':'+ipfs_contact , {
    //     create: true,
    //     parents: true
    // })
    // console.log('File Status = ' + Buffer.concat(chunks).toString())
    
    
    // const data=name+':'+ipfs_contact
    // data.toString()
    // ipfs.files.add(new Buffer(data, "binary") ,(err,hash)=>{
    //     if(err)
    //     {
    //         return console.log(err);
    //     }
    //     console.log(hash);
    // });

    documentPath = '/addressbooks/'+ipfs_user+'.txt'
    let contactlist
    let flag
    try {
        contactlist = await ipfs.files.read(documentPath)
        console.log("File = " + contactlist)
        flag=true
    } catch(e) {
        flag=false
        console.log(e.toString())
    }

    if(flag==true)
    {
    res = await ipfs.files.write(documentPath, Buffer.from(contactlist +name+':'+ipfs_contact+'|'), {
        create: true,
        parents: true
    }, (err, res) => {
        // console.log('Result of add1 = ' + res)
        // console.log('Error of add1' + JSON.stringify(err))
    })
}
else{
    res = await ipfs.files.write(documentPath, Buffer.from(name+':'+ipfs_contact+'|'), {
        create: true,
        parents: true
    }, (err, res) => {
        // console.log('Result of add1 = ' + res)
        // console.log('Error of add1' + JSON.stringify(err))
    })
}

}


async function getAddressBook(ipfs1,ipfs){
    // const chunks = []
    // try {
    //     for await (const chunk of ipfs.files.read('/addressbooks/'+ipfs+'.txt')) {
    //         chunks.push(chunk)
    //         console.log(chunk)
    //     }
    // } catch (e) {
    //     console.log(e.toString())
    // }

    // let addressbook = Buffer.concat(chunks).toString();
    // return addressbook;
    addressbook=[]
    documentPath = '/addressbooks/'+ipfs+'.txt'
    let contactlist
    try {
        contactlist = await ipfs1.files.read(documentPath)
        console.log("File = " + (contactlist+'').split("|"))
    } catch(e) {
        console.log(e.toString())
    }
    addressbook = (contactlist+'').split("|")

    return addressbook
}

module.exports={addAddress:addAddress,getAddressBook:getAddressBook}
