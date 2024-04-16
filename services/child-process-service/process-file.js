const { Server } = require("socket.io");
const redisClient = require("../redis-service");
const messageHandlers = require("./message-handlers");
const { createAdapter } = require("@socket.io/redis-streams-adapter");
const { SOCKET_CHANNELS, SOCKET_EVENTS } = require("../../constants");
const { initBot } = require("../bot-service");
const { emitToClient } = require("../socket-service/utils");

const argumentsFromParent = process.argv.slice(2);

/**
 * Runs the procedure for the child process
 *
 * @function
 * @param {string} userId - User's id
 * @param {string} userSocketId - User's socket connection id
 */
async function main(userId, userSocketId) {
  await redisClient.connect();
  const processSocketConnection = new Server({
    adapter: createAdapter(redisClient),
  }).of(SOCKET_CHANNELS.NEWSLETTER_INTEGRATION_NAMESPACE);
  const bot = await initBot({ userId });

  process.on("message", async (message) => {
    console.log(
      `[${process.pid}]: processing ${message.type} for user with id: ${userId}`
    );
    const handler = messageHandlers[message.type];
    return handler({
      ...message,
      socketConn: processSocketConnection,
      bot,
    });
  });

  process.on("uncaughtException", async (error) => {
    await bot.deInit();
    console.error("Uncaught Exception:", error);
    process.exit(1); // Terminate the child process with a non-zero exit code
  });

  process.on("unhandledRejection", async (reason, promise) => {
    await bot.deInit();
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1); // Terminate the child process with a non-zero exit code
  });

  process.on("exit", async (code) => {
    await bot.deInit();
    console.log(`[${process.pid}]: process exited with code ${code}`);
  });

  process.on("SIGTERM", async () => {
    emitToClient({
      socket: processSocketConnection,
      clientSocketId: userSocketId,
      event: SOCKET_EVENTS.NW_INTEGRATION_PROCESS_TERMINATED,
      data: { message: "Account linking terminated!" },
    });
    await bot.deInit();
    process.exit();
  });
}

main(argumentsFromParent[0], argumentsFromParent[1]);
