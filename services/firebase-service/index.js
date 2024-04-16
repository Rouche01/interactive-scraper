const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const { CustomError } = require("../../classes");
const {
  appConfig: { firebaseAdmin },
} = require("../../config");

if (!admin.apps.length) {
  try {
    initializeApp({
      projectId: firebaseAdmin.projectId,
      credential: admin.credential.cert({
        clientEmail: firebaseAdmin.clientEmail,
        privateKey: firebaseAdmin.privateKey,
        projectId: firebaseAdmin.projectId,
      }),
    });
  } catch (error) {
    console.log(error.message);
    throw new CustomError(401, "Unable to initialize authentication service");
  }
}

module.exports = {
  auth: getAuth(),
};
