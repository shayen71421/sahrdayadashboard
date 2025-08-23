// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyBJFN0ZyrBRdjSIz0I3uG5W7NcugN9wU2w",
  authDomain: "college-website-27cf1.firebaseapp.com",
  projectId: "college-website-27cf1",
  storageBucket: "college-website-27cf1.firebasestorage.app",
  messagingSenderId: "622259084207",
  appId: "1:622259084207:web:73cbf66c2e8cf5d1716d5a"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, db };