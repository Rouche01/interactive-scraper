/**
 * Represents the options for the action function in a sequence step.
 *
 * @typedef {Object} ActionOptions
 * @property {Array<string>} selectors - The selectors for elements in the step.
 * @property {*} pipedData - The data piped from previous steps.
 * @property {string} key - The key associated with the action.
 */

/**
 * Represents a function that performs a specific action for a sequence.
 *
 * @callback ActionFunction
 * @param {ActionOptions} options - The options for the action function.
 * @returns {*} The result of the action function.
 */

/**
 * Represents a step in the sequence of actions.
 *
 * @typedef {Object} SequenceStep
 * @property {Array<string>} selectors - The selectors for elements in the step.
 * @property {ActionFunction} action - The action to perform in the step.
 * @property {number} order - The order of the step in the sequence.
 * @property {string=} key - The key associated with the sequence.
 */

/**
 * Represents the configuration for a stage in the automation process.
 *
 * @typedef {Object} StageConfig
 * @property {string} url - The URL associated with the stage.
 * @property {string} stageType - The type of the stage (default: "intermediate").
 * @property {Array<SequenceStep>} sequence - The sequence of actions to perform in the stage.
 */

/**
 * Represents the options for getting a stage configuration.
 *
 * @typedef {Object} GetStageConfigOptions
 * @property {Object} puppeteerBot - The Puppeteer bot instance.
 * @property {Object=} inputData - The input data for the stage.
 * @property {Object} socketConn - The socket connection instance.
 * @property {string} clientSocketId - The client socket id.
 * @property {string=} accountIdentifier - Account id for authed flow
 */

/**
 * Represents gets the configuration for a specific stage in the automation process.
 *
 * @callback GetStageConfigFunction
 * @param {string} [stageType="intermediate"] - The type of the stage.
 * @param {GetStageConfigOptions} stageHelpers - The options for getting a stage configuration.
 * @returns {StageConfig} The configuration for the specified stage.
 */
