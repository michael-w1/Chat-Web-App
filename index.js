var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


let users = [];
let chatMessages = [];
let onlineCount = 0;
// Set to store valid Hex for CSS colors 
let validHex = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]);




io.on('connection', function (socket) {
  // console.log("other"); 

  socket.on('newUser', function () {
    let userID = "User" + onlineCount;
    users.push(userID);
    onlineCount ++; 
    // get the new user name here 
    socket.emit('newUser', userID);
    users.push({uname: userID, color: "000000"}); 
  });


  socket.on('appState', function(){
   // console.log(chatMessages); 
    socket.emit('appState', chatMessages, users); 


  });

  socket.on('disconnect', function(){
    console.log("disconnected"); 
    // for(let i = 0; i < users; i++){
    //   if (users[i].uname ===
    // }
});


  socket.on('chat message', function (msg, user) {
    console.log("hello");
    // console.log(other); 
    //other = "WUMBO";

   // console.log("what is other" + other);
    // Command Detection
    if (msg.slice(0, 1) === "/") {
      console.log("here with /")
      if (msg.slice(1, 6) === "nick ") {
        console.log("detected nickname change")

        let newName = msg.slice(6);
        console.log("new name" + newName); 
        for(let i = 0; i < users.length; i++){
          console.log(users[i]); 
        }

        if ((users.filter(user => user === newName)).length != 0) {
          console.log("Name in use");
          socket.emit('chat message', "Name already in use"); 
        } else {
          for (let k = 0; k < users.length; k++) {
            if (users[k].uname === user) {

              users[k].uname = newName;
              io.emit('chat message', user + " has changed username to: " + newName); 
              user = newName; 
              socket.emit('nickChange', newName); 
              io.emit('updateUserList', users);
              
              break;
            }
          }



        }



      } else if (msg.slice(1, 11) === "nickcolor ") {
        let newColor = msg.slice(11);
        if (validColor(newColor)) {



          for (let i = 0; i < users.length; i++ ){
            if (users[i].uname = user){
              console.log("in users" + users[i].uname)
              users[i].color = newColor;
              
            }
          }

          console.log("color changed to:" + msg.slice(11));
        } else {
          socket.emit('chat message', "Invalid Color Received: " + newColor);
        }



      } else {
        console.log("Invalid command message received");
        socket.emit('chat message', "Invalid command received");

      }

    } else {
      // Not starting with / command 
      userColor = "000000"; 
      console.log(user); 
      console.log(users.length); 
      for (let i = 0; i < users.length; i++ ){
        if (users[i].uname === user){
          userColor = users[i].color; 
        }
      }

      console.log("usercolor" + userColor); 

      chatMessages.push({uname: user, color: userColor, time: getTime(), msg: msg});
     // console.log("here" + chatMessages); 
      io.emit('chat message', getTime() + " - " + user + ": " + msg, userColor, user);
      //io.emit('chat message', getTime() + " - " + user + ": " + "<b>" + msg + "</b>", userColor);
      //$('#messages').append($('<li>').text(msgs[i].time + " - " + msgs[i].uname + ": " + msgs[i].msg));
      

    }


  });





});




function getTime() {
  let date = new Date();
  //let time = date.getHours() + ":" + date.getMinutes();
  let time  = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  return time;
}



function validColor(color) {
  if (color.length >= 7) { return false };
  for (let j = 0; j < color.length; j++) {
    if (!validHex.has(color[j])) {
      return false;
    }
  }

  return true;
}

http.listen(port, function () {
  console.log('listening on *:' + port);
}); 
