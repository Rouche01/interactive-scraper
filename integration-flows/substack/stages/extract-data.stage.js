const { appConfig } = require("../../../config");
const {
  SOCKET_EVENTS: { NW_INTEGRATION_AUDIENCE_CONNECTED },
} = require("../../../constants");
const {
  callPublisherChannelMetricUpdate,
} = require("../../../services/http-service");
const { emitToClient } = require("../../../services/socket-service/utils");
const {
  convertPercentToFraction,
  convertStringToNumber,
  stripNonNumericFromString,
} = require("../../../utils/number");

const name = "extract-data";

// stageType can be initial, intermediate or final
const getStageConfig = (
  stageType = "intermediate",
  { puppeteerBot, inputData, socketConn, clientSocketId }
) => {
  return {
    url: inputData.publicationLink,
    stageType,
    sequence: [
      {
        selectors: [
          "a[href='/publish/subscribers'] > div > h1",
          "a[href='/publish/stats/traffic'] > div > h1",
          "a[href='/publish/stats/emails'] > div > h1",
          "a[href^='/publish/posts/detail']",
          "div[class*='frontend-publish-post_management-detail-TabbedGraph-module__heroStatsTabs'] > div:nth-child(3) h2",
          "input[name='name']",
          "textarea[name='hero_text']",
          "form#logo img",
          "#basics div.themed-select",
          "div[class*='singleValue']",
        ],
        action: async ({ selectors, pipedData, key }) => {
          let audienceSize = 0;
          let averageOpenRate = 0;
          let thirtyDayViews = 0;
          let averageClickRate = 0;
          let name = null;
          let shortDesc = null;
          let logo = null;
          let categories = [];

          try {
            const audienceSizeHtmlText = await puppeteerBot.page.$eval(
              selectors[0],
              (el) => {
                return el.innerText;
              }
            );
            audienceSize = convertStringToNumber(
              stripNonNumericFromString(audienceSizeHtmlText)
            );
            console.log(audienceSize, "audienceSize");
          } catch (err) {
            console.log("Unable to retrieve audience size", err.message || err);
          }

          try {
            const averageOpenRateHtmlText = await puppeteerBot.page.$eval(
              selectors[2],
              (el) => el.innerText
            );
            const percentNumber = convertStringToNumber(
              stripNonNumericFromString(averageOpenRateHtmlText)
            );
            averageOpenRate = convertPercentToFraction(percentNumber);
            console.log(averageOpenRate, "averageOpenRate");
          } catch (err) {
            console.log(
              "Unable to retrieve average open rate",
              err.message || err
            );
          }

          try {
            const thirtyDayViewsHtmlText = await puppeteerBot.page.$eval(
              selectors[1],
              (el) => el.innerText
            );

            thirtyDayViews = convertStringToNumber(
              stripNonNumericFromString(thirtyDayViewsHtmlText)
            );
            console.log(thirtyDayViews, "thirtyDayViews");
          } catch (err) {
            console.log("Unable to retrieve views data", err.message || err);
          }

          try {
            await puppeteerBot.page.goto(
              inputData.publicationLink.replace("home", "posts"),
              { waitUntil: "networkidle0" }
            );

            const firstPostId = await puppeteerBot.page.$eval(
              selectors[3],
              (el) => {
                const href = el.getAttribute("href");
                const idWithQuery = href.split("/")[4];
                return idWithQuery.split("?")[0];
              }
            );

            const engagementStatPageUrl = `${inputData.publicationLink.replace(
              "home",
              "posts"
            )}/detail/${firstPostId}/engagement`;
            console.log(engagementStatPageUrl);

            await puppeteerBot.page.goto(engagementStatPageUrl, {
              waitUntil: "networkidle0",
            });

            const averageClickRateHtmlText = await puppeteerBot.page.$eval(
              selectors[4],
              (el) => el.innerText
            );

            const percentNumber = convertStringToNumber(
              stripNonNumericFromString(averageClickRateHtmlText)
            );
            averageClickRate = convertPercentToFraction(percentNumber);
            console.log(averageClickRate, "averageClickRate");
          } catch (err) {
            console.log(
              "Unable to retrieve average click rate data",
              err.message || err
            );
          }

          try {
            await puppeteerBot.page.goto(
              inputData.publicationLink.replace("home", "settings"),
              { waitUntil: "networkidle0" }
            );

            name = await puppeteerBot.page.$eval(
              selectors[5],
              (el) => el.value
            );

            shortDesc = await puppeteerBot.page.$eval(
              selectors[6],
              (el) => el.value
            );

            logo = await puppeteerBot.page.$eval(selectors[7], (el) =>
              el.getAttribute("src")
            );
          } catch (err) {
            console.log(
              "Unable to retrieve publication metadata",
              err.message || err
            );
          }

          try {
            categories = await puppeteerBot.page.$$eval(
              selectors[8],
              (els, selectors) => {
                return els.map((el) => {
                  return el.querySelector(selectors[9]).textContent;
                });
              },
              selectors
            );
          } catch (err) {
            console.log(
              "Unable to retrieve publication categories",
              err.message || err
            );
          }

          console.log({
            audienceSize,
            averageOpenRate,
            thirtyDayViews,
            averageClickRate,
            name,
            shortDesc,
            logo,
            categories,
          });

          if (
            clientSocketId === appConfig.dummySocketId &&
            inputData["publisherChannelId"]
          ) {
            console.log(inputData["publisherChannelId"]);
            const publisherChannelId = inputData["publisherChannelId"];

            await callPublisherChannelMetricUpdate(
              publisherChannelId,
              "NEWSLETTER",
              {
                clickthroughRate: averageClickRate,
                openRate: averageOpenRate,
                subscriberSize: audienceSize,
              }
            );

            return;
          }

          emitToClient({
            socket: socketConn,
            clientSocketId,
            event: NW_INTEGRATION_AUDIENCE_CONNECTED,
            data: {
              audienceData: {
                name,
                openRate: averageOpenRate,
                clickthroughRate: averageClickRate,
                shortDesc,
                logo: logo,
                categories: categories ? categories : [],
                subscriberSize: audienceSize,
                audienceRef: inputData.publicationLink,
              },
            },
          });
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
