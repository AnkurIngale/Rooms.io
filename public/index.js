const socket = io();

function createRoom() {
    socket.emit('create_room', {
        name: document.getElementById('name').value,
    });
}

function joinRoom() {
    socket.emit('join_room', {
        name: document.getElementById('name').value,
        roomID: document.getElementById('roomID').value
    });
}

socket.on('error', function(message) {
    document.body.innerHTML = "Error Message: " + message + " Please refresh to try again.";
});

socket.on('broadcast', function(msg) {
    document.body.innerHTML += msg; 
});