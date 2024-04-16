const {
  SOCKET_EVENTS: {
    NW_INTEGRATION_AUTH_ERROR,
    NW_INTEGRATION_AUTH_OTP_REQ,
    NW_INTEGRATION_AUTH_SUCCESS,
  },
  INTEGRATION_TYPE,
} = require("../../../constants");
const { saveSessionCookies } = require("../../../services/bot-service/utils");
const { emitToClient } = require("../../../services/socket-service/utils");

const name = "login";

// stageType can be initial, intermediate or final
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId }
) => {
  return {
    url: "https://login.mailchimp.com",
    stageType,
    sequence: [
      {
        selectors: ["#username"],
        action: async ({ selectors, pipedData, key }) => {
          await puppeteerBot.page.type(selectors[0], inputData[key]);
        },
        order: 0,
        key: "username",
      },
      {
        selectors: ["#password"],
        action: async ({ selectors, pipedData, key }) => {
          await puppeteerBot.page.type(selectors[0], inputData[key]);
        },
        order: 1,
        key: "password",
      },
      {
        selectors: [],
        action: async ({}) => {
          await puppeteerBot.page.solveRecaptchas();
        },
        order: 2,
      },
      {
        selectors: [
          "#submit-btn",
          ".error-container",
          ".c-mediaBody--centered > p:nth-child(1)",
        ],
        action: async ({ selectors, pipedData, key }) => {
          try {
            await Promise.all([
              puppeteerBot.page.waitForNavigation({
                waitUntil: "networkidle0",
              }),
              puppeteerBot.page.click(selectors[[0]]),
            ]);

            const nextUrl = puppeteerBot.page.url();

            if (nextUrl === "https://login.mailchimp.com/login/post/") {
              const errorDivHandle = await puppeteerBot.page.waitForSelector(
                selectors[1]
              );
              const errorMessage = await errorDivHandle.$eval(
                selectors[2],
                (el) => el.textContent
              );
              await puppeteerBot.stopBrowser();
              emitToClient({
                socket: socketConn,
                data: { message: "Wrong auth credentials, try again" },
                event: NW_INTEGRATION_AUTH_ERROR,
                clientSocketId,
              });
            } else {
              if (nextUrl.includes("login/tfa")) {
                emitToClient({
                  socket: socketConn,
                  data: { message: "Enter OTP to continue" },
                  event: NW_INTEGRATION_AUTH_OTP_REQ,
                  clientSocketId,
                });
                return;
              }
              await saveSessionCookies(
                inputData["userId"],
                puppeteerBot.page,
                INTEGRATION_TYPE.MAILCHIMP
              );
              emitToClient({
                socket: socketConn,
                data: { message: "Mailchimp account connected successfully" },
                event: NW_INTEGRATION_AUTH_SUCCESS,
                clientSocketId,
              });
            }
          } catch (err) {
            console.log(err.message, "sequence error");
            process.exit(1);
          }
        },
        order: 3,
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
