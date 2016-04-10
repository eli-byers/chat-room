// require express
var express = require("express");
// create the express app
var app = express();
// path module -- try to figure out where and why we use this
var path = require("path");
// require body-parser
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// routes
app.get('/', function(req, res) {
	res.render("index");
})

// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
	console.log("listening on port 8000");
})

// create io from the returned variable above
var io = require('socket.io').listen(server);

var db = {
	"users": [],
	"messages": []
};

// Whenever a connection event happens (the connection event is built in) run the following code
io.sockets.on('connection', function (socket) {
	console.log("CONNECTION DETECTED");

	// Got New User
	//
	socket.on("got_new_user", function (data){
		console.log("got_new_user", data);
		var user_json = {"name":data.name, "id": socket.id};
		db.users.push(user_json);
		socket.emit("got_new_user_response", {"id": socket.id, "all_users": db.users, "all_messages": db.messages});
		socket.broadcast.emit("new_user", user_json);
	});

	// New Message
	//
	socket.on("new_message", function (data){
		console.log("new_message", data.new_message)
		db.messages.push(data.new_message)
		socket.broadcast.emit('new_messages', data.new_message);
	});

	// DISCONNECT
	//
	socket.on('disconnect', function() {
	 var lost_client_id = socket.id;
	 var lost_client_name = "A Ghoast";
	 for (i in db.users){
		 if (db.users[i].id == lost_client_id) {
			 lost_client_name = db.users[i].name;
			 db.users.splice(i, 1);
			 break;
		 }
	 }
	 socket.broadcast.emit("user_left", {"id": socket.id, "name": lost_client_name});
	 console.log(lost_client_name, "DISCONNECTED!");
	 console.log(db.users);
  });





});
