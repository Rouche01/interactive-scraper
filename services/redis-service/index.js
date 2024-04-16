const { createClient } = require("redis");
const { appConfig } = require("../../config");

const redisClient = createClient({
  password: appConfig.redis.password,
  socket: {
    host: appConfig.redis.host,
    port: appConfig.redis.port,
  },
});

module.exports = redisClient;
