/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(id, team,startX,startY) {
	var x = startX,
		y = startY,
		id = id,
		team = team,
		moveAmount = 2;

	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var update = function(keys) {

		var prevX = x,
    	prevY = y;
		// Up key takes priority over down
		if (keys.up) {
			y -= moveAmount;
		} else if (keys.down) {
			y += moveAmount;
		};

		// Left key takes priority over right
		if (keys.left) {
			x -= moveAmount;
		} else if (keys.right) {
			x += moveAmount;
		};
		return (prevX != x || prevY != y) ? true : false;
	};

	var draw = function(ctx) {
		ctx.fillRect(x-5, y-5, 10, 10);
	};

	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id,
		team: team,
		update: update,
		draw: draw,
	}
};