import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBJFN0ZyrBRdjSIz0I3uG5W7NcugN9wU2w",
  authDomain: "college-website-27cf1.firebaseapp.com",
  projectId: "college-website-27cf1",
  storageBucket: "college-website-27cf1.firebasestorage.app",
  messagingSenderId: "622259084207",
  appId: "1:622259084207:web:73cbf66c2e8cf5d1716d5a",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const knownSubcollections = [
  "aboutDepartment",
  "hodMessage",
  "facilities",
  "poPsoPeo",
];

/**
 * Recursively copy document and specified known subcollections
 * @param {import('firebase/firestore').DocumentReference} sourceDocRef
 * @param {import('firebase/firestore').DocumentReference} targetDocRef
 */
async function copyDocWithSubcollections(sourceDocRef, targetDocRef) {
  const docSnap = await getDoc(sourceDocRef);
  if (!docSnap.exists()) {
    console.log(`Source document ${sourceDocRef.path} does not exist.`);
    return;
  }

  // Copy document data
  await setDoc(targetDocRef, docSnap.data());
  console.log(`Copied document data from ${sourceDocRef.path} to ${targetDocRef.path}`);

  // Copy known subcollections recursively
  for (const subcolName of knownSubcollections) {
    const sourceSubcolRef = collection(sourceDocRef, subcolName);
    const targetSubcolRef = collection(targetDocRef, subcolName);
    const querySnap = await getDocs(sourceSubcolRef);
    for (const subDoc of querySnap.docs) {
      const sourceSubDocRef = doc(sourceSubcolRef, subDoc.id);
      const targetSubDocRef = doc(targetSubcolRef, subDoc.id);
      // Recursively copy sub-documents
      await copyDocWithSubcollections(sourceSubDocRef, targetSubDocRef);
    }
  }
}

// Usage example:
async function copyDepartmentData() {
  const sourceDocRef = doc(db, "department", "cse");
  const targetDocRef = doc(db, "department", "ce");

  console.log("Starting copy...");
  await copyDocWithSubcollections(sourceDocRef, targetDocRef);
  console.log("Copy completed");
}

// Run copy
copyDepartmentData().catch((error) => {
  console.error("Error during copy:", error);
});
