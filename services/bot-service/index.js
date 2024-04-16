const { createPuppeteerBot, PuppeteerBot } = require("../../classes");

/**
 * A function that initializes a puppeteer bot.
 *
 * @function InitializeBotFunction
 * @async
 * @param {InitializeBotOpts} options - The options for the action function.
 * @returns {Promise<PuppeteerBot>} The result of the action function.
 */
const initializeBot = async ({ userId }) => {
  const puppeteerBot = createPuppeteerBot(userId, false);
  await puppeteerBot.init();

  return puppeteerBot;
};

module.exports = { initBot: initializeBot };
