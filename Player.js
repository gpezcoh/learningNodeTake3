var Player = function(id) {
    var x,
        y,
        team,
        id = id;
    
    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var getTeam = function() {
        return team;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    var setTeam = function(newTeam) {
        team = newTeam;
    };

    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getTeam: getTeam,
        setTeam: setTeam,
        id: id,
        team: team
    }
};

exports.Player = Player;