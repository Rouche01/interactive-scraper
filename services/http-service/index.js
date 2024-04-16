require("./type-defs");
const { default: axios } = require("axios");
const {
  appConfig: { creatuulsPlatform },
} = require("../../config");

const creatuulsApiClient = axios.create({
  baseURL: creatuulsPlatform.apiEndpoint,
  headers: { [creatuulsPlatform.apiKeyHeader]: creatuulsPlatform.adminApiKey },
});

/**
 * Updates publisher channel metric with retrieved audience data
 *
 * @param {string} channelId
 * @param {string} channelType
 * @param {PublisherChannelMetricUpdateReqBody} publisherChannelMetricUpdateReqBody
 */
const callPublisherChannelMetricUpdate = async (
  channelId,
  channelType,
  { clickthroughRate, openRate, subscriberSize }
) => {
  const response = await creatuulsApiClient.patch(
    `/channels/${channelId}/metrics?channelType=${channelType}`,
    { clickthroughRate, openRate, subscriberSize }
  );

  console.log(`Channel id (${channelId}) => ${response.data.message}`);
};

module.exports = { creatuulsApiClient, callPublisherChannelMetricUpdate };
