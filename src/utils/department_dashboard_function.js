import { db, storage } from "./firebase.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs , deleteDoc, setDoc, deleteField, query, where , addDoc  } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable , getDownloadURL, deleteObject } from "firebase/storage";


export const fetchPoPsoPeo = async (departmentId, programId) => {
  try {
    // Construct the document path correctly based on your Firestore structure
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', 'btech');
    console.log(`Attempting to update document at path: department/${departmentId}/poPsoPeo/btech`);
    console.log(`Updating array: ${arrayName}`);
    console.log(`Replacing old item: "${oldItem}" with new item: "${newItem}"`);

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

// Function to add a new curriculum program document
export const addCurriculumProgram = async (departmentId, programId, programData) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      throw new Error(`Document with ID ${programId} already exists.`);
    }

    await setDoc(docRef, programData);
  } catch (error) {
    console.error(`Error adding curriculum program ${programId}: `, error);
    throw error;
  }
};

// Function to add a new curriculum semester document
export const addCurriculumSemester = async (departmentId, programId, schemeId, semesterId, semesterData = {}) => {
  // semesterData is optional and defaults to an empty object if not provided

  try {
    const semesterDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId);
    await setDoc(semesterDocRef, semesterData);
    console.log(`Curriculum semester ${semesterId} added successfully to scheme ${schemeId}`);
  } catch (error) {
    console.error(`Error adding curriculum semester ${semesterId} to scheme ${schemeId}: `, error);
    throw error;
  }

  try {
    // Implicitly create 'subjects' subcollection
    const subjectsSubcollectionRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'subjects', 'initialized'); // Create a dummy doc to ensure the collection exists
    await setDoc(subjectsSubcollectionRef, { initialized: true });
  } catch (error) {
    console.error(`Error initializing subcollections for semester ${semesterId}: `, error);
  }
};

// Function to add a new curriculum scheme document as a subcollection
export const addCurriculumScheme = async (departmentId, programId, schemeId, schemeData) => {
  try {
    const schemeDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId); // Create document with schemeId within the 'schemes' collection under programId
    await setDoc(schemeDocRef, schemeData); // Set the data for the scheme document

    // Now, add the 'semester 1' document under the 'semesters' subcollection of the new scheme document
    const semester1DocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', 'semester 1');
    await setDoc(semester1DocRef, {}); // Create document without initial data

    console.log(`Curriculum scheme added successfully to program ${programId}`);
  } catch (error) {
    console.error(`Error adding curriculum scheme to program ${programId}: `, error);
    throw error;
  }
};

// Function to delete a curriculum scheme document
export const deleteCurriculumScheme = async (departmentId, programId, schemeId) => {
  try {
    const schemeDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId);
    await deleteDoc(schemeDocRef);
    console.log(`Curriculum scheme ${schemeId} deleted successfully from program ${programId}`);
  } catch (error) {
    console.error(`Error deleting curriculum scheme ${schemeId} from program ${programId}: `, error);
    throw error;
  }
};

// Function to get all documents in the semesters subcollection for a scheme
export const getCurriculumSemesters = async (departmentId, programId, schemeId) => {
  try {
    const collectionRef = collection(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters');
    const snapshot = await getDocs(collectionRef);
    const semesters = [];
    snapshot.forEach(doc => {
      semesters.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return semesters;
  } catch (error) {
    console.error("Error fetching curriculum semesters: ", error);
    throw error;
  }
};

// Function to add a new curriculum subject document and upload PDF
export const addCurriculumSubject = async (departmentId, programId, schemeId, semesterId, subjectData) => {
  try {
    const { name, code, credit, elective, file, isLab } = subjectData;

    // Upload PDF to Firebase Storage
    const storagePath = `${departmentId}/curriculum&Syllabus/${programId}/schemes/${schemeId}/semesters/${semesterId}/subjects/${name}.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    // Add subject document to Firestore
    const subjectDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'subjects', name); // Using subject name as document ID
    await setDoc(subjectDocRef, {
      name: name,
      code: code,
      credit: credit,
      elective: elective,
      pdfUrl: downloadURL,
 storagePath: storagePath, // Store storage path for easy deletion
 isLab: isLab // Include the isLab field
    });

    console.log(`Curriculum subject ${name} added successfully to semester ${semesterId}`);
  } catch (error) {
    console.error(`Error adding curriculum subject to semester ${semesterId}: `, error);
    throw error;
  }
};

// Function to get all curriculum subjects for a semester
export const getCurriculumSubjects = async (departmentId, programId, schemeId, semesterId) => {
  try {
    const collectionRef = collection(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'subjects');
    const snapshot = await getDocs(collectionRef);
    const subjects = [];
    snapshot.forEach(doc => {
      subjects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return subjects;
  } catch (error) {
    console.error("Error fetching curriculum subjects: ", error);
    throw error;
  }
};

// Function to delete a curriculum subject document and its PDF
export const deleteCurriculumSubject = async (departmentId, programId, schemeId, semesterId, subjectId) => {
  try {
    const subjectDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'subjects', subjectId);
    const subjectDoc = await getDoc(subjectDocRef);
    if (subjectDoc.exists()) {
      const data = subjectDoc.data();
      const storageRef = ref(storage, data.storagePath);
      await deleteObject(storageRef); // Delete PDF from storage
    }
    await deleteDoc(subjectDocRef); // Delete subject document
    console.log(`Curriculum subject ${subjectId} deleted successfully from semester ${semesterId}`);
  } catch (error) {
    console.error(`Error deleting curriculum subject ${subjectId} from semester ${semesterId}: `, error);
    throw error;
  }
};

// Function to add a new curriculum lab document and upload PDF
export const addCurriculumLab = async (departmentId, programId, schemeId, semesterId, labData) => {
  try {
    const { name, code, credit, elective, file } = labData;

    // Upload PDF to Firebase Storage
    const storagePath = `${departmentId}/curriculum&Syllabus/${programId}/schemes/${schemeId}/semesters/${semesterId}/labs/${name}.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    // Add lab document to Firestore
    const labDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'labs', name); // Using lab name as document ID
    await setDoc(labDocRef, {
      name: name,
      code: code,
      credit: credit,
      elective: elective,
      pdfUrl: downloadURL,
      storagePath: storagePath // Store storage path for easy deletion
    });

    console.log(`Curriculum lab ${name} added successfully to semester ${semesterId}`);
  } catch (error) {
    console.error(`Error adding curriculum lab to semester ${semesterId}: `, error);
    throw error;
  }
};

// Function to get all curriculum labs for a semester
export const getCurriculumLabs = async (departmentId, programId, schemeId, semesterId) => {
  try {
    const collectionRef = collection(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'labs');
    const snapshot = await getDocs(collectionRef);
    const labs = [];
    snapshot.forEach(doc => {
      labs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return labs;
  } catch (error) {
    console.error("Error fetching curriculum labs: ", error);
    throw error;
  }
};

// Function to delete a curriculum lab document and its PDF
export const deleteCurriculumLab = async (departmentId, programId, schemeId, semesterId, labId) => {
  try {
    const labDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId, 'labs', labId);
    const labDoc = await getDoc(labDocRef);
    if (labDoc.exists()) {
      const data = labDoc.data();
      const storageRef = ref(storage, data.storagePath);
      await deleteObject(storageRef); // Delete PDF from storage
    }
    await deleteDoc(labDocRef); // Delete lab document
    console.log(`Curriculum lab ${labId} deleted successfully from semester ${semesterId}`);
  } catch (error) {
    console.error(`Error deleting curriculum lab ${labId} from semester ${semesterId}: `, error);
    throw error;
  }
};


export const getCurriculumSchemes = async (departmentId, programId) => {
  try {
    const collectionRef = collection(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes');
    const snapshot = await getDocs(collectionRef);
    const schemes = [];
    snapshot.forEach(doc => {
      schemes.push({
        id: doc.id,
 ...doc.data()
      });
    });
    return schemes;
  } catch (error) {
    console.error("Error fetching curriculum schemes: ", error);
 throw error;
  }
};

// Function to delete a curriculum semester document
export const deleteCurriculumSemester = async (departmentId, programId, schemeId, semesterId) => {
  try {
    const semesterDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId, 'schemes', schemeId, 'semesters', semesterId);
    await deleteDoc(semesterDocRef);
    console.log(`Curriculum semester ${semesterId} deleted successfully from scheme ${schemeId}`);
  } catch (error) {
    console.error(`Error deleting curriculum semester ${semesterId} from scheme ${schemeId}: `, error);
    throw error;
  }
};
// Function to get all document IDs in the curriculumAndSyllabus collection
export const getCurriculumPrograms = async (departmentId) => {
  try {
    const collectionRef = collection(db, 'department', departmentId, 'curriculumAndSyllabus');
    const snapshot = await getDocs(collectionRef);
    const documentIds = [];
    snapshot.forEach(doc => {
      documentIds.push(doc.id);
    });
    return documentIds;
  } catch (error) {
    console.error("Error fetching curriculum programs: ", error);
    throw error;
  }
};

// Function to delete a curriculum program document
export const deleteCurriculumProgram = async (departmentId, programId) => {
 try {
    const docRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', programId);
 await deleteDoc(docRef);
 console.log(`Curriculum program ${programId} deleted successfully!`);
  } catch (error) {
    console.error(`Error deleting curriculum program ${programId}: `, error);
 throw error;
  }
};

// Function to update a curriculum program document ID
export const updateCurriculumProgramId = async (departmentId, oldProgramId, newProgramId) => {
  try {
    const oldDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', oldProgramId);
    const newDocRef = doc(db, 'department', departmentId, 'curriculumAndSyllabus', newProgramId);

    // Read the data from the old document
    const docSnap = await getDoc(oldDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Create a new document with the new ID and the old data
      await setDoc(newDocRef, data);
      // Delete the old document
      await deleteDoc(oldDocRef);
      console.log(`Curriculum program ID updated from ${oldProgramId} to ${newProgramId}`);
    } else {
      console.log(`Document with ID ${oldProgramId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating curriculum program ID from ${oldProgramId} to ${newProgramId}: `, error);
    throw error;
  }
};


// Functions for About Department

// Function to fetch About Department data
export const getAboutDepartment = async (departmentId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'aboutDepartment', 'generalBrief');
    const visionMissionRef = doc(db, 'department', departmentId, 'aboutDepartment', 'vision&Mission');

    const docSnap = await getDoc(docRef);
    const visionMissionSnap = await getDoc(visionMissionRef);

    const generalBriefData = docSnap.exists() ? docSnap.data() : {};
    const visionMissionData = visionMissionSnap.exists() ? visionMissionSnap.data() : {};

    return { generalBrief: generalBriefData, visionMission: visionMissionData };
  } catch (error) {
    console.error("Error fetching About Department data: ", error);
    throw error;
  }
};

// Function to update About Department data
export const updateAboutDepartment = async (departmentId, updatedData) => {
  try {
    // Assuming updatedData has keys 'generalBrief' and 'visionMission' corresponding to document IDs
    await updateDoc(doc(db, 'department', departmentId, 'aboutDepartment', 'generalBrief'), updatedData.generalBrief);
    await updateDoc(doc(db, 'department', departmentId, 'aboutDepartment', 'vision&Mission'), updatedData.visionMission);
  } catch (error) {
    console.error("Error updating About Department data: ", error);
    throw error;
  }
};

export const uploadHodPhoto = async (departmentId, file) => {
  try {
    // Create a storage reference with the specified path and filename
    const storageRef = ref(storage, `${departmentId}/hodphoto`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading HOD photo: ", error);
    throw error;
  }
};

export const getHodMessage = async (departmentId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'hodMessage', '01');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching HOD message: ", error);
    throw error;
  }
};

export const updateHodMessage = async (departmentId, updatedMessageData) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'hodMessage', '01');
    await updateDoc(docRef, updatedMessageData);
    console.log("HOD message updated successfully!");
  } catch (error) {
    console.error("Error updating HOD message: ", error);
    throw error;
  }
};

export const deleteHodMessage = async (departmentId) => {
  try {
    // Note: Deleting the HOD message document might not be a typical use case
    // as there's usually a HOD message for a department.
    // Consider if you truly need to delete the document or just update its fields.
    // If you delete it, fetching it later will return null, and you might need
    // a way to create a new one.
    const docRef = doc(db, 'department', departmentId, 'hodMessage', '01');
    await deleteDoc(docRef);
    console.log("HOD message deleted successfully!");
  } catch (error) {
    console.error("Error deleting HOD message: ", error);
    throw error;
  }
};



// Functions for Facilities (Labs and Library)

// Function to fetch all labs for a given department
export const getLabs = async (departmentId) => {
  try {
    // Target the specific document at department/cse/facilities/labs
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Raw document data:", data); // Add logging here
      // Extract arrays from the document data, assuming each is a lab
      const labs = Object.keys(data).filter(key => Array.isArray(data[key])).map(key => ({ id: key, data: data[key] }));
      return labs;
    } else {
      console.log("No labs document found!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching labs: ", error);
    throw error;
  }
};

// Function to fetch details of a specific lab
export const getLabDetails = async (departmentId, labId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs', 'labs', labId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Lab document does not exist.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching lab details: ", error);
    throw error;
  }
};

// Function to add a new lab
export const addLab = async (departmentId, labData) => {
  try {
    // Target the specific document at department/cse/facilities/labs
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs');
    // Update the document to add a new field with labName as the key and an empty array as the value
    await updateDoc(docRef, { [labData]: ['', '', '', ''] });
  } catch (error) {
    console.error("Error adding lab: ", error);
    throw error;
  }
};

// Function to update an existing lab
export const updateLab = async (departmentId, labId, updatedLabData) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs', 'labs', labId);
    await updateDoc(docRef, updatedLabData);
    console.log("Lab updated successfully!");
  } catch (error) {
    console.error("Error updating lab: ", error);
    throw error;
  }
};

// Function to delete a lab
export const deleteLab = async (departmentId, labId) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs');
    await updateDoc(docRef, { [labId]: deleteField() });
    console.log("Lab deleted successfully!");
  } catch (error) {
    console.error("Error deleting lab: ", error);
    throw error;
  }
};

// Function to update a specific lab's data (the array)
export const updateLabData = async (departmentId, labId, updatedData) => {
  try {
    // Target the specific document at department/cse/facilities/labs
    const docRef = doc(db, 'department', departmentId, 'facilities', 'labs');
    // Update the document to modify the field with labId as the key
    await updateDoc(docRef, { [labId]: updatedData });
    console.log(`Lab data for ${labId} updated successfully!`);
  } catch (error) {
    console.error(`Error updating lab data for ${labId}: `, error);
    throw error;
  }
};

// Function to fetch library details
export const getLibrary = async (departmentId) => {
    try {
        const docRef = doc(db, 'department', departmentId, 'facilities', 'library');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("Error fetching library: ", error);
        throw error;
    }
};

// Function to update library details
export const updateLibrary = async (departmentId, updatedLibraryData) => {
    try {
        const docRef = doc(db, 'department', departmentId, 'facilities', 'library');
        await updateDoc(docRef, updatedLibraryData);
        console.log("Library updated successfully!");
    } catch (error) {
        console.error("Error updating library: ", error);
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

export const addPeo = async (departmentId, programId, peoText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    await updateDoc(docRef, {
      peo: arrayUnion(peoText)
    });
    console.log("PEO added successfully!");
  } catch (error) {
    console.error("Error adding PEO: ", error);
    throw error;
  }
};

export const addPso = async (departmentId, programId, psoText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    await updateDoc(docRef, {
      pso: arrayUnion(psoText)
    });
    console.log("PSO added successfully!");
  } catch (error) {
    console.error("Error adding PSO: ", error);
    throw error;
  }
};

export const addPo = async (departmentId, programId, poText) => {
  try {
    const docRef = doc(db, 'department', departmentId, 'poPsoPeo', programId);
    await updateDoc(docRef, {
      po: arrayUnion(poText)
    });
    console.log("PO added successfully!");
  } catch (error) {
    console.error("Error adding PO: ", error);
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

        console.log("Updated array:", updatedArray);
        await updateDoc(docRef, {
          [arrayName]: updatedArray
        });
        console.log("Item updated successfully!");
      } else {
        console.log("Item not found in the array.");
      }
    } else {
      console.log("Document not found!");
      // Optionally, create the document if it doesn't exist and add the item
    }
  } catch (error) {
    console.error("Error updating item: ", error);
    throw error;
  }
};

export async function getPoPsoPeo(department) {
    const poPsoPeoRef = collection(db, 'department', department, 'poPsoPeo');
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
 const docSnap = await getDoc(docRef);

 if (docSnap.exists()) {
 const data = docSnap.data();
 const currentCardTitles = data.cardTitle || [];
 const currentCardTexts = data.cardText || [];

 currentCardTitles.push(cardTitle);
 currentCardTexts.push(cardText);

 await updateDoc(docRef, {
 cardTitle: currentCardTitles,
 cardText: currentCardTexts
 });
 console.log("Program card added successfully!");
 } else {
 console.log("Program document not found!");
 }
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
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
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

/**
 * Deletes a specific newsletter event from a year within a department.
 */
export const deleteNewsletterEvent = async (departmentId, year, newsletterName) => {
  try {
    const newsletterDocRef = doc(db, "department", departmentId, "newsLetter", year, "newsletters", newsletterName);
    await deleteDoc(newsletterDocRef);
    console.log(`Deleted newsletter event: ${newsletterName} from year ${year}`);
  } catch (error) {
    console.error(`Error deleting newsletter event "${newsletterName}" from year ${year}:`, error);
    throw error;
  }
};



export const fetchStudentYears = async (departmentId) => {
  try {
    const yearsCollectionRef = collection(db, "department", departmentId, "people", "students", "years");
    const yearsSnapshot = await getDocs(yearsCollectionRef);
    const years = yearsSnapshot.docs.map((doc) => doc.id);
    return years;
  } catch (error) {
    console.error("Error fetching student years:", error);
    throw error;
  }
};

export const addStudentYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "people", "students", "years", year);
    await setDoc(yearDocRef, {}); // Creates an empty document for the year
  } catch (error) {
    console.error("Error adding student year:", error);
    throw error;
  }
};

export const editStudentYear = async (departmentId, oldYear, newYear) => {
  try {
    const oldYearDocRef = doc(db, "department", departmentId, "people", "students", "years", oldYear);
    const oldYearDocSnap = await getDoc(oldYearDocRef);

    if (oldYearDocSnap.exists()) {
      const data = oldYearDocSnap.data();
      const newYearDocRef = doc(db, "department", departmentId, "people", "students", "years", newYear);
      await setDoc(newYearDocRef, data);
      await deleteDoc(oldYearDocRef);
    } else {
      throw new Error("Year to edit does not exist.");
    }
  } catch (error) {
    console.error("Error editing student year:", error);
    throw error;
  }
};

export const deleteStudentYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "people", "students", "years", year);
    await deleteDoc(yearDocRef);
  } catch (error) {
    console.error("Error deleting student year:", error);
    throw error;
  }
};

/**
 * Upload class PDF linked to a specific student year and save metadata.
 *
 * @param {string} departmentId - Department identifier.
 * @param {string} year - Student year (e.g., "2024-2025").
 * @param {string} className - Class name.
 * @param {File} pdfFile - PDF file to upload.
 */
export const addClassWithPDF = async (departmentId, year, className, pdfFile) => {
  try {
    // Define storage path including year
    const storagePath = `${departmentId}/people/students/years/${year}/${className}.pdf`;
    const storageRef = ref(storage, storagePath);

    // Upload PDF
    const uploadTask = uploadBytesResumable(storageRef, pdfFile);
    await uploadTask;

    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // Firestore doc path: classes subcollection under year document
    const classDocRef = doc(
      db,
      "department",
      departmentId,
      "people",
      "students",
      "years",
      year,
      "classes",
      className
    );

    // Save class metadata
    await setDoc(classDocRef, {
      name: className,
      pdfLink: downloadURL,
      storagePath,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error adding class "${className}" for year "${year}":`, error);
    throw error;
  }
};

export const fetchClassesForYear = async (departmentId, year) => {
  try {
    const classesCollectionRef = collection(
      db,
      "department",
      departmentId,
      "people",
      "students",
      "years",
      year,
      "classes"
    );
    const classesSnapshot = await getDocs(classesCollectionRef);
    return classesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching classes for year ${year}:`, error);
    return [];
  }
};
export const deleteClass = async (departmentId, year, classId) => {
  try {
    const classDocRef = doc(
      db,
      "department",
      departmentId,
      "people",
      "students",
      "years",
      year,
      "classes",
      classId
    );
    await deleteDoc(classDocRef);
  } catch (error) {
    console.error(`Error deleting class ${classId} for year ${year}:`, error);
    throw error;
  }
};

export const fetchDacObjective = async (departmentId) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DAC");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().objective;
    } else {
      return "No objective found.";
    }
  } catch (error) {
    console.error("Error fetching objective:", error);
    throw new Error("Error fetching objective.");
  }
};

export const updateDacObjective = async (departmentId, newObjective) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DAC");
    await setDoc(docRef, { objective: newObjective });
  } catch (error) {
    console.error("Error saving objective:", error);
    throw new Error("Error saving objective.");
  }
};



// Fetch years as documents IDs under years subcollection
export const fetchDacYears = async (departmentId) => {
  try {
    const yearsCollectionRef = collection(db, "department", departmentId, "people", "DAC", "years");
    const snapshot = await getDocs(yearsCollectionRef);
    // Return array of document IDs (year strings)
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching DAC years:", error);
    throw new Error("Error fetching DAC years.");
  }
};

// Add year by creating a new doc under years subcollection
export const addDacYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "people", "DAC", "years", year);
    // Creating document with empty data, can be extended later
    await setDoc(yearDocRef, {});
  } catch (error) {
    console.error("Error adding DAC year:", error);
    throw error;
  }
};

// Delete year by deleting document under years subcollection
export const deleteDacYear = async (departmentId, year) => {
  try {
    const yearDocRef = doc(db, "department", departmentId, "people", "DAC", "years", year);
    await deleteDoc(yearDocRef);
  } catch (error) {
    console.error("Error deleting DAC year:", error);
    throw error;
  }
};





/**
 * Upload DAC Constitution PDF for a specific year.
 */
export async function uploadDacConstitutionPdf(departmentId, year, file) {
  try {
    const storagePath = `${departmentId}/people/DAC/years/${year}/constitution.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    const docRef = doc(db, "department", departmentId, "people", "DAC", "years", year, "constitution", "doc");
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return downloadURL;
  } catch (error) {
    console.error("Error uploading Constitution PDF:", error);
    throw error;
  }
}

/**
 * Upload DAC Meeting Minutes PDF for a specific year and document ID.
 */
export async function uploadDacMeetingMinutesPdf(departmentId, year, docId, file) {
  try {
    const storagePath = `${departmentId}/people/DAC/years/${year}/meetingMinutes/${docId}.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    const docRef = doc(db, "department", departmentId, "people", "DAC", "years", year, "meetingMinutes", docId);
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return downloadURL;
  } catch (error) {
    console.error("Error uploading Meeting Minutes PDF:", error);
    throw error;
  }
}


/**
 * Fetch constitution PDF metadata for a year.
 */
export async function fetchDacConstitution(departmentId, year) {
  const docRef = doc(db, "department", departmentId, "people", "DAC", "years", year, "constitution", "doc");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data();
  return null;
}

/**
 * Fetch all meeting minutes docs for a year.
 */
export async function fetchDacMeetingMinutes(departmentId, year) {
  const minutesColRef = collection(db, "department", departmentId, "people", "DAC", "years", year, "meetingMinutes");
  const snapshot = await getDocs(minutesColRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Delete constitution PDF metadata and storage file for a year (optional: add storage deletion).
 */
export async function deleteDacConstitution(departmentId, year) {
  const docRef = doc(db, "department", departmentId, "people", "DAC", "years", year, "constitution", "doc");
  await deleteDoc(docRef);
  // TODO: optionally delete storage file using storagePath stored previously
}

/**
 * Delete a meeting minutes document.
 */
export async function deleteDacMeetingMinutes(departmentId, year, docId) {
  const docRef = doc(db, "department", departmentId, "people", "DAC", "years", year, "meetingMinutes", docId);
  await deleteDoc(docRef);
  // TODO: optionally delete storage file using storagePath stored previously
}


export const fetchDqacObjective = async (departmentId) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().objective || "No objective found.";
    }
    return "No objective found.";
  } catch (error) {
    console.error("Error fetching DQAC objective:", error);
    throw new Error("Error fetching DQAC objective.");
  }
};

// Update the objective text for DQAC
export const updateDqacObjective = async (departmentId, newObjective) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC");
    await setDoc(docRef, { objective: newObjective }, { merge: true });
  } catch (error) {
    console.error("Error updating DQAC objective:", error);
    throw error;
  }
};

// Fetch all DQAC years (as document IDs from subcollection)
export const fetchDqacYears = async (departmentId) => {
  try {
    const collectionRef = collection(db, "department", departmentId, "people", "DQAC", "years");
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching DQAC years:", error);
    throw error;
  }
};

// Add a DQAC year (as a document in the years subcollection)
export const addDqacYear = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year);
    await setDoc(docRef, {});
  } catch (error) {
    console.error("Error adding DQAC year:", error);
    throw error;
  }
};

// Delete a DQAC year document
export const deleteDqacYear = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting DQAC year:", error);
    throw error;
  }
};

// Upload DQAC constitution PDF and save metadata
export const uploadDqacConstitutionPdf = async (departmentId, year, file) => {
  try {
    const storagePath = `${departmentId}/people/DQAC/years/${year}/constitution.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year, "constitution", "doc");
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading DQAC constitution PDF:", error);
    throw error;
  }
};

// Upload a meeting minutes PDF for DQAC with given docId/key
export const uploadDqacMeetingMinutesPdf = async (departmentId, year, docId, file) => {
  try {
    const storagePath = `${departmentId}/people/DQAC/years/${year}/meetingMinutes/${docId}.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year, "meetingMinutes", docId);
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading DQAC meeting minutes PDF:", error);
    throw error;
  }
};

// Get DQAC constitution document metadata for a year
export const fetchDqacConstitution = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year, "constitution", "doc");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (error) {
    console.error("Error fetching DQAC constitution:", error);
    throw error;
  }
};

// Get all DQAC meeting minutes docs metadata for a year
export const fetchDqacMeetingMinutes = async (departmentId, year) => {
  try {
    const colRef = collection(db, "department", departmentId, "people", "DQAC", "years", year, "meetingMinutes");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching DQAC meeting minutes:", error);
    throw error;
  }
};

// Delete DQAC constitution document
export const deleteDqacConstitution = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year, "constitution", "doc");
    await deleteDoc(docRef);
    // TODO: Delete file from storage if needed, using stored path
  } catch (error) {
    console.error("Error deleting DQAC constitution:", error);
    throw error;
  }
};

// Delete a DQAC meeting minutes document by docId
export const deleteDqacMeetingMinutes = async (departmentId, year, docId) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "DQAC", "years", year, "meetingMinutes", docId);
    await deleteDoc(docRef);
    // TODO: Delete file from storage if needed, using stored path
  } catch (error) {
    console.error("Error deleting DQAC meeting minutes:", error);
    throw error;
  }
};
// Fetch BOS Objective
export const fetchBosObjective = async (departmentId) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().objective || "No objective found.";
    }
    return "No objective found.";
  } catch (error) {
    console.error("Error fetching BOS objective:", error);
    throw new Error("Error fetching BOS objective.");
  }
};

// Update BOS Objective
export const updateBosObjective = async (departmentId, newObjective) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS");
    await setDoc(docRef, { objective: newObjective }, { merge: true });
  } catch (error) {
    console.error("Error updating BOS objective:", error);
    throw error;
  }
};

// Fetch BOS Academic Years
export const fetchBosYears = async (departmentId) => {
  try {
    const collectionRef = collection(db, "department", departmentId, "people", "BOS", "years");
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching BOS years:", error);
    throw new Error("Error fetching BOS years.");
  }
};

// Add BOS Year
export const addBosYear = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year);
    await setDoc(docRef, {});
  } catch (error) {
    console.error("Error adding BOS year:", error);
    throw error;
  }
};

// Delete BOS Year
export const deleteBosYear = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting BOS year:", error);
    throw error;
  }
};

// Upload BOS Constitution PDF
export const uploadBosConstitutionPdf = async (departmentId, year, file) => {
  try {
    const storagePath = `${departmentId}/people/BOS/years/${year}/constitution.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year, "constitution", "doc");
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading BOS constitution PDF:", error);
    throw error;
  }
};

// Upload BOS Meeting Minutes PDF
export const uploadBosMeetingPdf = async (departmentId, year, docId, file) => {
  try {
    const storagePath = `${departmentId}/people/BOS/years/${year}/meetingMinutes/${docId}.pdf`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year, "meetingMinutes", docId);
    await setDoc(docRef, {
      pdfLink: downloadURL,
      storagePath,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading BOS meeting PDF:", error);
    throw error;
  }
};

// Get BOS Constitution metadata
export const fetchBosConstitution = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year, "constitution", "doc");
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) return docSnap.data();
    return null;
  } catch(error) {
    console.error("Error fetching BOS constitution:", error);
    throw error;
  }
};

// Get all BOS Meeting Minutes
export const fetchBosMeetingMinutes = async (departmentId, year) => {
  try {
    const minutesCol = collection(db, "department", departmentId, "people", "BOS", "years", year, "meetingMinutes");
    const snapshot = await getDocs(minutesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch(error) {
    console.error("Error fetching BOS meeting minutes:", error);
    throw error;
  }
};

// Delete BOS Constitution document
export const deleteBosConstitution = async (departmentId, year) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year, "constitution", "doc");
    await deleteDoc(docRef);
    // optionally delete file from storage too
  } catch(error) {
    console.error("Error deleting BOS constitution:", error);
    throw error;
  }
};

// Delete BOS Meeting Minutes document
export const deleteBosMeetingMinutes = async (departmentId, year, docId) => {
  try {
    const docRef = doc(db, "department", departmentId, "people", "BOS", "years", year, "meetingMinutes", docId);
    await deleteDoc(docRef);
    // optionally delete file from storage too
  } catch(error) {
    console.error("Error deleting BOS meeting minutes:", error);
    throw error;
  }
};

// Add new TLM
export async function addTlm(departmentId, tlmData) {
  const collectionRef = collection(db, "department", departmentId, "TLMs");
  await addDoc(collectionRef, tlmData);
}

// Update TLM by id
export async function updateTlm(departmentId, tlmId, updatedData) {
  const docRef = doc(db, "department", departmentId, "TLMs", tlmId);
  await updateDoc(docRef, updatedData);
}

// Fetch all TLMs for a department
export async function fetchTlms(departmentId) {
  const collectionRef = collection(db, "department", departmentId, "TLMs");
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete TLM by id
export async function deleteTlm(departmentId, tlmId) {
  const docRef = doc(db, "department", departmentId, "TLMs", tlmId);
  await deleteDoc(docRef);
}

// Upload TLM pdf to storage, return URL
export async function uploadTlmPdf(departmentId, file , tlmtitle) {
  // Save the file with its original name under department's TLM folder
  const storagePath = `${departmentId}/TLM/${tlmtitle}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);
  await uploadTask;
  return await getDownloadURL(uploadTask.snapshot.ref);
}


export async function fetchAssociationMain(departmentId) {
  const docRef = doc(db, "department", departmentId, "association", "main");
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

export async function saveAssociationMain(departmentId, data) {
  const docRef = doc(db, "department", departmentId, "association", "main");
  await setDoc(docRef, data, { merge: true });
}

/**
 * Fetch all event years for a department.
 */
export async function fetchEventYears(departmentId) {
  const yearsCol = collection(db, "department", departmentId, "events_years");
  const snap = await getDocs(yearsCol);
  return snap.docs.map(doc => doc.id);
}

/**
 * Add a new event year for a department.
 */
export async function addEventYear(departmentId, year) {
  const docRef = doc(db, "department", departmentId, "events_years", year);
  await setDoc(docRef, {}); // Empty document, can be extended for metadata
}

/**
 * Delete an event year for a department.
 * Note: This only deletes the year doc (not events in subcollection).
 */
export async function deleteEventYear(departmentId, year) {
  const docRef = doc(db, "department", departmentId, "events_years", year);
  await deleteDoc(docRef);
}

/**
 * Fetch all event items for a given department and academic year.
 */
export async function fetchEvents(departmentId, year) {
  const eventsCol = collection(db, "department", departmentId, "events_years", year, "items");
  const snap = await getDocs(eventsCol);
  return snap.docs.map(d => ({
    id: d.id,
    name: d.data().name || "",
    type: d.data().type || "",
    date: d.data().date || "",
    pdfUrl: d.data().pdfUrl || ""
  }));
}

/**
 * Add a new event under an academic year.
 */
export async function addEvent(departmentId, year, eventData) {
  const eventsCol = collection(db, "department", departmentId, "events_years", year, "items");
  await addDoc(eventsCol, eventData);
}

/**
 * Update an existing event by ID.
 */
export async function updateEvent(departmentId, year, eventId, updatedData) {
  const docRef = doc(db, "department", departmentId, "events_years", year, "items", eventId);
  await updateDoc(docRef, updatedData);
}

/**
 * Delete an event by ID under an academic year.
 */
export async function deleteEvent(departmentId, year, eventId) {
  const docRef = doc(db, "department", departmentId, "events_years", year, "items", eventId);
  await deleteDoc(docRef);
}

/**
 * Upload an event PDF and return its public download URL.
 */
export async function uploadEventPdf(departmentId, year, eventName, file) {
  const safeName = eventName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = safeName.endsWith(".pdf") ? safeName : safeName + ".pdf";
  const path = `${departmentId}/events/${year}/${filename}`;
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  await uploadTask;
  return await getDownloadURL(uploadTask.snapshot.ref);
}