const express = require("express");
const { createServer } = require("http");

const { errorHandler } = require("./middlewares/error-handler");
const SocketService = require("./services/socket-service");
const redisClient = require("./services/redis-service");
const {
  initNewsletterIntegrationSocketChannel,
} = require("./services/socket-service/namespaces/newsletter-integration");
const { appConfig } = require("./config");

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.get("/health-check", (req, res) => res.send("pong"));
app.use("/bots", require("./routers/bots"));
app.use(errorHandler);

async function main() {
  try {
    await redisClient.connect();

    SocketService.initialize(httpServer, redisClient);
    initNewsletterIntegrationSocketChannel();

    await new Promise((resolve, reject) => {
      const listener = httpServer.listen(appConfig.port || 80, (err) => {
        if (err) reject(err);
        console.info(`listening on ${listener.address().port}`);
        resolve();
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

main();
