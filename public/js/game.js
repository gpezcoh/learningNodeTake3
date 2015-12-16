var canvas,
	keys,
	localPlayer;

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
	console.log("clicked")
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
	socket.on("match found", onMatchFound);
	// socket.on("new player", onNewPlayer);
	// socket.on("move player", onMovePlayer);
	// socket.on("remove player", onRemovePlayer);
};

function onInQueue(data){
	console.log(data.id);
	$("#startButton").hide();
	$("#inQueue").show();
}

function onMatchFound(data){
	console.log(data.players);
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
	localPlayer.draw(ctx);
};

function onSocketConnected(){

}

function onSocketDisconnect(){

}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
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
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};
