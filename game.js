var util = require("util"),
	io = require("socket.io"),
	Player = require("./Player").Player,
	Match = require("./Match").Match;

var socket,
	players,
	connected,
	matchsize,
	matches,
	activeMatches;

function init() {
	players = [];
	connected = [];
	matches = [];
	activeMatches = [];
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
	if(findMatch(searchPlayer)){
		this.emit("match found away", {players: matches[0].players});
		var tempId = matches[0].id;
		matches[0].players.push(searchPlayer);
		socket.sockets.socket(tempId).emit("match found home", {players: matches[0].players});
		if(matches[0].players.length = matchsize){
			this.emit("start match", {players: matches[0].players});
			socket.sockets.socket(tempId).emit("start match", {players: matches[0].players});
			activeMatches.push(matches[0]);
			matches.splice(0, 1)
			util.log(activeMatches)
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

	util.log("connected")
	util.log(connected)

	if (!removePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};

	connected.splice(connected.indexOf(removePlayer), 1);

	util.log("connected")
	util.log(connected)

	var removeMatch = matchesById(this.id);
	util.log(removeMatch)
	if (!removeMatch) {
	    removeMatch = activeMatchesById(this.id);
	    if(!removeMatch){
	    	 util.log("Match not found: "+this.id);
	    	return;
	    }
	    else {
	    	activeMatches.splice(activeMatches.indexOf(removeMatch), 1);
	    }
	}
	else {
		util.log("match found")
		matches.splice(matches.indexOf(removeMatch), 1);
	}
	socket.sockets.socket(removeMatch.id).emit("remove match");
};

function activeMatchesById(id) {
    for (var i = 0; i < activeMatches.length; i++) {
        if (activeMatches[i].players[0].id === id)
            return activeMatches[i].players[1];
        else if (activeMatches[i].players[1].id === id)
        	return activeMatches[i].players[0];
    };

    return false;
};

function matchesById(id) {
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].id === id)
            return matches[i];
    };

    return false;
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