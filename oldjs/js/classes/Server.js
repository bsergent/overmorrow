/* 
 * Datura Multiplayer Prototype Server
 * Written by Ben Sergent V / ha1fBit
 */

// RequireJS setup
var requirejs = require('requirejs');
requirejs.config({
  config: {
    moment: {
      noGlobal: true
    }
  }
});

// Server code
requirejs(['http', 'path', 'express', 'socket.io', 'moment', 'classes/World', 'util', 'classes/EntityPlayer'],
function  ( http ,  path ,  express ,  socketio  ,  moment ,  World         ,  util ,  EntityPlayer          ) {
  var app = express();
  var http = http.Server(app);
  var io = socketio(http);

  /// Initialize world ///
  var world = new World(120, 90);

  /// Initialize server ///
  // File serving
  app.use(express.static('../'));
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/../game.html'));
  });

  var connections = [];
  var lastId = 0;
  function broadcastToOthers(omittedConnection, packetType, packetData) {
    for (var c of connections)
      if (c !== omittedConnection)
        c.emit(packetType, packetData);
  }

  // Packet handling
  io.on('connection', function(socket) {
    connections.push(socket);
    console.log('a user connected');
    socket.on('login', function(packet) {
      console.log('a user logged in: ' + packet.username);
      world.spawnPlayer(packet.username, lastId);
      socket.emit('server_login_response', {
        playerId: lastId,
        world: util.pack(world)
      });
      broadcastToOthers(socket, 'entity_new', util.pack(world.getEntity(lastId)));
      lastId++;
    });
    socket.on('disconnect', function() {
      console.log('a user disconnected');
      // TODO Remove from connections
    });
    socket.on('entity_move', function (data) {
      // TODO Check validity
      console.log('Received:', data);
      broadcastToOthers(socket, 'entity_move', data);
    });
  });

  // Start listening
  var server = app.listen(8081, function () { // Express
    console.log('Express listening on http://%s:%s', server.address().address, server.address().port)
  });
  http.listen(3000, function() { // Socket.io
    console.log('Socket.io listening on %s:3000', server.address().address);
  });

});