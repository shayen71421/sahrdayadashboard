import { db } from "./firebase.js"; // adjust to your firebase config
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

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