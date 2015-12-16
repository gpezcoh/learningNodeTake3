var util = require("util"),
	io = require("socket.io"),
	Player = require("./Player").Player,
	Match = require("./Match").Match;

var socket,
	players,
	connected,
	matches;

function init() {
	players = [];
	connected = [];
	matches = [];
	socket = io.listen(8000);
	socket.configure(function() {
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2);
	})
	setEventHandlers();
}

var setEventHandlers = function() {
	socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("find game", onFindGame);
	connected.push(new Player(client.id));
	util.log(connected)
	// client.on("new player", onNewPlayer);
	// client.on("move player", onMovePlayer);
};

function onFindGame(){
	var searchPlayer = playerById(this.id);
	if (!searchPlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};
	connected.splice(connected.indexOf(searchPlayer), 1);
	if(findMatch(searchPlayer)){
		this.emit("match found", {players: matches[0].players});
		util.log(matches[0].id)
		var tempId = matches[0].id;
		socket.sockets.socket(tempId).emit("match found", {players: matches[0].players});
	}
	else{
		this.emit("in queue", {id: searchPlayer.id});
	}
}

function findMatch(player){
	if(matches.length === 0){
		matches.push(new Match(player,player.id));
		return 0;
	}
	else{
		matches[0].players.push(player);
		return 1;
	}
}

function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};
	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
};

function playerById(id) {
    for (var i = 0; i < connected.length; i++) {
        if (connected[i].id === id)
            return connected[i];
    };

    return false;
};

init();