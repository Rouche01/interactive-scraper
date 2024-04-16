require("../../types/bot");

const fs = require("fs-extra");
const path = require("path");
const fsp = require("fs").promises;

const {
  INTEGRATION_TYPE: { MAILCHIMP, SUBSTACK },
  FLOW_AUTH_TYPE,
} = require("../../constants");

const mapIntegrationTypeToFlowConfig = {
  [MAILCHIMP]: require("../../integration-flows/mailchimp"),
  [SUBSTACK]: require("../../integration-flows/substack"),
};

/**
 * A function that retrieves all the automated stages for an integration type
 *
 * @function GetStagesFn
 * @param {string} integrationType - The newsletter integration type ("SUBSTACK"|"MAILCHIMP").
 * @returns {MappedStages} Stages mapped to their name.
 */
const getStages = (integrationType) => {
  return fs
    .readdirSync(
      path.join(__dirname, `../../integration-flows/${integrationType}/stages`)
    )
    .filter((n) => {
      return /^[a-z-0-9]+\.stage\.js$/.test(n);
    })
    .map((n) => {
      return require(path.join(
        __dirname,
        `../../integration-flows/${integrationType}/stages`,
        n
      ));
    })
    .reduce((prev, curr) => {
      prev[curr.name] = curr;
      return prev;
    }, {});
};

const traverseTransitionStages = async ({
  transitionStages,
  puppeteerBot,
  stagesRepo,
  socketConn,
  clientSocketId,
  accountIdentifier,
}) => {
  if (!puppeteerBot.page) {
    console.log("no page instance");
    return;
  }
  const currentUrl = puppeteerBot.page.url();
  const nextStage = transitionStages.find(
    (transitionStage) => transitionStage.urlState === currentUrl
  );

  if (!nextStage) {
    return;
  }

  await startStage(
    {
      currentStage: nextStage.name,
      socketConn,
      stages: stagesRepo,
      puppeteerBot,
      clientSocketId,
      accountIdentifier,
    },
    "intermediate"
  );

  return traverseTransitionStages(transitionStages, puppeteerBot);
};

/**
 * A function that starts an automated flow with initialized puppeteer bot
 *
 * @function StartFlowFunction
 * @async
 * @param {FlowOptions} options - The config options for starting a flow.
 */
const startFlow = async ({
  clientSocketId,
  integrationType,
  flowName,
  inputData,
  socketConn,
  puppeteerBot,
  botPolicy, // keepAlive or kill
  userId,
  accountIdentifier,
}) => {
  const flowConfig = mapIntegrationTypeToFlowConfig[integrationType];
  const stages = getStages(integrationType);
  const flow = flowConfig[flowName];

  const sessionCookies = await retrieveSessionCookies(
    userId,
    accountIdentifier,
    integrationType
  );

  if (flow.authType === FLOW_AUTH_TYPE.AUTH && sessionCookies) {
    // remove old cookies if it exists
    deleteSessionCookies(userId, accountIdentifier, integrationType);
  }

  if (flow.authType === FLOW_AUTH_TYPE.AUTHED) {
    if (!sessionCookies) {
      throw new Error("Authentication is required for this automation!");
    }

    // for pages that require auth set cookies if it's available
    await puppeteerBot.page.setCookie(...sessionCookies);
  }

  const flowInitialStage = flow.initialStage;
  const flowTransitionStages = flow.transitionStages;
  const flowFinalStage = flow.finalStage;

  try {
    await startStage(
      {
        currentStage: flowInitialStage.name,
        ...(inputData && { input: inputData }),
        socketConn,
        stages,
        puppeteerBot,
        clientSocketId,
        accountIdentifier,
      },
      "initial"
    );

    if (flowTransitionStages) {
      await traverseTransitionStages({
        puppeteerBot,
        socketConn,
        stagesRepo: stages,
        transitionStages: flowTransitionStages,
        clientSocketId,
        accountIdentifier,
      });
    }

    if (puppeteerBot.page && flowFinalStage) {
      await startStage(
        {
          currentStage: flowFinalStage.name,
          socketConn,
          stages,
          puppeteerBot,
          clientSocketId,
          accountIdentifier,
        },
        "final"
      );
    }

    if (botPolicy !== "keepAlive") {
      await puppeteerBot.stopBrowser();
    }
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

/**
 * A function that execute a sequence actions defined in a stage config
 *
 * @function PlaySequenceFunction
 * @async
 * @param {Array<SequenceStep>} sequences - The set of action in a stage.
 */
const playSequence = async (sequences) => {
  let pipedData;
  for (let sequenceItem of sequences) {
    const sequenceItemSelectors = sequenceItem.selectors;
    const sequenceItemKey = sequenceItem.key;
    try {
      const returnedData = await sequenceItem.action({
        selectors: sequenceItemSelectors,
        ...(pipedData && { pipedData }),
        key: sequenceItemKey,
      });

      console.log(
        `Finished sequence => ${sequenceItem.order}`,
        `pipedData => ${returnedData}`
      );

      pipedData = returnedData;
    } catch (err) {
      // log error here
      console.log(
        err?.response?.data?.error.message || err.message,
        "here is the error message"
      );
      process.exit(1);
    }
  }
};

/**
 * A function that starts an automated stage with initialized puppeteer bot
 *
 * @function StartStageFunction
 * @async
 * @param {StageOptions} stageOptions - The options for the action function.
 * @param {string} stageType - Type of stage. Can be "initial", "intermediate", or "final"
 */
const startStage = async (
  {
    currentStage,
    stages,
    input,
    socketConn,
    puppeteerBot,
    clientSocketId,
    accountIdentifier,
  },
  stageType
) => {
  console.log(`Starting ${currentStage} stage`);
  const stageConfig = stages[currentStage].getConfig(stageType, {
    socketConn,
    puppeteerBot,
    clientSocketId,
    accountIdentifier,
    ...(input && { inputData: input }),
  });

  await puppeteerBot.page.goto(stageConfig.url, {
    waitUntil: "networkidle0",
  });
  await playSequence(stageConfig.sequence);
};

/**
 * A function that writes session cookies for a user to file
 *
 * @function SaveSessionCookiesFn
 * @async
 * @param {string} userId - The user's id.
 * @param {string} accountIdentifier - The identifier for account with saved session
 * @param {Object} page - An instance of initialized puppeteer page
 * @param {string} integrationType - The type of newsletter integration
 */
const saveSessionCookies = async (
  userId,
  accountIdentifier,
  page,
  integrationType
) => {
  const cookies = await page.cookies();
  await fsp.writeFile(
    `./cookies/${integrationType}/user-${userId}-${accountIdentifier}.json`,
    JSON.stringify(cookies, null, 2)
  );
};

/**
 * A function that retrieves session cookies for an authenticated user from file
 *
 * @function RetrieveSessionCookiesFn
 * @async
 * @param {string} userId - The user's id.
 * @param {string} accountIdentifier - The identifier for account with saved session
 * @param {string} integrationType - The type of newsletter integration
 * @returns {Promise<Array<Object>|null>}
 */
const retrieveSessionCookies = async (
  userId,
  accountIdentifier,
  integrationType
) => {
  try {
    const cookiesString = await fsp.readFile(
      `./cookies/${integrationType}/user-${userId}-${accountIdentifier}.json`
    );
    return JSON.parse(cookiesString);
  } catch (err) {
    console.log(
      "Unable to retrieve session cookies for user",
      err.message || err
    );
    return null;
  }
};

/**
 * Deletes session cookies from file for a user
 *
 * @function
 * @async
 * @param {string} userId - The user id.
 * @param {string} accountIdentifier - The identifier for account with saved session
 * @param {string} integrationType - The type of newsletter integration
 * @returns {Promise<void>}
 */
const deleteSessionCookies = async (
  userId,
  accountIdentifier,
  integrationType
) => {
  console.log("deleting cookies");
  try {
    await fsp.rm(
      `./cookies/${integrationType}/user-${userId}-${accountIdentifier}.json`
    );
  } catch (err) {
    console.error(`Unable to delete session cookies for user ${userId}`);
  }
};

module.exports = {
  startFlow,
  saveSessionCookies,
  retrieveSessionCookies,
  deleteSessionCookies,
};
