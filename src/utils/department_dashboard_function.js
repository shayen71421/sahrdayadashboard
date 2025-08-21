import { db } from '../utils/firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs , deleteDoc, setDoc  } from 'firebase/firestore';

export const fetchPoPsoPeo = async (departmentId, programId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return {};
    }
  } catch (error) {
    console.error("Error fetching poPsoPeoCo data: ", error);
    throw error;
  }
};

// Function to add a new program
export const addProgram = async (departmentId, programId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    await setDoc(docRef, {
      id: programId,
      courses: [], // Initial courses array
    });
  } catch (error) {
    console.error("Error adding program: ", error);
  }
};

export const addPoPsoPeoItem = async (departmentId, programId, arrayName, newItem) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    await updateDoc(docRef, {
      [arrayName]: arrayUnion(newItem)
    });
    console.log("Item added successfully!");
  } catch (error) {
    console.error("Error adding item: ", error);
    throw error;
  }
};

export const removePoPsoPeoItem = async (departmentId, programId, arrayName, itemToRemove) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    await updateDoc(docRef, {
      [arrayName]: arrayRemove(itemToRemove)
    });
    console.log("Item removed successfully!");
  } catch (error) {
    console.error("Error removing item: ", error);
    throw error;
  }
};

// Function to update an existing item in a specific array within poPsoPeo
// This function requires you to find the index of the item to update and then replace it.
// Firestore doesn't have a direct way to update an item within an array by value.
// A common approach is to fetch the array, modify it, and then update the entire array.
// Be cautious with this approach in highly concurrent scenarios as it can lead to race conditions.
// A more robust approach for complex updates might involve storing array items as subcollections.
export const updatePoPsoPeoItem = async (departmentId, programId, arrayName, oldItem, newItem) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentArray = data[arrayName];
      const index = currentArray.findIndex(item => JSON.stringify(item) === JSON.stringify(oldItem));

      if (index !== -1) {
        const updatedArray = [...currentArray];
        updatedArray[index] = newItem;

        await updateDoc(docRef, {
          [arrayName]: updatedArray
        });
        console.log("Item updated successfully!");
      } else {
        console.log("Item not found in the array.");
      }
    } else {
      console.log("Document not found!");
    }
  } catch (error) {
    console.error("Error updating item: ", error);
    throw error;
  }
};

export async function getPoPsoPeo(department) {
    const poPsoPeoRef = collection(db, 'department', 'cse', 'poPsoPeo');
    const poPsoPeoSnapshot = await getDocs(poPsoPeoRef);
    const poPsoPeo = poPsoPeoSnapshot.docs.map(doc => doc.data());
    return poPsoPeo;
}


// Function to fetch all programs for a given department
export const getProgrammesOffered = async (departmentId) => {
  try {
    const programmesRef = collection(db, 'department', departmentId, 'programmesOffered');
    const programmesSnapshot = await getDocs(programmesRef);
    const programmes = programmesSnapshot.docs.map(doc => ({
      id: doc.id, // Include document ID as program ID
      ...doc.data()
    }));
    return programmes;
  } catch (error) {
    console.error("Error fetching programmes offered: ", error);
    throw error;
  }
};

// Function to fetch details of a specific program
export const getProgramDetails = async (departmentId, programId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Program document does not exist.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching program details: ", error);
    throw error;
  }
};

// Function to update the mainText of a program
export const updateProgramMainText = async (departmentId, programId, newText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    await updateDoc(docRef, {
      mainText: newText
    });
    console.log("Program mainText updated successfully!");
  } catch (error) {
    console.error("Error updating program mainText: ", error);
    throw error;
  }
};

// Function to update a specific card (title and text) of a program
export const updateProgramCard = async (departmentId, programId, cardIndex, newTitle, newText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentCardTitles = data.cardTitle || [];
      const currentCardTexts = data.cardText || [];

      if (cardIndex >= 0 && cardIndex < currentCardTitles.length && cardIndex < currentCardTexts.length) {
        currentCardTitles[cardIndex] = newTitle;
        currentCardTexts[cardIndex] = newText;

        await updateDoc(docRef, {
          cardTitle: currentCardTitles,
          cardText: currentCardTexts
        });
        console.log("Program card updated successfully!");
      } else {
        console.log("Invalid card index.");
      }
    } else {
      console.log("Program document not found!");
    }
  } catch (error) {
    console.error("Error updating program card: ", error);
    throw error;
  }
};

// Function to add a new cardTitle and cardText pair to a program
export const addProgramCard = async (departmentId, programId, cardTitle, cardText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    await updateDoc(docRef, {
      cardTitle: arrayUnion(cardTitle),
      cardText: arrayUnion(cardText)
    });
    console.log("Program card added successfully!");
  } catch (error) {
    console.error("Error adding program card: ", error);
    throw error;
  }
};

// Function to delete a cardTitle and cardText pair from a program
// This is a bit tricky with arrayRemove as it removes all instances matching the value.
// A more robust solution might involve restructuring your data or fetching, modifying, and updating the whole array.
// For simplicity with arrayRemove, we assume unique card titles/texts or accept removing all matches.
export const deleteProgramCard = async (departmentId, programId, cardIndex) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentCardTitles = data.cardTitle || [];
      const currentCardTexts = data.cardText || [];

      if (cardIndex >= 0 && cardIndex < currentCardTitles.length && cardIndex < currentCardTexts.length) {
        currentCardTitles.splice(cardIndex, 1);
        currentCardTexts.splice(cardIndex, 1);

        await updateDoc(docRef, {
          cardTitle: currentCardTitles,
          cardText: currentCardTexts
        });
        console.log("Program card deleted successfully!");
      } else {
        console.log("Invalid card index.");
      }
    } else {
      console.log("Program document not found!");
    }
  } catch (error) {
    console.error("Error deleting program card: ", error);
    throw error;
  }
};
// Function to delete a program document

export const deleteProgram = async (departmentId, programId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'programmesOffered', programId);
    await deleteDoc(docRef);
    console.log("Program deleted successfully!");
  } catch (error) {
    console.error("Error deleting program: ", error);
    throw error;
  }
};
