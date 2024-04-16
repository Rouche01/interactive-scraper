require("../../../types/stage-config");

const { ElementHandle } = require("puppeteer");
const { saveSessionCookies } = require("../../../services/bot-service/utils");
const {
  SOCKET_EVENTS: {
    NW_INTEGRATION_AUTH_EMAIL_SENT,
    NW_INTEGRATION_AUTH_ERROR,
    NW_INTEGRATION_AUTH_SUCCESS,
  },
  INTEGRATION_TYPE,
} = require("../../../constants");
const { emitToClient } = require("../../../services/socket-service/utils");

const name = "login";

/**
 * Gets the configuration for a login stage in substack integration.
 *
 * @function
 * @param {string} [stageType="intermediate"] - The type of the stage.
 * @param {GetStageConfigOptions} options - The options for getting a stage configuration.
 * @returns {StageConfig} The configuration for the specified stage.
 */
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId, accountIdentifier }
) => {
  console.log(socketConn.id);
  return {
    url: "https://substack.com/sign-in",
    stageType,
    sequence: [
      {
        selectors: ["input[type=email]"],
        action: async ({ selectors, pipedData, key }) => {
          await puppeteerBot.page.type(selectors[0], inputData[key]);
        },
        order: 0,
        key: "email",
      },
      {
        selectors: ["input[type=password]", "a.substack-login__login-option"],
        action: async ({ selectors, pipedData, key }) => {
          if (inputData[key]) {
            await puppeteerBot.page.click(selectors[1]);
            await puppeteerBot.page.type(selectors[0], inputData[key]);
            return { usePassword: true };
          } else {
            return { usePassword: false };
          }
        },
        order: 1,
        key: "password",
      },
      {
        selectors: [
          "button[type=submit]",
          "#substack-login > div:nth-child(2)  > div:nth-child(2) > h4",
          "#error-container",
          "button[data-href^='https://']",
        ],
        action: async ({ selectors, pipedData, key }) => {
          const { usePassword } = pipedData;
          try {
            await puppeteerBot.page.click(selectors[0]);
            if (usePassword) {
              let el;

              try {
                el = await puppeteerBot.page.waitForSelector(selectors[2]);
              } catch (err) {
                await puppeteerBot.page.waitForSelector(selectors[3]);

                const firstNavBtnText = await puppeteerBot.page.$eval(
                  selectors[3],
                  (el) => el.innerText
                );

                if (firstNavBtnText === "Dashboard") {
                  await saveSessionCookies(
                    inputData["userId"],
                    accountIdentifier,
                    puppeteerBot.page,
                    INTEGRATION_TYPE.SUBSTACK
                  );
                  emitToClient({
                    socket: socketConn,
                    clientSocketId,
                    event: NW_INTEGRATION_AUTH_SUCCESS,
                    data: {
                      message: "Substack account connected successfully",
                    },
                  });
                } else {
                  await puppeteerBot.stopBrowser();
                  emitToClient({
                    socket: socketConn,
                    clientSocketId,
                    event: NW_INTEGRATION_AUTH_ERROR,
                    data: {
                      message: "Unable to connect Substack account",
                    },
                  });
                }
              }

              if (el instanceof ElementHandle) {
                await puppeteerBot.stopBrowser();
                emitToClient({
                  socket: socketConn,
                  clientSocketId,
                  event: NW_INTEGRATION_AUTH_ERROR,
                  data: {
                    message: "Wrong auth credentials",
                  },
                });
              } else {
                await saveSessionCookies(
                  inputData["userId"],
                  accountIdentifier,
                  puppeteerBot.page,
                  INTEGRATION_TYPE.SUBSTACK
                );
                emitToClient({
                  socket: socketConn,
                  clientSocketId,
                  event: NW_INTEGRATION_AUTH_SUCCESS,
                  data: {
                    message: "Substack account connected successfully",
                  },
                });
              }
            } else {
              const checkEmailHandle = await puppeteerBot.page.waitForSelector(
                selectors[1]
              );

              const checkEmailText = await puppeteerBot.page.evaluate(
                (el) => el.innerText,
                checkEmailHandle
              );

              if (checkEmailText === "Check your email") {
                emitToClient({
                  socket: socketConn,
                  clientSocketId,
                  event: NW_INTEGRATION_AUTH_EMAIL_SENT,
                  data: {
                    message:
                      "You have received an email with a link that you can use to sign in",
                  },
                });
              } else {
                await puppeteerBot.stopBrowser();
                emitToClient({
                  socket: socketConn,
                  clientSocketId,
                  event: NW_INTEGRATION_AUTH_ERROR,
                  data: {
                    message: "Unable to connect Substack account",
                  },
                });
              }
            }
          } catch (err) {
            process.exit(1);
          }
        },
        order: 2,
      },
    ],
  };
};

module.exports = {
  name,
  getConfig(stageType, stageHelpers) {
    return getStageConfig(stageType, stageHelpers);
  },
};
