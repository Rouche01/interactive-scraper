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
    url: "https://substack.com/settings",
    stageType,
    sequence: [
      {
        selectors: [
          "#publications > div.reader2-settings-box",
          "a.reader2-settings-row",
          "div > div:nth-child(2) > div:nth-child(1)",
        ],
        // actionOpts args
        action: async ({ selectors, pipedData, key }) => {
          const publicationList = await puppeteerBot.page.$eval(
            selectors[0],
            (el, selectors) => {
              return Array.from(el.querySelectorAll(selectors[1])).map((e) => {
                const publicationLink = e.getAttribute("href");
                const publicationTitle = e.querySelector(
                  selectors[2]
                ).textContent;
                return {
                  name: publicationTitle,
                  link: publicationLink,
                };
              });
            },
            selectors
          );

          return publicationList;
        },
        order: 0,
      },
      {
        selectors: [],
        action: async ({ selectors, pipedData, key }) => {
          emitToClient({
            socket: socketConn,
            clientSocketId,
            event: NW_INTEGRATION_AUDIENCE_LIST,
            data: { lists: pipedData },
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
