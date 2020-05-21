const md5 = require("md5")

gdf_encode = (message="empty" , sender="Anon" , recepient="Anon") => {
    let uid = md5(sender.concat(message , recepient));
    let gdf = uid.concat("|" , sender , "|USER|" , message , "|MESSAGE|" , recepient , "|USER");
    return gdf;
}

gdf_decode = (gdf_msg) => {
    let msg = new Object();

    let currp = 0;
    let prevp = 0;

    for(let i=0 ; i<6 ; i++)
    {
        let currp = gdf_msg.indexOf("|" , prevp);
        if(i==0)
            msg.uid = gdf_msg.substring(prevp , currp);
        else if(i==1)
            msg.sender = gdf_msg.substring(prevp , currp);
        else if(i==3)
            msg.message = gdf_msg.substring(prevp , currp);
        else if(i==5)
            msg.recepient = gdf_msg.substring(prevp , currp);

        prevp = currp + 1;
    }

    return msg;
}

exports.gdf_decode = gdf_decode
exports.gdf_encode = gdf_encode