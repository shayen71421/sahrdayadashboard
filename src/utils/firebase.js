// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4hwUZP66xgMpQpbWPLUVV_AoNxlC1TCg",
  authDomain: "sahrdaya-website.firebaseapp.com",
  databaseURL: "https://sahrdaya-website-default-rtdb.firebaseio.com",
  projectId: "sahrdaya-website",
  storageBucket: "sahrdaya-website.firebasestorage.app",
  messagingSenderId: "8725740882",
  appId: "1:8725740882:web:2921b3f1c4d93e78aa4e8b",
  measurementId: "G-TG2SZVPKGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
export { app, db };