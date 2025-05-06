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
export const helloWorld = onRequest({
  region: 'us-central1',
  cors: true,
}, async (req, res) => {
  // Log the request
  logger.info('Hello WORLD endpoint called', {
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

/**
 * Create user endpoint - creates a new user in Firebase Auth and Firestore
 *
 * @example
 * POST /createUser
 * {
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "email": "john.doe@example.com",
 *   "password": "securePassword123",
 *   "role": "user"
 * }
 *
 * @returns {object} Response with created user data
 */
export const createUser = onRequest({
  region: 'us-central1',
  cors: true,
}, async (req, res) => {
  try {
    // Log the request
    logger.info('createUser endpoint called', {
      projectId: process.env.GCLOUD_PROJECT,
      method: req.method,
      url: req.originalUrl,
    });

    // Check if method is POST
    if (req.method !== 'POST') {
      logger.warn('Method not allowed', { method: req.method });
      res.status(405).json({ error: 'Method not allowed. Please use POST.' });
      return;
    }

    // Validate request body
    const { first_name, last_name, email, password, role } = req.body;
    
    if (!first_name || !last_name || !email || !password || !role) {
      logger.warn('Missing required fields', { 
        hasFirstName: !!first_name,
        hasLastName: !!last_name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role
      });
      res.status(400).json({ 
        error: 'Missing required fields. Please provide first_name, last_name, email, password, and role.' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Invalid email format', { email });
      res.status(400).json({ error: 'Invalid email format.' });
      return;
    }

    // Password validation (at least 8 characters)
    if (password.length < 8) {
      logger.warn('Password too short');
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${first_name} ${last_name}`,
    });

    // Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      first_name,
      last_name,
      email,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

    // Log success
    logger.info('User created successfully', { 
      uid: userRecord.uid,
      email,
      role
    });

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        first_name,
        last_name,
        email,
        role,
      }
    });
  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      logger.error('Error creating user', { error: error.message });
      
      if (error.message.includes('auth/email-already-exists')) {
        res.status(409).json({ error: 'Email already exists.' });
        return;
      }
      
      if (error.message.includes('auth/invalid-email')) {
        res.status(400).json({ error: 'Invalid email format.' });
        return;
      }
      
      if (error.message.includes('auth/weak-password')) {
        res.status(400).json({ error: 'Password is too weak.' });
        return;
      }
    }
    
    // Generic error response
    logger.error('Unexpected error creating user', { error });
    res.status(500).json({ error: 'An unexpected error occurred while creating the user.' });
  }
});
