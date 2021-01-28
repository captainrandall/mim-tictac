const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


/**
 *
 * @param {Object} data containig gameId, message and any additional data required for message type
 */
const emitMessageResponse = (socket, data) => {
  const { message, gameId } = data;

  switch (message) {
    case 'NEW_GAME':
      socket.join(gameId);
      break;
    case 'JOIN_GAME':
      const roomToJoin = io.sockets.adapter.rooms.get(gameId);
      if (roomToJoin) {
        socket.join(gameId);
        io.to(gameId).emit('PAIRING_SUCCESS');
      } else {
        socket.emit('PAIRING_FAILURE');
      }
      break;
    default:
      io.to(gameId).emit(message);
      break;
  }
};

/**
 * Handles the transfer of data from one player to another.
 *
 * Listen for a request of data, emit message to other player.
 * Upon other player receiving request message, send back the requested
 * data to server and emit back to other player.
 */
const addDataRequestHandlers = (socket) => {
  socket.on('REQUEST_DATA', (payload) => {
    const { gameId, requestedData } = payload;

    socket.to(gameId).emit('REQUEST_DATA', requestedData);
  });

  socket.on('REQUESTED_DATA_PAYLOAD', (payload) => {
    const { gameId, requestedData } = payload;

    socket.to(gameId).emit('REQUESTED_DATA_PAYLOAD', requestedData);
  });
};

const addPushDataHandlers = (socket) => {
  socket.on('PUSH_PAYLOAD_TO_All', (payload) => {
    const { gameId, providedData } = payload;

    io.to(gameId).emit('INCOMING_GAME_DATA', providedData);
  });
} 

io.on('connection', (socket) => {
  socket.on('MESSAGE', (data) => emitMessageResponse(socket, data));

  addDataRequestHandlers(socket);
  addPushDataHandlers(socket);
});

http.listen(4000, function () {
  console.log('listening on port 4000');
});
