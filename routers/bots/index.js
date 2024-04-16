const express = require("express");
const { body } = require("express-validator");
const mailchimpBot = require("./bot-type/mailchimp");
const substackBot = require("./bot-type/substack");
const validateRequest = require("../../middlewares/validate-request");
const requireAuth = require("../../middlewares/require-auth");
const { SELECT_AUDIENCE } = require("../../constants/process-message-type");

// 0 50 19 * * *

const {
  INTEGRATION_TYPE: { SUBSTACK, MAILCHIMP },
} = require("../../constants");
const { appConfig } = require("../../config");

const router = express.Router();

router.use("/mailchimp", mailchimpBot.router);
router.use("/substack", substackBot.router);

mailchimpBot.router.post(
  "/extract-data",
  requireAuth,
  body("audienceName").isString(),
  body("audienceId").isString(),
  validateRequest,
  (req, res) => {
    mailchimpBot.run({
      userId: req.user?.firebaseUserId || req.user.sub,
      messagePayload: {
        clientSocketId: appConfig.dummySocketId,
        type: SELECT_AUDIENCE,
        userId: req.user?.firebaseUserId || req.user.sub,
        newsletterIntegrationType: MAILCHIMP,
        inputData: {
          audienceId: req.body.audienceId,
          audienceName: req.body.audienceName,
        },
      },
    });
    return res.send("Audience data extraction triggered");
  }
);

substackBot.router.post(
  "/extract-data",
  requireAuth,
  body("publicationLink").isString(),
  body("userId").isString(), // using firebase user id here
  body("accountIdentifier").isString(),
  body("publisherChannelId").isString(),
  body("keepAlive").isBoolean(),
  validateRequest,
  async (req, res) => {
    const { userId, publicationLink, accountIdentifier, publisherChannelId } =
      req.body;

    substackBot.run({
      userId,
      messagePayload: {
        clientSocketId: appConfig.dummySocketId,
        type: SELECT_AUDIENCE,
        userId,
        newsletterIntegrationType: SUBSTACK,
        inputData: {
          publicationLink,
          publisherChannelId,
        },
        accountIdentifier,
      },
    });

    return res.send("Audience data extraction triggered");
  }
);

module.exports = router;
