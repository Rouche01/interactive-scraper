require("./types");

const { startFlow } = require("../bot-service/utils");
const {
  AUTH,
  AUDIENCE_FETCH_INIT,
  SELECT_AUDIENCE,
  AUTH_LINK_RECEIVED,
  AUTH_OTP_RECEIVED,
} = require("../../constants/process-message-type");

const { INTEGRATION_FLOW } = require("../../constants");

/**
 * Handler for `AUTH` message type
 *
 * @function
 * @param {AuthMessagePayload} message - Message payload
 */
const onAuth = async (message) => {
  const {
    accountIdentifier,
    newsletterIntegrationType,
    clientSocketId,
    userId,
    inputData,
    socketConn,
    bot,
  } = message;

  await startFlow({
    clientSocketId,
    flowName: INTEGRATION_FLOW[newsletterIntegrationType].LOGIN,
    integrationType: newsletterIntegrationType,
    inputData,
    socketConn,
    puppeteerBot: bot,
    botPolicy: "keepAlive",
    userId,
    accountIdentifier,
  });
};

/**
 * Handler for `AUDIENCE_FETCH_INIT` message type
 *
 * @function
 * @param {AudienceFetchInitMessagePayload} message - Message payload
 */
const onAudienceFetchInit = async (message) => {
  const {
    clientSocketId,
    newsletterIntegrationType,
    socketConn,
    bot,
    userId,
    accountIdentifier,
  } = message;

  await startFlow({
    flowName: INTEGRATION_FLOW[newsletterIntegrationType].SELECT_LIST,
    integrationType: newsletterIntegrationType,
    socketConn,
    puppeteerBot: bot,
    botPolicy: "keepAlive",
    clientSocketId,
    userId,
    accountIdentifier,
  });
};

/**
 * Handler for `SELECT_AUDIENCE` message type
 *
 * @function
 * @param {SelectAudienceMessagePayload} message - Message payload
 */
const onAudienceSelect = async (message) => {
  const {
    clientSocketId,
    inputData,
    newsletterIntegrationType,
    socketConn,
    bot,
    userId,
    accountIdentifier,
  } = message;

  await startFlow({
    flowName: INTEGRATION_FLOW[newsletterIntegrationType].EXTRACT_DATA,
    integrationType: newsletterIntegrationType,
    socketConn,
    puppeteerBot: bot,
    inputData,
    botPolicy: "kill",
    clientSocketId,
    userId,
    accountIdentifier,
  });

  process.exit(0);
};

/**
 * Handler for `AUTH_LINK_RECEIVED` message type
 *
 * @function
 * @param {AuthLinkMessagePayload} message - Message payload
 */
const onAuthLinkReceived = async (message) => {
  const {
    clientSocketId,
    inputData,
    newsletterIntegrationType,
    socketConn,
    bot,
    userId,
    accountIdentifier,
  } = message;

  await startFlow({
    flowName: INTEGRATION_FLOW[newsletterIntegrationType].AUTH_LINK,
    integrationType: newsletterIntegrationType,
    socketConn,
    puppeteerBot: bot,
    inputData,
    botPolicy: "keepAlive",
    clientSocketId,
    userId,
    accountIdentifier,
  });
};

/**
 * Handler for `AUTH_OTP_RECEIVED` message type
 *
 * @function
 * @param {AuthOtpMessagePayload} message - Message payload
 */
const onAuthOtpReceived = async (message) => {
  const {
    clientSocketId,
    inputData,
    newsletterIntegrationType,
    socketConn,
    userId,
    bot,
    accountIdentifier,
  } = message;

  await startFlow({
    flowName: INTEGRATION_FLOW[newsletterIntegrationType].TOTP,
    integrationType: newsletterIntegrationType,
    socketConn,
    puppeteerBot: bot,
    inputData,
    botPolicy: "keepAlive",
    clientSocketId,
    userId,
    accountIdentifier,
  });
};

module.exports = {
  [AUTH]: onAuth,
  [AUDIENCE_FETCH_INIT]: onAudienceFetchInit,
  [SELECT_AUDIENCE]: onAudienceSelect,
  [AUTH_LINK_RECEIVED]: onAuthLinkReceived,
  [AUTH_OTP_RECEIVED]: onAuthOtpReceived,
};
