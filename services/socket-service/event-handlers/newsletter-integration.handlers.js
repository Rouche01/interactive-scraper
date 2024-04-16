const {
  INTEGRATION_TYPE,
  SOCKET_EVENTS: {
    NW_INTEGRATION_JOIN,
    NW_INTEGRATION_AUTH,
    NW_INTEGRATION_AUTH_OTP_RES,
    NW_INTEGRATION_SELECT_AUDIENCE,
    NW_INTEGRATION_FETCH_AUDIENCE_LIST,
    NW_INTEGRATION_AUTH_LINK_REQ,
    NW_INTEGRATION_TERMINATE_PROCESS,
  },
} = require("../../../constants");
const {
  addJobToChildProcess,
  childProcessManager,
} = require("../../child-process-service");
const {
  AUTH,
  AUDIENCE_FETCH_INIT,
  SELECT_AUDIENCE,
  AUTH_LINK_RECEIVED,
  AUTH_OTP_RECEIVED,
} = require("../../../constants/process-message-type");

const onJoinConnection = (socket) => {
  // for logging established socket connections
  console.log(`Socket connection established with socket ${socket.id}`);
};

const onAuthInit = (socket, data) => {
  console.log(
    `${NW_INTEGRATION_AUTH} socket event received from user id: ${socket.user.sub}`
  );

  const { inputData, ...rest } = data;

  addJobToChildProcess({
    identifier: socket.user.sub,
    socketId: socket.id,
    payload: {
      ...rest,
      inputData: { ...inputData, userId: socket.user.sub },
      type: AUTH,
      userId: socket.user.sub,
      clientSocketId: socket.id,
    },
  });
};

const onAudienceListFetchInitiated = (socket, data) => {
  console.log(
    `${NW_INTEGRATION_FETCH_AUDIENCE_LIST} socket event received from user id: ${socket.user.sub}`
  );

  addJobToChildProcess({
    identifier: socket.user.sub,
    socketId: socket.id,
    payload: {
      ...data,
      type: AUDIENCE_FETCH_INIT,
      clientSocketId: socket.id,
      userId: socket.user.sub,
    },
  });
};

const onAudienceSelected = (socket, data) => {
  console.log(
    `${NW_INTEGRATION_SELECT_AUDIENCE} socket event received from user id: ${socket.user.sub}`
  );
  // TO-DO: Save the audience id to db

  addJobToChildProcess({
    identifier: socket.user.sub,
    socketId: socket.id,
    payload: {
      clientSocketId: socket.id,
      type: SELECT_AUDIENCE,
      userId: socket.user.sub,
      newsletterIntegrationType: data.integrationType,
      inputData: data.inputData,
      accountIdentifier: data.accountIdentifier,
    },
  });
};

const onTerminateProcess = (socket) => {
  console.log(
    `${NW_INTEGRATION_TERMINATE_PROCESS} socket event received from user id: ${socket.user.sub}`
  );

  childProcessManager.killChild(socket.user.sub);
};

// mailchimp integration event

const onAuthOtpReceived = (socket, data) => {
  console.log(
    `${NW_INTEGRATION_AUTH_OTP_RES} socket event received from user id: ${socket.user.sub}`
  );

  addJobToChildProcess({
    identifier: socket.user.sub,
    socketId: socket.id,
    payload: {
      clientSocketId: socket.id,
      type: AUTH_OTP_RECEIVED,
      userId: socket.user.sub,
      newsletterIntegrationType: data.newsletterIntegrationType,
      inputData: { ...data.inputData, userId: socket.user.sub },
      accountIdentifier,
    },
  });
};

// substack integration event
const onAuthLinkReceived = (socket, data) => {
  console.log(
    `${NW_INTEGRATION_AUTH_LINK_REQ} socket event received from user id: ${socket.user.sub}`
  );

  addJobToChildProcess({
    identifier: socket.user.sub,
    socketId: socket.id,
    payload: {
      clientSocketId: socket.id,
      type: AUTH_LINK_RECEIVED,
      userId: socket.user.sub,
      newsletterIntegrationType: data.newsletterIntegrationType,
      inputData: {
        ...data.inputData,
        userId: socket.user.sub,
      },
      accountIdentifier: data.accountIdentifier,
    },
  });
};

module.exports = {
  [NW_INTEGRATION_JOIN]: onJoinConnection,
  [NW_INTEGRATION_AUTH]: onAuthInit,
  [NW_INTEGRATION_AUTH_OTP_RES]: onAuthOtpReceived,
  [NW_INTEGRATION_SELECT_AUDIENCE]: onAudienceSelected,
  [NW_INTEGRATION_FETCH_AUDIENCE_LIST]: onAudienceListFetchInitiated,
  [NW_INTEGRATION_AUTH_LINK_REQ]: onAuthLinkReceived,
  [NW_INTEGRATION_TERMINATE_PROCESS]: onTerminateProcess,
};
