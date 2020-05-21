const md5 = require("md5")

gdf_encode = (message="empty" , sender="Anon" , recipient="Anon") => {
    let uid = md5(sender.concat(message , recipient));
    let gdf = uid.concat("|" , sender , "|USER|" , message , "|MESSAGE|" , recipient , "|USER");
    return gdf;
}

gdf_decode = (gdf_msg) => {
    let msg = new Object();

    msg_arr = gdf_msg.split("|")

    msg.uid = msg_arr[0]
    msg.sender = msg_arr[1]
    msg.message = msg_arr[3]
    msg.recipient = msg_arr[5]

    return msg;
}

exports.gdf_decode = gdf_decode
exports.gdf_encode = gdf_encode