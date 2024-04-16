/**
 * Represents the configuration for Firebase Admin.
 *
 * @typedef {Object} FirebaseAdminConfig
 * @property {string} privateKey - The private key for Firebase Admin.
 * @property {string} projectId - The Firebase project ID.
 * @property {string} clientEmail - The client email for Firebase Admin.
 */

/**
 * Represents the configuration for Redis.
 *
 * @typedef {Object} RedisConfig
 * @property {string} host - The host for the Redis server.
 * @property {number} port - The port for the Redis server.
 * @property {string} password - The password for the Redis server.
 */

/**
 * Represents the configuration for Puppeteer Recaptcha Plugin.
 *
 * @typedef {Object} RecaptchaPluginConfig
 * @property {string} apiKey - The API key for Captcha.
 */

/**
 * Represents the configuration for Creatuuls Platform.
 *
 * @typedef {Object} CreatuulsAppConfig
 * @property {string} apiEndpoint - The API endpoint for Creatuuls Platform.
 * @property {string} adminApiKey - The admin API key for Creatuuls Platform.
 * @property {string} apiKeyHeader - The header key for creatuuls api key
 */

/**
 * Represents the configuration for the application.
 *
 * @typedef {Object} AppConfig
 * @property {FirebaseAdminConfig} firebaseAdmin - Configuration for Firebase Admin.
 * @property {number} port - The port for the application.
 * @property {RedisConfig} redis - Configuration for Redis.
 * @property {RecaptchaPluginConfig} captcha - Configuration for Captcha.
 * @property {number} queueConcurrency - The concurrency level for the queue.
 * @property {CreatuulsAppConfig} creatuulsPlatform - Configuration for Creatuuls Platform.
 * @property {string} dummySocketId - Dummy socket id for http flow
 */
