import { db } from "./firebase.js"; // adjust to your firebase config
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js"; // adjust to your firebase config
/**
 * Fetches all newsletters for a given department.
 * Structure:
 * department/{departmentId}/newsLetter/{year}/newsletters/{newsletterName}
 */
export const fetchDepartmentNewsletters = async (departmentId) => {
  try {
    const newsletterCollectionRef = collection(db, "department", departmentId, "newsLetter");
    const yearSnapshot = await getDocs(newsletterCollectionRef);

    if (yearSnapshot.empty) {
      return null;
    }

    const newslettersByYear = {};

    for (const yearDoc of yearSnapshot.docs) {
      const year = yearDoc.id;
      const newslettersRef = collection(yearDoc.ref, "newsletters");
      const newsletterSnapshot = await getDocs(newslettersRef);

      newslettersByYear[year] = {};
      for (const newsletterDoc of newsletterSnapshot.docs) {
        newslettersByYear[year][newsletterDoc.id] = newsletterDoc.data();
      }
    }
    return newslettersByYear;
  } catch (error) {
    console.error("Error fetching department newsletters:", error);
    return null;
  }
};

/**
 * Adds a new year document for newsletters in a department.
 */
export const addNewsletterYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "newsLetter", year);
    await setDoc(yearDocRef, {}); // Creates empty year doc
  } catch (error) {
    console.error("Error adding newsletter year:", error);
    throw error;
  }
};

/**
 * Adds a new newsletter event to a specific year within a department.
 */
export const addNewsletterEvent = async (departmentId, year, newsletterName, start, end, pdfFile) => {
  if (!pdfFile) {
    console.error("PDF file is required to add a newsletter event.");
    throw new Error("PDF file is required.");
  }

  try {
    // Upload PDF first
    const { downloadURL, storagePath } = await uploadNewsletterPdf(pdfFile, departmentId, year, newsletterName);

    // Then add newsletter event to Firestore
    const newsletterDocRef = doc(db, "department", departmentId, "newsLetter", year, "newsletters", newsletterName);
    await setDoc(newsletterDocRef, {
      start: start,
      end: end,
      pdf: downloadURL, // Store the download URL in Firestore
      storagePath: storagePath // Optionally store the storage path
    });
  } catch (error) {
    console.error(`Error adding newsletter event "${newsletterName}" for year ${year}:`, error);
    throw error;
  }
};

/**
 * Uploads a newsletter PDF to Firebase Storage.
 */
export const uploadNewsletterPdf = async (file, departmentId, year, newsletterName) => {
  try {
    const storageRef = ref(storage, `${departmentId}/newsLetter/${year}/${newsletterName}.pdf`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask; // Wait for the upload to complete
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
 return { downloadURL, storagePath: storageRef.fullPath }; // Return both URL and path
  } catch (error) {
 console.error(`Error uploading newsletter PDF "${newsletterName}" for year ${year}:`, error);
 throw error; // Re-throw the error to be caught by the calling function
  }
};

/**
 * Fetches newsletters for a specific year within a department.
 */
export const fetchDepartmentNewslettersByYear = async (departmentId, year) => {
  try {
    const newsletters = [];
    const newslettersRef = collection(db, "department", departmentId, "newsLetter", year, "newsletters");
    const newsletterSnapshot = await getDocs(newslettersRef);

    for (const newsletterDoc of newsletterSnapshot.docs) {
      newsletters.push({
        year,
        name: newsletterDoc.id,
        ...newsletterDoc.data(),
      });
    }
    return newsletters;
  } catch (error) {
    console.error(`Error fetching department newsletters for year ${year}:`, error);
    return [];
  }
};

//Delete entire newsletter year
export const deleteNewsletterYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "newsLetter", year);
    await deleteDoc(yearDocRef);
    console.log(`Deleted newsletters for year: ${year}`);
  } catch (error) {
    console.error("Error deleting newsletter year:", error);
    throw error;
  }
};
