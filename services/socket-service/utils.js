const { Namespace, Socket, Server } = require("socket.io");

/**
 * Represents the options for emitToClientFn
 *
 * @typedef {Object} EmitToClientOptions
 * @property {Socket} socket - An instance of connected socket server or sender.
 * @property {string} clientSocketId - The client socket connection id.
 * @property {string} event - The socket event
 * @property {Object} data - The socket event payload
 */

/**
 * A function that emits socket event to connected client
 *
 * @function EmitToClientFn
 * @param {EmitToClientOptions} emitToClientOpts - The options to emit to a socket client.
 */
const emitToClient = ({ socket, clientSocketId, event, data }) => {
  if (socket instanceof Namespace) {
    if (!clientSocketId) {
      throw new Error("Socket id is not defined");
    }
    socket.to(clientSocketId).emit(event, data);
  }

  if (socket instanceof Socket) {
    socket.emit(event, data);
  }
};

module.exports = { emitToClient };
