/**
 * Represents the options for intializing a puppeteer bot
 *
 * @typedef {Object} InitializeBotOpts
 * @property {string} userId - The user's id.
 */

/**
 * Represents the options for starting an automated flow with puppeteer bot
 *
 * @typedef {Object} FlowOptions
 * @property {string} clientSocketId - The client socket connection id.
 * @property {string} userId - The user's id.
 * @property {string} integrationType - The type of newsletter integration
 * @property {string} flowName - The name of the particular flow to initialize
 * @property {Object} inputData - User input
 * @property {Object}  socketConn - An instance of socket connection
 * @property {Object} puppeteerBot - An instance of initialized puppeteer bot
 * @property {string=} accountIdentifier - Account id of authed account
 * @property {string} [botPolicy="keepAlive"|"kill"] - Determines whether to kill bot after flow ("keepAlive"|"kill")
 */

/**
 * Represents the options for starting an automated stage in a flow
 *
 * @typedef {Object} StageOptions
 * @property {string} clientSocketId - The client socket connection id.
 * @property {string} currentStage - The name of the stage to be initiated
 * @property {MappedStages} stages - Stage config mapped to their name
 * @property {Object} input - User input
 * @property {Object}  socketConn - An instance of socket connection
 * @property {string=} accountIdentifier - Account id of authed account
 * @property {Object} puppeteerBot - An instance of initialized puppeteer bot
 */

/**
 * Represents the options for starting an automated stage in a flow
 *
 * @typedef {Object} MappedStages
 * @property {string} name - The stage name.
 * @property {GetStageConfigFunction} getConfig - The name of the stage to be initiated
 */
