require("../types/configs");
require("dotenv/config");

/**
 * App configuration object.
 *
 * @type {AppConfig}
 */
const appConfig = {
  firebaseAdmin: {
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  port: +process.env.PORT,
  baseUrl: process.env.BASE_URL,
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  captcha: {
    apiKey: process.env.CAPTCHA_API_KEY,
  },
  queueConcurrency: +process.env.QUEUE_CONCURRENCY || 1,
  creatuulsPlatform: {
    apiEndpoint: process.env.CREATUULS_PLATFORM_API,
    adminApiKey: process.env.CREATUULS_PLATFORM_ADMIN_API_KEY,
    apiKeyHeader: process.env.CREATUULS_PLATFORM_API_KEY_HEADER,
  },
  dummySocketId: process.env.DUMMY_SOCKET_ID,
};

module.exports = appConfig;
