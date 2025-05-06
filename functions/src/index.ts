/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
// import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Hello endpoint - returns a simple hello message
 *
 * @example
 * GET /hello
 *
 * @returns {object} Response with hello message and project ID
 */
export const hello = onRequest({
  region: 'us-central1',
  cors: true,
}, async (req, res) => {
  // Log the request
  logger.info('Hello endpoint called', {
    projectId: process.env.GCLOUD_PROJECT,
    method: req.method,
    url: req.originalUrl,
  });

  // Get the current project ID
  const projectId = process.env.GCLOUD_PROJECT || 'unknown';

  // Return a hello message with the project ID
  res.status(200).json({
    message: 'Hello from Firebase Functions!',
    projectId: projectId,
    timestamp: new Date().toISOString(),
  });
});

