const { ElementHandle } = require("puppeteer");

const {
  SOCKET_EVENTS: { NW_INTEGRATION_AUTH_SUCCESS, NW_INTEGRATION_AUTH_ERROR },
  INTEGRATION_TYPE,
} = require("../../../constants");
const { saveSessionCookies } = require("../../../services/bot-service/utils");
const { emitToClient } = require("../../../services/socket-service/utils");

const name = "totp";

// stageType can be initial, intermediate or final
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId }
) => {
  return {
    url: "https://us21.admin.mailchimp.com/login/tfa?referrer=%2F&stay-signed-in=N&from=",
    stageType,
    sequence: [
      {
        selectors: ["#totp-token", "input[type='submit']"],
        action: async ({ selectors, pipedData, key }) => {
          const [otpInput, loginBtn] = await Promise.all([
            puppeteerBot.page?.waitForSelector(selectors[0]),
            puppeteerBot.page?.waitForSelector(selectors[1]),
          ]);

          await otpInput.type(inputData[key]);
          await loginBtn.click();
          await puppeteerBot.page.waitForNavigation({
            waitUntil: "networkidle0",
          });
        },
        order: 0,
        key: "otp",
      },
      {
        selectors: ["#account-settings-btn"],
        action: async ({ selectors, pipedData, key }) => {
          await puppeteerBot.page.goto(
            "https://us21.admin.mailchimp.com/account/",
            {
              waitUntil: "networkidle0",
            }
          );

          const accountSettingsBtn = await puppeteerBot.page.waitForSelector(
            selectors[0]
          );

          if (accountSettingsBtn instanceof ElementHandle) {
            await saveSessionCookies(
              inputData["userId"],
              puppeteerBot.page,
              INTEGRATION_TYPE.MAILCHIMP
            );
            emitToClient({
              socket: socketConn,
              clientSocketId,
              event: NW_INTEGRATION_AUTH_SUCCESS,
              data: {
                message: "Mailchimp account connected successfully",
              },
            });
          } else {
            await puppeteerBot.stopBrowser();
            emitToClient({
              socket: socketConn,
              clientSocketId,
              event: NW_INTEGRATION_AUTH_ERROR,
              data: {
                message: "Unable to connect Mailchimp account",
              },
            });
          }
        },
        order: 1,
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
