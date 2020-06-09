// const Sequelize = require('sequelize');
// const sqlite=require('sqlite3')
// const sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost:3000',
//   dialect: 'sqlite',
//   dialectModule: sqlite,
//   operatorsAliases: false,

//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },

//   // SQLite only
//   storage: '.\messages.sqlite'
// });
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });
//   const sent_message = sequelize.define('pending_message', {
//     Recip_IPFS: {
//       type: Sequelize.STRING
//     },
//     Message: {
//       type: Sequelize.STRING
//     }
//   });
//   const pending_message = sequelize.define('pending_message', {
//     Recip_IPFS: {
//       type: Sequelize.STRING
//     },
//     Message: {
//       type: Sequelize.STRING
//     }
//   });
  
//   function sent(ipfs,message)
//   {
//     // force: true will drop the table if it already exists
//   sent_message.sync({force: false}).then(() => {
//     // Table created
//     return sent_message.create({
//       Recip_IPFS: ipfs,
//       Message: message
//     }).then(mess => {
//         console.log(`New message: ${mess.message}  for user ${mess.Recip_IPFS} has been created.`);
//       });
//   });
// }

// function pending(ipfs,message)
//   {
//   // force: true will drop the table if it already exists
//   pending_message.sync({force: false}).then(() => {
//     // Table created
//     return sent_message.create({
//       Recip_IPFS: ipfs,
//       Message: message
//     });
//   });
//   sent_message.findAll().then(message => {
//     console.log(message,'hello')
//   })
// }
// module.exports={sent:sent,pending:pending}
var mysql = require('mysql');

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database:"messages"
//   });
  

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     var sql = "create table sent(recipient VARCHAR(255), messhash VARCHAR(255))";
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("Table created");
//     });
//     var sql = "create table pending (recipient VARCHAR(255), messhash VARCHAR(255))";
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("Table created");
//     });
//   });
function sent(recip,message) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",  //Enter here the password you decided while setting up mysql server
        database:"messages"
      });
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO sent (recipient,messhash) VALUES (recip, message)";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
      });}

      function pending(recip,message) {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",       //Enter here the password you decided while setting up mysql server
            database:"messages"
          });
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            var sql = "INSERT INTO pending (recipient,messhash) VALUES (recip, message)";
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("1 record inserted");
            });
          });}

          module.exports={sent:sent,pending:pending}