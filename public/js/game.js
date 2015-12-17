var canvas,
	keys,
	ctx,
	localPlayer,
	socket,
	otherPlayer,
	playing;

function init(){
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	keys = new Keys();

	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	setEventHandlers();
}

$("#startButton").click(function(){
	socket.emit("find game");
});

var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("in queue", onInQueue);
	socket.on("match found home", onMatchFoundHome);
	socket.on("match found away", onMatchFoundAway);
	socket.on("start match", onStartMatch);
	socket.on("new player", onNewPlayer);
	socket.on("move player", onMovePlayer);
	socket.on("remove match", onRemoveMatch);
};

function onStartMatch(data){
	$("#inQueue").hide();
	$("#startButton").hide();
	playing = true;
}

function onRemoveMatch(){
	console.log("hello")
	playing = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// window.cancelAnimationFrame(animate);
	$("#startButton").show();
}

function onMovePlayer(data) {
	var movePlayer = otherPlayer;

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
};

function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var tempTeam = 1;
	if(localPlayer.team === 1){
		tempTeam = 2
	}
	otherPlayer = new Player(data.id, tempTeam, data.x, data.y);

	// localPlayer.draw(ctx);

	console.log(localPlayer)
	console.log(data.x)

	animate();
};


function onInQueue(data){
	$("#startButton").hide();
	$("#inQueue").show();
}

function onMatchFoundHome(data){
	console.log("home")
	var startX1 = Math.round(Math.random()*((canvas.width-5)/2)),
		 startX2 = Math.round(Math.random()*((canvas.width-5)/2) + (canvas.width-5)/2),
			startY = Math.round(Math.random()*(canvas.height-5));
	localPlayer = new Player(data.players[0].id, 1, startX1,startY);
	// otherPlayer = new Player(data.players[1].id, 2, startX2,startY);
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), 
		team: localPlayer.team, id: localPlayer.id,oppId: data.players[1].id});
}

function onMatchFoundAway(data){
	console.log("away")
	var startX1 = Math.round(Math.random()*((canvas.width-5)/2)),
		 startX2 = Math.round(Math.random()*((canvas.width-5)/2) + (canvas.width-5)/2),
			startY = Math.round(Math.random()*(canvas.height-5));
	localPlayer = new Player(data.players[1].id, 2, startX2,startY);
	// otherPlayer = new Player(data.players[0].id, 1, startX1,startY);
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), 
		team: localPlayer.team, id: localPlayer.id,oppId: data.players[0].id});
}

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

function onSocketConnected(){

}

function onSocketDisconnect(){

}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	console.log("hello")
	if(playing){
		update();
		draw();

		// Request a new animation frame using Paul Irish's shim
		window.requestAnimFrame(animate);
	}
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(),oppId: otherPlayer.id});
	};
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillRect(canvas.width/2,0,2,canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);

	// Draw the remote players

	otherPlayer.draw(ctx);

	// var i;
	// for (i = 0; i < remotePlayers.length; i++) {
	// 	remotePlayers[i].draw(ctx);
	// };
};
