import { db, storage } from "./firebase.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs , deleteDoc, setDoc, deleteField, query, where  } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
