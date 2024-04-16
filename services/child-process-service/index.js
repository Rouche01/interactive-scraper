const path = require("path");
const { createChildProcessManager } = require("../../classes");

const processFilePath = path.join(__dirname, "./process-file");

const childProcessManager = createChildProcessManager(processFilePath);

/**
 * Represents option param for setting up child process
 * @typedef {Object} SetupChildProcessOpts
 * @property {string} identifier - Unique identifier for child process
 * @property {string} socketId - Socket id related to child process
 * @property {MessagePayload} payload - Message payload to be processed by child process
 */

/**
 * Sets up a child process if unalive and sends message payload
 *
 * @function
 * @param {SetupChildProcessOpts} options - Unique identifier for child process
 */
const addJobToChildProcess = ({ identifier, socketId, payload }) => {
  const isAlive = childProcessManager.isChildProcessAlive(identifier);

  if (!isAlive) {
    console.log("Creating a new child process for client");
    childProcessManager.createChildProcess(identifier, socketId);
    childProcessManager.sendMessageToChild(identifier, payload);
  }

  if (isAlive) {
    console.log("Child process exist for this client");
    childProcessManager.sendMessageToChild(identifier, payload);
  }
};

module.exports = { childProcessManager, addJobToChildProcess };
