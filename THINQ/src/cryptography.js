const openpgp = require('openpgp')
const fs = require('fs')

async function generateKeys() {
    try {
        global.privateKey = fs.readFileSync('./.private.txt')
        global.publicKey = fs.readFileSync('./.public.txt')
    } catch(e) {
        const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
            userIds: [{ name: 'Prarabdh Garg', email: 'f20180198@pilani.bits-pilani.aac.in' }],
            curve: 'ed25519',
            passphrase: 'super long and hard to guess secret'
        });
        console.log(privateKeyArmored);
        console.log(publicKeyArmored);
        console.log(revocationCertificate);
        fs.writeFileSync('./.private.txt', privateKeyArmored)
        fs.writeFileSync('./.public.txt', publicKeyArmored)
        fs.writeFileSync('./.revoce.txt', revocationCertificate)
        global.privateKey = privateKeyArmored
        global.publicKey = publicKeyArmored
    }
}

function getPublicKey() {
    return fs.readFileSync('./.public.txt')
}

async function getEncryptedText(text, publicKey) {
    const { data: encrypted } = await openpgp.encrypt({
        message: openpgp.message.fromText(text),
        publicKeys: (await openpgp.key.readArmored(publicKey)).keys
    })
    console.log(encrypted)
    return encrypted
}

async function getDecryptedText(encrypted) {
    passphrase = 'super long and hard to guess secret'
    privKey = fs.readFileSync('./.private.txt')
    const { keys: [privateKey] } = await openpgp.key.readArmored(privKey);
    await privateKey.decrypt(passphrase);
    const { data: decrypted } = await openpgp.decrypt({
        message: await openpgp.message.readArmored(encrypted),
        privateKeys: [privateKey]
    });
    console.log(decrypted);
    return decrypted
}

module.exports = {
    generateKeys: generateKeys,
    getDecryptedText: getDecryptedText,
    getEncryptedText: getEncryptedText,
    getPublicKey: getPublicKey
}