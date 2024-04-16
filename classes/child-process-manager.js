const { fork, ChildProcess } = require("child_process");
const { Namespace } = require("socket.io");

const { emitToClient } = require("../services/socket-service/utils");
const { SOCKET_EVENTS } = require("../constants");

/**
 * Represents ChildProcessManager options.
 * @typedef {Object} ChildProcessManagerOptions
 * @property {string} processFile - The child process file.
 * @property {Object|null} childrenMessageHandlers - Message handler for child processes mapped to message type
 */

/**
 * Represents the value of childProcess map.
 * @typedef {Object} ChildProcessMapValue
 * @property {ChildProcess} childProcess - The child process
 * @property {string} clientSocketId - The related client socket id
 */

/**
 * ChildProcessManager for managing child processes.
 *
 * @class
 */
class ChildProcessManager {
  /**
   * Creates a new instance of `ChildProcessManager`.
   *
   * @constructor
   * @param {ChildProcessManagerOptions} options - The options for configuring the `ChildProcessManager`.
   */
  constructor({ processFile, childrenMessageHandlers }) {
    /**
     * The child process file.
     *
     * @type {string}
     */
    this.processFile = processFile;

    /**
     * Message handler for messages from child processes
     *
     * @type {Object|null}
     */
    this._childrenMessageHandlers = childrenMessageHandlers;

    /**
     * Connected socket namespace
     *
     * @type {Namespace|null}
     */
    this._socketConn = null;

    /**
     * The child process file.
     *
     * @type {Map<string, ChildProcessMapValue>}
     */
    this._childProcesses = new Map();
  }

  /**
   * Creates a new child process and adds it to the list of child processes.
   *
   * @method
   * @param {string} identifier - Required to identify created child process
   * @param {string} clientSocketId - The related client socket id
   * @param {Array<string>=} argumentToChild - Arguments to create child process
   * @returns {ChildProcess} A new child process
   */
  createChildProcess(identifier, clientSocketId, argumentToChild) {
    const argumentToChildResolved = argumentToChild
      ? [identifier, clientSocketId, ...argumentToChild]
      : [identifier, clientSocketId];

    const child = fork(this.processFile, argumentToChildResolved);
    this._addChildProcess(identifier, child, clientSocketId);

    console.log(
      `[${child.pid}]: child process created for user with id: ${identifier}`
    );

    child.on("message", (message) => {
      console.log(
        `Processing message from child process ${identifier}:`,
        message.type
      );
      if (this._childrenMessageHandlers) {
        const handler = this._childrenMessageHandlers[message.type];
        return handler?.(message);
      }
    });

    child.on("error", (error) => {
      console.error(`Error in child process ${identifier}:`, error);
    });

    child.on("close", (code, signal) => {
      console.log(
        `Child process ${identifier} closed with code ${code} and signal ${signal}`
      );
    });

    child.on("exit", (code, signal) => {
      if (code !== 0) {
        const clientSocketId = this._getChildProcessClientSocketId(identifier);
        emitToClient({
          clientSocketId,
          data: { message: "Something went wrong, please try again" },
          event: SOCKET_EVENTS.NW_INTEGRATION_GENERIC_ERROR,
          socket: this._socketConn,
        });
      }
      console.log(
        `Child process ${identifier} exited with code ${code} and signal ${signal}`
      );
      this._removeChildProcess(identifier);
    });

    return child;
  }

  /**
   * Checks if child process with identifier exists
   *
   * @param {string} identifier - Unique identifier for child process
   * @returns {boolean}
   */
  isChildProcessAlive(identifier) {
    const child = this._getChildProcess(identifier);

    if (!child) {
      return false;
    }

    return child.connected;
  }

  /**
   * Sends a message payload to a child process.
   *
   * @method
   * @param {string} identifier - Required to identify created child process
   * @param {MessagePayload} message - Message payload
   */
  sendMessageToChild(identifier, message) {
    const child = this._getChildProcess(identifier);

    if (!child) {
      console.error(`Child process with identifier ${identifier} not found.`);
      throw Error("Child process does not exist");
    }

    child.send(message);
  }

  /**
   * Sends a message payload to a child process.
   *
   * @method
   * @param {Namespace} socketConn - Required to identify created child process
   */
  setupSocketConn(socketConn) {
    this._socketConn = socketConn;
  }

  /**
   * Kills a child process.
   *
   * @method
   * @param {string} identifier - Identifies a child process
   */
  killChild(identifier) {
    const child = this._getChildProcess(identifier);

    if (!child) {
      console.error(`Child process with identifier ${identifier} not found.`);
      return;
    }

    child.kill("SIGTERM");
  }

  /**
   * Gets a child process with the identifier.
   *
   * @method
   * @param {string} identifier - Identifies the child process
   * @returns {ChildProcess | undefined} Child process with related identifier
   */
  _getChildProcess(identifier) {
    return this._childProcesses.get(identifier)?.childProcess;
  }

  /**
   * Gets the client socket id related to a child process.
   *
   * @method
   * @param {string} identifier - Identifies the child process
   * @returns {string | undefined} Client socket id related to child process
   */
  _getChildProcessClientSocketId(identifier) {
    return this._childProcesses.get(identifier)?.clientSocketId;
  }

  /**
   * Adds child process to on memory map.
   *
   * @method
   * @param {string} identifier - Identifies the child process
   * @param {ChildProcess} childProcess - Child process to add
   * @param {string} clientSocketId - Related client socket id
   */
  _addChildProcess(identifier, childProcess, clientSocketId) {
    this._childProcesses.set(identifier, { childProcess, clientSocketId });
  }

  /**
   * Removes child process from on memory map.
   *
   * @method
   * @param {string} identifier - Identifies the child process
   */
  _removeChildProcess(identifier) {
    this._childProcesses.delete(identifier);
  }
}

/**
 * Creates an instance of child process manager.
 *
 * @function
 * @param {string} processFilePath - The file path of process file for process manager
 * @returns {ChildProcessManager} An instance of `ChildProcessManager`
 */
const createChildProcessManager = (processFilePath) => {
  return new ChildProcessManager({
    processFile: processFilePath,
  });
};

module.exports = { createChildProcessManager, ChildProcessManager };
