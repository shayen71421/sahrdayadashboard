import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

export const createFacultyUser = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify the ID token and check admin claim
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken.admin) {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    // Extract email and password from request body
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }

    // Create the user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false,
    });

    // Set custom claim to mark user as faculty
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      faculty: true
    });

    functions.logger.info(`Faculty user created: ${email} (UID: ${userRecord.uid})`, {
      structuredData: true,
      adminEmail: decodedToken.email,
      facultyEmail: email,
      uid: userRecord.uid
    });

    res.status(200).json({
      success: true,
      message: "Faculty user created successfully",
      uid: userRecord.uid,
      email: email
    });

  } catch (error: any) {
    functions.logger.error("Error creating faculty user:", error, {
      structuredData: true
    });

    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-exists") {
      res.status(400).json({ error: "Email already exists" });
    } else if (error.code === "auth/invalid-email") {
      res.status(400).json({ error: "Invalid email address" });
    } else if (error.code === "auth/weak-password") {
      res.status(400).json({ error: "Password is too weak" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Optional: Function to list all faculty users (admin only)
export const listFacultyUsers = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify the ID token and check admin claim
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken.admin) {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    // List all users (you might want to paginate this in production)
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Filter users with faculty custom claim
    const facultyUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.faculty === true
    ).map(user => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      }
    }));

    res.status(200).json({
      success: true,
      facultyUsers: facultyUsers,
      totalCount: facultyUsers.length
    });

  } catch (error: any) {
    functions.logger.error("Error listing faculty users:", error, {
      structuredData: true
    });

    res.status(500).json({ error: "Internal server error" });
  }
});

// Optional: Function to delete a faculty user (admin only)
export const deleteFacultyUser = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  // Only allow DELETE requests
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify the ID token and check admin claim
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken.admin) {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    // Extract UID from request body
    const { uid } = req.body;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    // Get user record to check if they are faculty
    const userRecord = await admin.auth().getUser(uid);
    
    if (!userRecord.customClaims || !userRecord.customClaims.faculty) {
      res.status(400).json({ error: "User is not a faculty member" });
      return;
    }

    // Delete the user
    await admin.auth().deleteUser(uid);

    functions.logger.info(`Faculty user deleted: ${userRecord.email} (UID: ${uid})`, {
      structuredData: true,
      adminEmail: decodedToken.email,
      facultyEmail: userRecord.email,
      uid: uid
    });

    res.status(200).json({
      success: true,
      message: "Faculty user deleted successfully",
      uid: uid
    });

  } catch (error: any) {
    functions.logger.error("Error deleting faculty user:", error, {
      structuredData: true
    });

    if (error.code === "auth/user-not-found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
