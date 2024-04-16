const {
  SOCKET_EVENTS: { NW_INTEGRATION_AUTH_SUCCESS, NW_INTEGRATION_AUTH_ERROR },
  INTEGRATION_TYPE,
} = require("../../../constants");
const { saveSessionCookies } = require("../../../services/bot-service/utils");
const { emitToClient } = require("../../../services/socket-service/utils");

const name = "auth-link";

// stageType can be initial, intermediate or final
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId, accountIdentifier }
) => {
  return {
    url: inputData.authLink,
    stageType,
    sequence: [
      {
        selectors: ["button[data-href^='https://']"],
        action: async ({ selectors, pipedData, key }) => {
          await puppeteerBot.page.goto("https://substack.com/browse", {
            waitUntil: "networkidle0",
          });

          const firstNavBtnEl = await puppeteerBot.page.waitForSelector(
            selectors[0]
          );

          const firstNavBtnText = await puppeteerBot.page.evaluate(
            (el) => el.innerText,
            firstNavBtnEl
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
            console.log("Unable to authenticate with auth link");
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
        },
        order: 0,
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
