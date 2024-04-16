const express = require("express");
const {
  addJobToChildProcess,
} = require("../../../services/child-process-service");
const { appConfig } = require("../../../config");

const name = "substack";

/**
 * Runs puppeteer automation bot for substack
 *
 * @function
 * @async
 * @param {import('../types').RunBotArgs} args
 */
const runBot = ({ userId, messagePayload }) => {
  addJobToChildProcess({
    identifier: userId,
    socketId: appConfig.dummySocketId,
    payload: messagePayload,
  });
};

module.exports = {
  /**
   * Runs puppeteer automation bot for substack
   *
   * @function
   * @async
   * @param {import('../types').RunBotArgs} args
   */
  run: (args) => runBot(args),
  name,
  router: express.Router(),
};
