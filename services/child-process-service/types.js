/**
 * @typedef {Object} MessagePayload
 * @property {string} type - Message type.
 * @property {string} userId - User id
 * @property {string} clientSocketId - The client socket id
 * @property {Object} bot - An instance of puppeteer bot
 * @property {*} [unknownKey] - Other unknown keys.
 * @property {string=} accountIdentifier - Account identifier for authed session
 */

/**
 * @typedef {Object} AuthMessagePayload
 * @property {string} type - Message type
 * @property {string=} email - Account email
 * @property {string=} username - Account username
 * @property {string=} password - Account password
 * @property {boolean=} usePassword - Flag to use password for auth
 * @property {string} newsletterIntegrationType - Type of newsletter integration
 * @property {string} userId - User id
 * @property {string} clientSocketId - The client socket id
 * @property {Object} bot - An instance of puppeteer bot
 * @property {Object} socketConn - Process socket connection
 * @property {string=} accountIdentifier - Account identifier for authed session
 */

/**
 * @typedef {Object} AudienceFetchInitMessagePayload
 * @property {string} type - Message type
 * @property {string} newsletterIntegrationType - Type of newsletter integration
 * @property {string} clientSocketId - The client socket id
 * @property {Object} socketConn - Process socket connection
 * @property {Object} bot - An instance of puppeteer bot
 * @property {string} userId - User id
 * @property {string=} accountIdentifier - Account identifier for authed session
 */

/**
 * @typedef {Object} MailchimpSelectAudienceInputData
 * @property {string} audienceId - Mailchimp audience id
 * @property {string} audienceName - Mailchimp audience name
 * @property {string=} publisherChannelId - Channel related to audience, for updating already connected publisher channel
 */

/**
 * @typedef {Object} SubstackSelectAudienceInputData
 * @property {string} publicationLink - Substack publication link
 * @property {string=} publisherChannelId - Channel related to audience, for updating already connected publisher channel
 */

/**
 * @typedef {Object} SelectAudienceMessagePayload
 * @property {string} type - Message type
 * @property {string} newsletterIntegrationType - Type of newsletter integration
 * @property {string} clientSocketId - The client socket id
 * @property {Object} socketConn - Process socket connection
 * @property {string} userId - User id
 * @property {Object} bot - An instance of puppeteer bot
 * @property {MailchimpSelectAudienceInputData|SubstackSelectAudienceInputData} inputData - User input data
 * @property {string=} accountIdentifier - Account identifier for authed session
 */

/**
 * @typedef {Object} AuthLinkInputData
 * @property {string} userId - User's id
 * @property {string} authLink - Authentication link
 * @property {Object} bot - An instance of puppeteer bot
 */

/**
 * @typedef {Object} AuthLinkMessagePayload
 * @property {string} type - Message type
 * @property {string} newsletterIntegrationType - Type of newsletter integration
 * @property {string} clientSocketId - The client socket id
 * @property {Object} socketConn - Process socket connection
 * @property {string} userId - User id
 * @property {AuthLinkInputData} inputData - User input data
 * @property {Object} bot - An instance of puppeteer bot
 * @property {string=} accountIdentifier - Account identifier for authed session
 */

/**
 * @typedef {Object} AuthOtpInputData
 * @property {string} userId - User's id
 * @property {string} otp - Auth otp
 * @property {Object} bot - An instance of puppeteer bot
 *
 */

/**
 * @typedef {Object} AuthOtpMessagePayload
 * @property {string} type - Message type
 * @property {string} newsletterIntegrationType - Type of newsletter integration
 * @property {string} clientSocketId - The client socket id
 * @property {Object} socketConn - Process socket connection
 * @property {string} userId - User id
 * @property {AuthOtpInputData} inputData - User input data
 * @property {Object} bot - An instance of puppeteer bot
 * @property {string=} accountIdentifier - Account identifier for authed session
 */
