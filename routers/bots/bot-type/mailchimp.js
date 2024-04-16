const express = require("express");
const {
  addJobToChildProcess,
} = require("../../../services/child-process-service");
const { appConfig } = require("../../../config");

const name = "mailchimp";

/**
 * Runs puppeteer automation bot for mailchimp
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
   * Runs puppeteer automation bot for mailchimp
   *
   * @function
   * @async
   * @param {import('../types').RunBotArgs} args
   */
  run: async (args) => runBot(args),
  name,
  router: express.Router(),
};
