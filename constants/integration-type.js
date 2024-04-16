const INTEGRATION_TYPE = {
  MAILCHIMP: "MAILCHIMP",
  SUBSTACK: "SUBSTACK",
};

const INTEGRATION_FLOW = {
  [INTEGRATION_TYPE.MAILCHIMP]: {
    LOGIN: "login",
    TOTP: "totp",
    SELECT_LIST: "select-list",
    EXTRACT_DATA: "extract-data",
  },
  [INTEGRATION_TYPE.SUBSTACK]: {
    LOGIN: "login",
    AUTH_LINK: "auth-link",
    SELECT_LIST: "select-list", // select substack publication
    EXTRACT_DATA: "extract-data",
  },
};

module.exports = { INTEGRATION_TYPE, INTEGRATION_FLOW };
