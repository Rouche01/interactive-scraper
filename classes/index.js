const { PuppeteerBot, createPuppeteerBot } = require("./puppeteer-bot");
const { CustomError, ValidationError } = require("./error");
const {
  createChildProcessManager,
  ChildProcessManager,
} = require("./child-process-manager");

module.exports = {
  ChildProcessManager,
  PuppeteerBot,
  CustomError,
  ValidationError,
  createChildProcessManager,
  createPuppeteerBot,
};
