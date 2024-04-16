const { Server: SocketServer, Namespace } = require("socket.io");
const { Server: HttpServer } = require("http");
const { createAdapter } = require("@socket.io/redis-streams-adapter");

/**
 * SocketService: for managing socket server connection.
 *
 * @class
 */
class SocketService {
  /**
   * The socket server instance.
   *
   * @type {SocketServer|null}
   */
  static instance = null;

  /**
   * Creates a socket server connection instance.
   *
   * @static
   * @param {HttpServer} httpServer - An instance of http server
   * @param {import("redis").RedisClientType} redisClient - The related client socket id
   * @returns {SocketServer} An instance of connected socket server
   */
  static initialize(httpServer, redisClient) {
    const socketServer = new SocketServer(httpServer, {
      cors: { origin: "*" },
      adapter: createAdapter(redisClient),
    });

    socketServer.on("connection", (socket) => {
      console.log("connected");
    });

    SocketService._setInstance(socketServer);

    return socketServer;
  }

  /**
   * Creates a socket server namespace connection.
   *
   * @static
   * @param {string} namespace - The name identifier for the socket connection namespace
   * @returns {Namespace} An instance of namespace socket server connection
   */
  static useNamespaceConnection(namespace) {
    if (!SocketService.instance) {
      throw new Error("No socket connection available to create namespace!");
    }
    if (SocketService.instance) {
      return SocketService.instance.of(namespace);
    }
  }

  static _getInstance() {
    return SocketService.instance;
  }

  /**
   * Sets an instance of connected socket server.
   *
   * @static
   * @param {SocketServer} socketServer - An instance of connected socket server
   */
  static _setInstance(socketServer) {
    SocketService.instance = socketServer;
  }
}

module.exports = SocketService;
