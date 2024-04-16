require("../../../types/stage-config");
const { emitToClient } = require("../../../services/socket-service/utils");
const {
  SOCKET_EVENTS: { NW_INTEGRATION_AUDIENCE_CONNECTED },
} = require("../../../constants");

const name = "extract-data";

/**
 * Represents gets the configuration for a specific stage in the automation process.
 *
 * @function
 * @param {string} [stageType="intermediate"] - The type of the stage.
 * @param {GetStageConfigOptions} options - The options for getting a stage configuration.
 * @returns {StageConfig} The configuration for the specified stage.
 */
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId }
) => {
  return {
    url: `https://us21.admin.mailchimp.com/lists/dashboard/overview?id=${inputData["audienceId"]}`,
    stageType,
    sequence: [
      {
        selectors: [
          "iframe[id=fallback]",
          "#dashboard-content",
          "div:nth-child(2) > div.line.sub-section > div > div:nth-child(1) > h3 > a",
          "div:nth-child(2) > div.line.section > div.unit.size1of2.maintain-width > p > span.h4",
          "div:nth-child(2) > div.line.section > div.lastUnit.size1of2 > p > span.h4",
          ".c-inlineMeter",
          "div.c-inlineMeter_range > p",
          "div.c-inlineMeter_perc > p > span",
          "#genderLegendContainer",
          ".unit",
          "span.fwn",
          "span[data-mc-group='countUp'] > span",
        ],
        action: async ({ selectors, pipedData, key }) => {
          const iframeHandle = await puppeteerBot.page.waitForSelector(
            selectors[0]
          );
          const frameDocument = await iframeHandle.contentFrame();

          const audienceData = await frameDocument.$eval(
            selectors[1],
            (el, selectors) => {
              let audienceSize = 0;
              let averageOpenRate = 0;
              let averageClickRate = 0;
              let ageDemography = null;
              let genderDemography = null;

              const convertPercentStringToFraction = (percentString) => {
                if (!percentString) {
                  return 0;
                }

                if (typeof percentString === "number") {
                  return percentString;
                }

                const numberString = percentString.replace("%", "");
                return parseInt(numberString) / 100;
              };

              try {
                audienceSize = parseInt(
                  el.querySelector(selectors[2]).textContent
                );
              } catch {}

              try {
                averageOpenRate = convertPercentStringToFraction(
                  el.querySelector(selectors[3]).textContent
                );
              } catch {}

              try {
                averageClickRate = convertPercentStringToFraction(
                  el.querySelector(selectors[4]).textContent
                );
              } catch {}

              try {
                ageDemography = Array.from(
                  el.querySelectorAll(selectors[5])
                ).map((el) => ({
                  [el.querySelector(selectors[6]).textContent]:
                    convertPercentStringToFraction(
                      el.querySelector(selectors[7]).textContent
                    ),
                }));
              } catch {}

              try {
                const genderDataElement = el.querySelector(selectors[8]);
                genderDemography = Array.from(
                  genderDataElement.querySelectorAll(selectors[9])
                ).map((el) => ({
                  [el.querySelector(selectors[10]).textContent]:
                    convertPercentStringToFraction(
                      el.querySelector(selectors[11]).textContent
                    ),
                }));
              } catch {}

              return {
                subscriberSize: audienceSize,
                openRate: averageOpenRate,
                clickthroughRate: averageClickRate,
                ageDemography,
                genderDemography,
                shortDesc: "Update your short description",
                categories: [],
              };
            },
            selectors
          );

          console.log(audienceData);

          emitToClient({
            socket: socketConn,
            clientSocketId,
            data: {
              audienceData: {
                ...audienceData,
                name: inputData["audienceName"],
              },
            },
            event: NW_INTEGRATION_AUDIENCE_CONNECTED,
          });
        },
        order: 0,
        key: "username",
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
