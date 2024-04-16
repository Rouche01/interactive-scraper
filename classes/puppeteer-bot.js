const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const { appConfig } = require("../config");
const { Page } = require("puppeteer");

/**
 * Represents PuppeteerBot options.
 * @typedef {Object} PuppeteerBotConfig
 * @property {string} userId - The user ID associated with the bot.
 * @property {boolean} [preferNonHeadless=false] - Whether to prefer non-headless mode.
 */

/**
 * Represents recaptcha provider options.
 * @typedef {Object} RecaptchaProviderOptions
 * @property {string} id - The provider ID.
 * @property {string} token - The provider token.
 */

/**
 * Represents recaptcha plugin options.
 * @typedef {Object} RecaptchaPluginOptions
 * @property {RecaptchaProviderOptions} provider - The Recaptcha provider options.
 * @property {boolean} visualFeedback - Whether to show visual feedback for Recaptcha.
 */

/**
 * PuppeteerBot represents a bot using Puppeteer for web automation.
 *
 * @class
 */
class PuppeteerBot {
  /**
   * Creates a new instance of PuppeteerBot.
   *
   * @constructor
   * @param {PuppeteerBotConfig} config - The options for configuring the PuppeteerBot.
   */
  constructor({ userId, preferNonHeadless = false }) {
    /**
     * The user ID associated with the bot.
     *
     * @type {string}
     */
    this.userId = userId;

    /**
     * The directory path for user data.
     *
     * @type {string}
     */
    this.userDataDir = `./user-${this.userId}`;

    /**
     * Whether to prefer non-headless mode.
     *
     * @type {boolean}
     */
    this.preferNonHeadless = preferNonHeadless;

    /**
     * The Puppeteer page instance.
     *
     * @type {Page|null}
     */
    this.page = null;

    /**
     * The Puppeteer browser instance.
     *
     * @type {ReturnType<puppeteer.PuppeteerExtra['launch']>|null}
     */
    this.browser = null;
  }

  /**
   * Starts the Puppeteer browser with configured options and plugins.
   *
   * @async
   * @method
   */
  async startBrowser() {
    if (!this.browser) {
      const options = {
        headless: this.preferNonHeadless ? false : "new",
        defaultViewport: false,
      };

      puppeteer.use(
        /**
         * Recaptcha plugin options.
         *
         * @type {RecaptchaPluginOptions}
         */
        RecaptchaPlugin({
          provider: { id: "2captcha", token: appConfig.captcha.apiKey },
          visualFeedback: true,
        })
      );

      puppeteer.use(StealthPlugin());

      this.browser = await puppeteer.launch(options);
    }

    if (!this.page) {
      this.page = await this.browser.newPage();

      this.page.on("close", () => {
        this.page = null;
      });
    }
  }

  /**
   * Stops the Puppeteer browser and closes the associated page.
   *
   * @async
   * @method
   */
  async stopBrowser() {
    try {
      if (this.page) {
        await this.page.close();
      }
    } catch (error) {
      console.log("page failed to close", error.message);
    } finally {
      this.page = null;
    }

    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.log("browser failed to close", error.message);
    } finally {
      this.browser = null;
    }
  }

  /**
   * Initializes the Puppeteer bot by starting the browser.
   *
   * @async
   * @method
   */
  async init() {
    await this.startBrowser();
  }

  /**
   * De-initializes the Puppeteer bot by stopping the browser.
   *
   * @async
   * @method
   */
  async deInit() {
    try {
      await this.stopBrowser();
    } catch (error) {
      console.log("unable to de-init puppeteer bot", error);
    }
  }
}

/**
 * Creates an instance of `PuppeteerBot`
 *
 * @function
 * @param {string} userId - User id
 * @param {boolean=} preferNonHeadless - Whether to prefer non-headless mode.
 * @returns {PuppeteerBot}
 */
const createPuppeteerBot = (userId, preferNonHeadless) => {
  return new PuppeteerBot({ userId, preferNonHeadless });
};

module.exports = { PuppeteerBot, createPuppeteerBot };
