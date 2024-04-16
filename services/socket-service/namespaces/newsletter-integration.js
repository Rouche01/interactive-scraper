const { auth } = require("../../firebase-service");
const redisClient = require("../../redis-service");
const {
  SOCKET_CHANNELS: { NEWSLETTER_INTEGRATION_NAMESPACE },
  SOCKET_EVENTS: {
    NW_INTEGRATION_CONNECTION_ERR,
    NW_INTEGRATION_JOIN,
    NW_INTEGRATION_INSTANCE_STATUS,
  },
} = require("../../../constants");
const eventHandlers = require("../event-handlers/newsletter-integration.handlers");
const { emitToClient } = require("../utils");
const SocketService = require("../../socket-service");
const { childProcessManager } = require("../../child-process-service");

/**
 * A function that emits socket event to connected client
 *
 * @function InitNwIntegrationChannelFn
 * @returns {void}
 */
const initNewsletterIntegrationSocketChannel = () => {
  const nwIntegrationNamespace = SocketService.useNamespaceConnection(
    NEWSLETTER_INTEGRATION_NAMESPACE
  );

  childProcessManager.setupSocketConn(nwIntegrationNamespace);

  nwIntegrationNamespace.on("connection", (socket) => {
    socket.use(async (packet, next) => {
      const token = socket.handshake?.auth?.token?.replace("Bearer ", "");
      const query = socket.handshake.query;

      if (!token) {
        const error = new Error("not authorized");
        error.data = { content: "Please retry with auth token" }; // additional details
        next(error);
      }

      try {
        const user = await auth.verifyIdToken(token);
        socket.user = user;

        // check that event type emitted is join
        if (packet[0] === NW_INTEGRATION_JOIN) {
          const canConnect = await redisClient.set(
            `users:${user.sub}`,
            socket.id,
            {
              NX: true,
              EX: 30,
            }
          );

          if (!canConnect) {
            emitToClient({
              socket,
              event: NW_INTEGRATION_INSTANCE_STATUS,
              data: { active: true },
            });
          } else {
            emitToClient({
              socket,
              event: NW_INTEGRATION_INSTANCE_STATUS,
              data: { active: false, query },
            });
          }
        }

        return next();
      } catch (err) {
        console.log(err);
        // send error to client and disconnect socket
        const error = new Error("not authorized");
        error.data = { content: "Please retry with auth token" }; // additional details
        return next(error);
      }
    });

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.once(event, (data) => handler(socket, data));
    });

    socket.conn.on("packet", async ({ type }) => {
      if (type === "pong" && socket.user) {
        // do some logging here
        await redisClient.set(`users:${socket.user.sub}`, socket.id, {
          XX: true,
          EX: 30,
        });
      }
    });

    socket.on("error", (error) => {
      console.log(error, "handling socket error");
      emitToClient({
        socket,
        event: NW_INTEGRATION_CONNECTION_ERR,
        data: {
          message: `${error.message}. ${error.data.content}`,
        },
      });
    });

    socket.on("disconnect", async () => {
      console.log(`Socket ${socket.id} disconnected.`);
      if (socket.user) {
        const activeSocketForUser = await redisClient.get(
          `users:${socket.user.sub}`
        );
        // check if it's active socket been disconnected
        // only delete the lock key then, else you can disconnect
        // duplicate socket connection without deleting lock key
        if (activeSocketForUser === socket.id) {
          await redisClient.del(`users:${socket.user.sub}`);
        }
      }
    });
  });
};

module.exports = { initNewsletterIntegrationSocketChannel };
