var util = require("util"),
	io = require("socket.io"),
	Player = require("./Player").Player,
	Match = require("./Match").Match;

var socket,
	players,
	connected,
	matchsize,
	matches;

function init() {
	players = [];
	connected = [];
	matches = [];
	matchsize = 2;
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
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
};

function onNewPlayer(data){
	var newPlayer = new Player(data.id);
	newPlayer.setX(data.x);
	newPlayer.setY(data.y);
	newPlayer.setTeam(data.team);
	util.log("newPlayer")
	util.log(data)

	socket.sockets.socket(data.oppId).emit("new player", {id: newPlayer.id, x: newPlayer.getX(),
	 y: newPlayer.getY()});

	// var i, existingPlayer;
	// for(i = 0; i < players.length; ++i){
	// 	existingPlayer = players[i];
	// 	this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), 
	// 		y: existingPlayer.getY()});
	// };
	
	players.push(newPlayer);
};

function onFindGame(){
	var searchPlayer = playerById(this.id);
	if (!searchPlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};
	connected.splice(connected.indexOf(searchPlayer), 1);
	if(findMatch(searchPlayer)){
		this.emit("match found away", {players: matches[0].players});
		util.log(matches[0].id)
		var tempId = matches[0].id;
		socket.sockets.socket(tempId).emit("match found home", {players: matches[0].players});
		if(matches[0].players.length = matchsize){
			this.emit("start match", {players: matches[0].players});
			socket.sockets.socket(tempId).emit("start match", {players: matches[0].players});
			matches.splice(0, 1);
		}
	}
	else{
		this.emit("in queue", {id: searchPlayer.id});
	}
}

function onMovePlayer(data){
	var movePlayer = playerByIdInGame(this.id);

	if (!movePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	socket.sockets.socket(data.oppId).emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});

};

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

function playerByIdInGame(id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id === id)
            return players[i];
    };

    return false;
};

init();