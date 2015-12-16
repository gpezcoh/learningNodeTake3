var Match = function(initialPlayer,id) {
    var players = [initialPlayer],
        id = id;

    var addPlayer = function(player){
        players.push(player);
    } 
    return {
        players: players,
        id: id
    }
};

exports.Match = Match;