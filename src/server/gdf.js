const md5 = require("md5")

function gdf_encode(message="empty", sender="Anon", recipient="Anon", object_type="Text") {
    let uid = md5(sender.concat(message,  object_type, recipient));
    let gdf = uid.concat("|", sender, "|USER|", message, "|" + object_type.toUpperCase() + "|", recipient, "|USER");
    return gdf;
}

function gdf_decode(gdf_msg) {
    let msg = new Object();
    msg_arr = gdf_msg.split("|")
    msg.uid = msg_arr[0]
    msg.sender = msg_arr[1]
    msg.message = msg_arr[3]
    msg.object_type = msg_arr[5]
    msg.recipient = msg_arr[7]
    return msg;
}

module.exports = {
    gdf_decode: gdf_decode,
    gdf_encode: gdf_encode
}