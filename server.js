const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Static files
app.use(express.static(path.join(__dirname , "public")));

// Server setup
server.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});

// Connection
var users = []; // each user identified by id, username and room.
io.on('connection', function(socket) {
    console.log('User Connected');

    socket.on('disconnect', function() {
        console.log('User Disconnected');
        
        var index = users.findIndex(u => u.id === socket.id);
        var user = users[index];
     
        if(index > -1) {
            socket.broadcast.emit('broadcast', user.name + " has left the room.\n")
            users.splice(index, 1);
        }
    });

    socket.on('create_room', function(data) {

        console.log(data);

        if(!data.name) {
            socket.emit('error', "Username cannot be empty.");
            return;
        }

        var roomID = makeRoomID();
        users.push({id: socket.id, name: data.name, room: roomID});
        socket.join(roomID);
        io.sockets.in(roomID).emit('broadcast', "Room ID: " + roomID + "\n" + data.name + " has joined the room.\n");
    });

    socket.on('join_room', function(data) {
        if(!data.name) {
            socket.emit('error', "Username cannot be empty.");
            return;
        }

        if(!data.roomID) {
            socket.emit('error', "Room ID cannot be empty.");
            return;
        }

        if(users.findIndex(u => u.name == data.name && u.roomID == data.roomID) > -1){
            socket.emit('error', "Username already taken.");
            return;
        }

        const room = io.of("/").adapter.rooms.get(data.roomID);
        if(!room) {
            socket.emit('error', "Room does not exist.");
            return;
        }

        users.push({id: socket.id, name: data.name, room: data.roomID});
        socket.join(data.roomID);
        io.sockets.in(data.roomID).emit('broadcast', data.name + " has joined the room.\n");

    })
});

// Rooms
function makeRoomID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while(true) {
        var id = "";
        for(let i = 0; i < 5; i++) {
            id += characters[Math.floor(Math.random() * characters.length)];
        }

        const room = io.of("/").adapter.rooms.get(id);
        if(room) continue;
        else return id;
    }
}