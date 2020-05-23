async function addAddress(ipfs, ipfs_user, name, ipfs_contact) {
    documentPath = '/addressbooks/' + ipfs_user + '.txt'
    let contactlist
    let flag
    try {
        contactlist = await ipfs.files.read(documentPath)
        console.log("File = " + contactlist)
        flag = true
    } catch(e) {
        flag = false
        console.log(e.toString())
    }

    if(flag == true) {
        res = await ipfs.files.write(documentPath, Buffer.from(contactlist +name+':'+ipfs_contact+'|'), {
            create: true,
            parents: true
        }, (err, res) => {
            // console.log('Result of add1 = ' + res)
            // console.log('Error of add1' + JSON.stringify(err))
        })
    } else {
        res = await ipfs.files.write(documentPath, Buffer.from(name + ':' + ipfs_contact + '|'), {
            create: true,
            parents: true
        }, (err, res) => {
            // console.log('Result of add1 = ' + res)
            // console.log('Error of add1' + JSON.stringify(err))
        })
    }
}


async function getAddressBook(ipfs1, ipfs){
    addressbook=[]
    documentPath = '/addressbooks/' + ipfs + '.txt'
    let contactlist
    try {
        contactlist = await ipfs1.files.read(documentPath)
        console.log("File = " + (contactlist + '').split("|"))
    } catch(e) {
        console.log(e.toString())
    }
    addressbook = (contactlist + '').split("|")
    return addressbook
}

module.exports = {
    addAddress: addAddress,
    getAddressBook: getAddressBook
}
