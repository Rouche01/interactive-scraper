const {
  SOCKET_EVENTS: { NW_INTEGRATION_AUDIENCE_LIST },
} = require("../../../constants");
const { emitToClient } = require("../../../services/socket-service/utils");

const name = "select-list";

// stageType can be initial, intermediate or final
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId }
) => {
  return {
    url: "https://us21.admin.mailchimp.com/lists/",
    stageType,
    sequence: [
      {
        selectors: ["iframe[id=fallback]", "#lists"],
        // actionOpts args
        action: async ({ selectors, pipedData }) => {
          const iframeHandle = await puppeteerBot.page.waitForSelector(
            selectors[0]
          );
          const frameDocument = await iframeHandle.contentFrame();

          const audienceList = await frameDocument.$eval(selectors[1], (el) => {
            return Array.from(el.querySelectorAll("a[title='List name']")).map(
              (e) => ({
                name: e.textContent,
                id: e.getAttribute("data-event-label"),
              })
            );
          });

          return audienceList;
        },
        order: 0,
      },
      {
        selectors: [],
        action: async ({ selectors, pipedData }) => {
          emitToClient({
            data: { lists: pipedData },
            event: NW_INTEGRATION_AUDIENCE_LIST,
            socket: socketConn,
            clientSocketId,
          });
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
