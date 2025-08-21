import { db } from '../utils/firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';

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
