// Setup script to create the first admin user
// Run this once to set up your first admin user

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and place it in this directory as 'serviceAccountKey.json'
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createAdminUser() {
  try {
    // Replace with your admin email and password
    const adminEmail = 'admin@sahrdaya.ac.in';
    const adminPassword = 'your-secure-password';

    // Create the admin user
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
    });

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 UID:', userRecord.uid);
    console.log('🎯 Custom Claims: { admin: true }');
    console.log('\nYou can now login at: /admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
