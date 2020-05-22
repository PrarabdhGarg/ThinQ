const fs = require('fs');


async function addAddress(ipfs_user,name,ipfs_contact) {
    try {
        if(fs.existsSync('/addressbooks/'+ipfs_user+'.txt')) {
            fs.appendFile('/addressbooks/'+ipfs_user+'.txt',name+':'+ipfs_contact, (error) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log('Contact added to addressbook');
                }
              });
        } 
        else 
        {
            fs.writeFile('/addressbooks/'+ipfs_user+'.txt',name+':'+ipfs_contact, (error) => {
                if (error) 
                {
                  console.error(error);
                }
                 else 
                {
                  console.log('file created!');
                }
         });
        } 
    }
    catch (err) 
    {
        console.error(err);
    }

}
async function getAddressBook(ipfs){
    const chunks = []
    try {
        for await (const chunk of ipfs.files.read('/addressbooks/'+ipfs+'.txt')) {
            chunks.push(chunk)
        }
    } catch (e) {
        console.log(e.toString())
    }

    let addressbook = Buffer.concat(chunks).toString();
    return addressbook;
}

module.exports={addAddress:addAddress,getAddressBook:getAddressBook}