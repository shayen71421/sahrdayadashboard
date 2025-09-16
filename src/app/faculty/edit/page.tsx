"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/utils/firebase";
import Link from "next/link";

interface Education {
  degree: string;
  field: string;
  institution: string;
}

interface EmploymentHistory {
  organization: string;
  position: string;
  timeperiod: string;
  academicYear: string;
  date: string;
}

interface Award {
  organization: string;
  title: string;
  academicYear: string;
  date: string;
}

interface Publication {
  type: string;
  title: string;
  subtitle: string;
  authors: string;
  academicYear: string;
  date: string;
}

interface ResearchProject {
  title: string;
  status: string;
  fundingagency: string;
  role: string;
  academicYear: string;
  date: string;
}

interface DoctoralStudent {
  name: string;
  status: string;
  title: string;
  organization: string;
  academicYear: string;
  date: string;
}

interface BookChapter {
  title: string;
  author: string;
  academicYear: string;
  date: string;
  isbnId: string;
}

interface Patent {
  title: string;
  patentNo: string;
  inventors: string;
  status: string;
  academicYear: string;
  date: string;
}

interface Conference {
  title: string;
  organization: string;
  place: string;
  author: string;
  academicYear: string;
  date: string;
}

interface Membership {
  name: string;
  academicYear: string;
  date: string;
}

interface FacultyData {
  name: string;
  websiteLink: string;
  joinedDate: string;
  officeLocation: string;
  department: string;
  position: string;
  mailId: string;
  phone: string;
  yearsOfExperience: string;
  areaOfInterest: string;
  address: string;
  aicteId: string;
  biography: string;
  education: Education[];
  employmenthistory: EmploymentHistory[];
  memberships: Membership[];
  awards: Award[];
  publications: Publication[];
  researchprojects: ResearchProject[];
  doctoralStudentsGuided: DoctoralStudent[];
  booksChaptersPublished: BookChapter[];
  currentResponsibilities: Array<{name: string; academicYear: string; date: string}>;
  otherResponsibilities: Array<{name: string; academicYear: string; date: string}>;
  trainingProgramsAttended: Array<{name: string; academicYear: string; date: string}>;
  invitedSpeaker: Array<{name: string; academicYear: string; date: string}>;
  resourcePerson: Array<{name: string; academicYear: string; date: string}>;
  patents: Patent[];
  conferences: Conference[];
  expertCommittees: Array<{name: string; academicYear: string; date: string}>;
  programsOrganized: Array<{name: string; academicYear: string; date: string}>;
  positionsHeld: Array<{name: string; academicYear: string; date: string}>;
  specializedTrainings: Array<{name: string; academicYear: string; date: string}>;
  profilePicture?: string;
}

// Helper function to generate year options
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year.toString());
  }
  return years;
};

// Helper function to generate academic year options
const generateAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let year = currentYear; year >= 1990; year--) {
    const nextYear = year + 1;
    academicYears.push(`${year}-${nextYear.toString().slice(-2)}`);
  }
  return academicYears;
};

const FacultyEditPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [facultyData, setFacultyData] = useState<FacultyData>({
    name: "",
    websiteLink: "",
    joinedDate: "",
    officeLocation: "",
    department: "",
    position: "",
    mailId: "",
    phone: "",
    yearsOfExperience: "",
    areaOfInterest: "",
    address: "",
    aicteId: "",
    biography: "",
    education: [{ degree: "", field: "", institution: "" }],
    employmenthistory: [{ organization: "", position: "", timeperiod: "", academicYear: "", date: "" }],
    memberships: [{ name: "", academicYear: "", date: "" }],
    awards: [{ organization: "", title: "", academicYear: "", date: "" }],
    publications: [{ type: "", title: "", subtitle: "", authors: "", academicYear: "", date: "" }],
    researchprojects: [{ title: "", status: "", fundingagency: "", role: "", academicYear: "", date: "" }],
    doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", academicYear: "", date: "" }],
    booksChaptersPublished: [{ title: "", author: "", academicYear: "", date: "", isbnId: "" }],
    currentResponsibilities: [{ name: "", academicYear: "", date: "" }],
    otherResponsibilities: [{ name: "", academicYear: "", date: "" }],
    trainingProgramsAttended: [{ name: "", academicYear: "", date: "" }],
    invitedSpeaker: [{ name: "", academicYear: "", date: "" }],
    resourcePerson: [{ name: "", academicYear: "", date: "" }],
    patents: [{ title: "", patentNo: "", inventors: "", status: "", academicYear: "", date: "" }],
    conferences: [{ title: "", organization: "", place: "", author: "", academicYear: "", date: "" }],
    expertCommittees: [{ name: "", academicYear: "", date: "" }],
    programsOrganized: [{ name: "", academicYear: "", date: "" }],
    positionsHeld: [{ name: "", academicYear: "", date: "" }],
    specializedTrainings: [{ name: "", academicYear: "", date: "" }]
  });
  const [saving, setSaving] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadFacultyData(user.email!);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFacultyData = async (email: string) => {
    try {
      const docRef = doc(db, "faculty", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const loadedData = docSnap.data() as Partial<FacultyData>;
        
        // Merge with default values to ensure all fields are defined
        const defaultData: FacultyData = {
          name: "",
          websiteLink: "",
          joinedDate: "",
          officeLocation: "",
          department: "",
          position: "",
          mailId: "",
          phone: "",
          yearsOfExperience: "",
          areaOfInterest: "",
          address: "",
          aicteId: "",
          biography: "",
          education: [{ degree: "", field: "", institution: "" }],
          employmenthistory: [{ organization: "", position: "", timeperiod: "", academicYear: "", date: "" }],
          memberships: [{ name: "", academicYear: "", date: "" }],
          awards: [{ organization: "", title: "", academicYear: "", date: "" }],
          publications: [{ type: "", title: "", subtitle: "", authors: "", academicYear: "", date: "" }],
          researchprojects: [{ title: "", status: "", fundingagency: "", role: "", academicYear: "", date: "" }],
          doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", academicYear: "", date: "" }],
          booksChaptersPublished: [{ title: "", author: "", academicYear: "", date: "", isbnId: "" }],
          currentResponsibilities: [{ name: "", academicYear: "", date: "" }],
          otherResponsibilities: [{ name: "", academicYear: "", date: "" }],
          trainingProgramsAttended: [{ name: "", academicYear: "", date: "" }],
          invitedSpeaker: [{ name: "", academicYear: "", date: "" }],
          resourcePerson: [{ name: "", academicYear: "", date: "" }],
          patents: [{ title: "", patentNo: "", inventors: "", status: "", academicYear: "", date: "" }],
          conferences: [{ title: "", organization: "", place: "", author: "", academicYear: "", date: "" }],
          expertCommittees: [{ name: "", academicYear: "", date: "" }],
          programsOrganized: [{ name: "", academicYear: "", date: "" }],
          positionsHeld: [{ name: "", academicYear: "", date: "" }],
          specializedTrainings: [{ name: "", academicYear: "", date: "" }],
          profilePicture: ""
        };
        
        // Merge loaded data with defaults, ensuring nested objects are properly merged
        const mergedData: FacultyData = {
          ...defaultData,
          ...loadedData,
          // Handle migration from contact.phone to phone field for backward compatibility
          phone: loadedData.phone || (loadedData as any).contact?.phone || "",
          education: loadedData.education && loadedData.education.length > 0 ? 
            loadedData.education.map(edu => ({
              degree: edu.degree || "",
              field: edu.field || "",
              institution: edu.institution || ""
            })) : defaultData.education,
          employmenthistory: loadedData.employmenthistory && loadedData.employmenthistory.length > 0 ? 
            loadedData.employmenthistory.map(emp => ({
              organization: emp.organization || "",
              position: emp.position || "",
              timeperiod: emp.timeperiod || "",
              academicYear: emp.academicYear || "",
              date: emp.date || ""
            })) : defaultData.employmenthistory,
          memberships: loadedData.memberships && loadedData.memberships.length > 0 ? 
            loadedData.memberships.map(mem => {
              // Handle both old string format and new object format
              if (typeof mem === 'string') {
                return { name: mem, academicYear: "", date: "" };
              }
              return {
                name: mem.name || "",
                academicYear: mem.academicYear || "",
                date: mem.date || ""
              };
            }) : defaultData.memberships,
          awards: loadedData.awards && loadedData.awards.length > 0 ? 
            loadedData.awards.map(award => ({
              organization: award.organization || "",
              title: award.title || "",
              academicYear: award.academicYear || "",
              date: award.date || ""
            })) : defaultData.awards,
          publications: loadedData.publications && loadedData.publications.length > 0 ? 
            loadedData.publications.map(pub => ({
              type: pub.type || "",
              title: pub.title || "",
              subtitle: pub.subtitle || "",
              authors: pub.authors || "",
              academicYear: pub.academicYear || "",
              date: pub.date || ""
            })) : defaultData.publications,
          researchprojects: loadedData.researchprojects && loadedData.researchprojects.length > 0 ? 
            loadedData.researchprojects.map(proj => ({
              title: proj.title || "",
              status: proj.status || "",
              fundingagency: proj.fundingagency || "",
              role: proj.role || "",
              academicYear: proj.academicYear || "",
              date: proj.date || ""
            })) : defaultData.researchprojects,
          doctoralStudentsGuided: loadedData.doctoralStudentsGuided && loadedData.doctoralStudentsGuided.length > 0 ? 
            loadedData.doctoralStudentsGuided.map(student => ({
              name: student.name || "",
              status: student.status || "",
              title: student.title || "",
              organization: student.organization || "",
              academicYear: student.academicYear || "",
              date: student.date || ""
            })) : defaultData.doctoralStudentsGuided,
          booksChaptersPublished: loadedData.booksChaptersPublished && loadedData.booksChaptersPublished.length > 0 ? 
            loadedData.booksChaptersPublished.map(book => ({
              title: book.title || "",
              author: book.author || "",
              academicYear: book.academicYear || "",
              date: book.date || "",
              isbnId: book.isbnId || ""
            })) : defaultData.booksChaptersPublished,
          currentResponsibilities: loadedData.currentResponsibilities && loadedData.currentResponsibilities.length > 0 ? 
            loadedData.currentResponsibilities.map(resp => {
              // Handle both old string format and new object format
              if (typeof resp === 'string') {
                return { name: resp, academicYear: "", date: "" };
              }
              return {
                name: resp.name || "",
                academicYear: resp.academicYear || "",
                date: resp.date || ""
              };
            }) : defaultData.currentResponsibilities,
          otherResponsibilities: loadedData.otherResponsibilities && loadedData.otherResponsibilities.length > 0 ? 
            loadedData.otherResponsibilities.map(resp => {
              // Handle both old string format and new object format
              if (typeof resp === 'string') {
                return { name: resp, academicYear: "", date: "" };
              }
              return {
                name: resp.name || "",
                academicYear: resp.academicYear || "",
                date: resp.date || ""
              };
            }) : defaultData.otherResponsibilities,
          trainingProgramsAttended: loadedData.trainingProgramsAttended && loadedData.trainingProgramsAttended.length > 0 ? 
            loadedData.trainingProgramsAttended.map(training => {
              if (typeof training === 'string') {
                return { name: training, academicYear: "", date: "" };
              }
              return {
                name: training.name || "",
                academicYear: training.academicYear || "",
                date: training.date || ""
              };
            }) : defaultData.trainingProgramsAttended,
          invitedSpeaker: loadedData.invitedSpeaker && loadedData.invitedSpeaker.length > 0 ? 
            loadedData.invitedSpeaker.map(speaker => {
              if (typeof speaker === 'string') {
                return { name: speaker, academicYear: "", date: "" };
              }
              return {
                name: speaker.name || "",
                academicYear: speaker.academicYear || "",
                date: speaker.date || ""
              };
            }) : defaultData.invitedSpeaker,
          resourcePerson: loadedData.resourcePerson && loadedData.resourcePerson.length > 0 ? 
            loadedData.resourcePerson.map(person => {
              if (typeof person === 'string') {
                return { name: person, academicYear: "", date: "" };
              }
              return {
                name: person.name || "",
                academicYear: person.academicYear || "",
                date: person.date || ""
              };
            }) : defaultData.resourcePerson,
          patents: loadedData.patents && loadedData.patents.length > 0 ? 
            loadedData.patents.map(patent => ({
              title: patent.title || "",
              patentNo: patent.patentNo || "",
              inventors: patent.inventors || "",
              status: patent.status || "",
              academicYear: patent.academicYear || "",
              date: patent.date || ""
            })) : defaultData.patents,
          conferences: loadedData.conferences && loadedData.conferences.length > 0 ? 
            loadedData.conferences.map(conference => ({
              title: conference.title || "",
              organization: conference.organization || "",
              place: conference.place || "",
              author: conference.author || "",
              academicYear: conference.academicYear || "",
              date: conference.date || ""
            })) : defaultData.conferences,
          expertCommittees: loadedData.expertCommittees && loadedData.expertCommittees.length > 0 ? 
            loadedData.expertCommittees.map(committee => {
              if (typeof committee === 'string') {
                return { name: committee, academicYear: "", date: "" };
              }
              return {
                name: committee.name || "",
                academicYear: committee.academicYear || "",
                date: committee.date || ""
              };
            }) : defaultData.expertCommittees,
          programsOrganized: loadedData.programsOrganized && loadedData.programsOrganized.length > 0 ? 
            loadedData.programsOrganized.map(program => {
              if (typeof program === 'string') {
                return { name: program, academicYear: "", date: "" };
              }
              return {
                name: program.name || "",
                academicYear: program.academicYear || "",
                date: program.date || ""
              };
            }) : defaultData.programsOrganized,
          positionsHeld: loadedData.positionsHeld && loadedData.positionsHeld.length > 0 ? 
            loadedData.positionsHeld.map(position => {
              if (typeof position === 'string') {
                return { name: position, academicYear: "", date: "" };
              }
              return {
                name: position.name || "",
                academicYear: position.academicYear || "",
                date: position.date || ""
              };
            }) : defaultData.positionsHeld,
          specializedTrainings: loadedData.specializedTrainings && loadedData.specializedTrainings.length > 0 ? 
            loadedData.specializedTrainings.map(training => {
              if (typeof training === 'string') {
                return { name: training, academicYear: "", date: "" };
              }
              return {
                name: training.name || "",
                academicYear: training.academicYear || "",
                date: training.date || ""
              };
            }) : defaultData.specializedTrainings
        };
        
        setFacultyData(mergedData);
      }
    } catch (error) {
      console.error("Error loading faculty data:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all state
      setUser(null);
      setFacultyData({
        name: "",
        websiteLink: "",
        joinedDate: "",
        officeLocation: "",
        department: "",
        position: "",
        mailId: "",
        phone: "",
        yearsOfExperience: "",
        areaOfInterest: "",
        address: "",
        aicteId: "",
        biography: "",
        education: [{ degree: "", field: "", institution: "" }],
        employmenthistory: [{ organization: "", position: "", timeperiod: "", academicYear: "", date: "" }],
        memberships: [{ name: "", academicYear: "", date: "" }],
        awards: [{ organization: "", title: "", academicYear: "", date: "" }],
        publications: [{ type: "", title: "", subtitle: "", authors: "", academicYear: "", date: "" }],
        researchprojects: [{ title: "", status: "", fundingagency: "", role: "", academicYear: "", date: "" }],
        doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", academicYear: "", date: "" }],
        booksChaptersPublished: [{ title: "", author: "", academicYear: "", date: "", isbnId: "" }],
        currentResponsibilities: [{ name: "", academicYear: "", date: "" }],
        otherResponsibilities: [{ name: "", academicYear: "", date: "" }],
        trainingProgramsAttended: [{ name: "", academicYear: "", date: "" }],
        invitedSpeaker: [{ name: "", academicYear: "", date: "" }],
        resourcePerson: [{ name: "", academicYear: "", date: "" }],
        patents: [{ title: "", patentNo: "", inventors: "", status: "", academicYear: "", date: "" }],
        conferences: [{ title: "", organization: "", place: "", author: "", academicYear: "", date: "" }],
        expertCommittees: [{ name: "", academicYear: "", date: "" }],
        programsOrganized: [{ name: "", academicYear: "", date: "" }],
        positionsHeld: [{ name: "", academicYear: "", date: "" }],
        specializedTrainings: [{ name: "", academicYear: "", date: "" }]
      });
      setProfilePictureFile(null);
      setEmail("");
      setPassword("");
      setError("");
      
      // Clear all browser cache
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear browser cache if possible
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Force page reload to ensure all cache is cleared
      window.location.reload();
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const uploadProfilePicture = async (file: File, userEmail: string): Promise<string> => {
    const storageRef = ref(storage, `faculty/${userEmail}/profile-picture`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const validateImage = (file: File): Promise<{ isValid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Check file size (500KB = 500 * 1024 bytes)
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        resolve({ isValid: false, error: "File size must be under 500KB" });
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        resolve({ isValid: false, error: "Please select a valid image file" });
        return;
      }

      resolve({ isValid: true });
    });
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validation = await validateImage(file);
      if (!validation.isValid) {
        alert(validation.error);
        // Reset the input
        e.target.value = '';
        setProfilePictureFile(null);
        return;
      }
      
      setProfilePictureFile(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setUploadingImage(false);
    
    try {
      let updatedFacultyData = { ...facultyData };
      
      // Upload profile picture if a new one is selected
      if (profilePictureFile) {
        setUploadingImage(true);
        const profilePictureUrl = await uploadProfilePicture(profilePictureFile, user.email);
        updatedFacultyData.profilePicture = profilePictureUrl;
        setProfilePictureFile(null);
      }
      
      // Filter out empty values
      const cleanData = Object.fromEntries(
        Object.entries(updatedFacultyData).map(([key, value]) => {
          if (Array.isArray(value)) {
            // Filter out empty objects from arrays
            const filteredArray = value.filter(item => {
              if (typeof item === 'object' && item !== null) {
                return Object.values(item).some(val => val !== '' && val !== null && val !== undefined);
              }
              return item !== '' && item !== null && item !== undefined;
            });
            return [key, filteredArray.length > 0 ? filteredArray : undefined];
          } else if (typeof value === 'string') {
            // Only include non-empty strings
            return [key, value.trim() !== '' ? value : undefined];
          }
          return [key, value];
        }).filter(([key, value]) => {
          // Remove undefined values (empty fields)
          return value !== undefined;
        })
      );
      
      const docRef = doc(db, "faculty", user.email);
      await setDoc(docRef, cleanData);
      
      // Update local state with the cleaned data
      setFacultyData(updatedFacultyData); // Keep full data locally for form display
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const addArrayItem = (field: keyof FacultyData, defaultItem: any) => {
    setFacultyData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultItem]
    }));
  };

  const removeArrayItem = (field: keyof FacultyData, index: number) => {
    setFacultyData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof FacultyData, index: number, key: string, value: string) => {
    setFacultyData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
        <h2>Faculty Login</h2>
        <p style={{ marginBottom: 16, color: '#666' }}>Please login to edit your faculty profile</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4, background: '#fff', color: '#222', border: '1px solid #888', borderRadius: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4, background: '#fff', color: '#222', border: '1px solid #888', borderRadius: 4 }}
            />
          </div>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Edit Faculty Profile</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link 
            href="/faculty/profile" 
            style={{ 
              padding: '8px 16px', 
              background: '#6b7280', 
              color: '#fff', 
              textDecoration: 'none',
              borderRadius: 4 
            }}
          >
            View Profile
          </Link>
          <span style={{ marginRight: 16 }}>Welcome, {user.email}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Profile Picture */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Profile Picture</h3>
          {facultyData.profilePicture && (
            <div style={{ marginBottom: 16 }}>
              <img 
                src={facultyData.profilePicture} 
                alt="Current profile picture" 
                style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
              />
              <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Current profile picture</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
            />
            {profilePictureFile && (
              <p style={{ fontSize: 14, color: '#666' }}>
                Selected: {profilePictureFile.name}
              </p>
            )}
            <p style={{ fontSize: 12, color: '#999' }}>
              Requirements: Under 500KB. Supported formats: JPG, PNG, GIF
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Basic Information</h3>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Name</label>
              <input
                type="text"
                value={facultyData.name}
                onChange={e => setFacultyData(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="Full name"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Website Link</label>
              <input
                type="url"
                value={facultyData.websiteLink}
                onChange={e => setFacultyData(prev => ({ ...prev, websiteLink: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., https://yourwebsite.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Joined Date</label>
              <input
                type="date"
                value={facultyData.joinedDate}
                onChange={e => setFacultyData(prev => ({ ...prev, joinedDate: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Office Location</label>
              <input
                type="text"
                value={facultyData.officeLocation}
                onChange={e => setFacultyData(prev => ({ ...prev, officeLocation: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., Room 101, Engineering Block"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Department</label>
              <select
                value={facultyData.department}
                onChange={e => setFacultyData(prev => ({ ...prev, department: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Department</option>
                <option value="Computer Science Engineering">Computer Science Engineering</option>
                <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Biomedical Engineering">Biomedical Engineering</option>
                <option value="Biotechnology Engineering">Biotechnology Engineering</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Position</label>
              <select
                value={facultyData.position}
                onChange={e => setFacultyData(prev => ({ ...prev, position: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Position</option>
                <option value="Head of Department">Head of Department</option>
                <option value="Assistant HOD">Assistant HOD</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>

                <option value="Principal">Principal</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Mail ID</label>
              <input
                type="email"
                value={facultyData.mailId}
                onChange={e => setFacultyData(prev => ({ ...prev, mailId: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., faculty@university.edu"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Phone</label>
              <input
                type="tel"
                value={facultyData.phone}
                onChange={e => setFacultyData(prev => ({ ...prev, phone: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., +91 9876543210"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Years of Experience</label>
              <input
                type="text"
                value={facultyData.yearsOfExperience}
                onChange={e => setFacultyData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., 5 years, 10 years"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Area of Interest</label>
              <input
                type="text"
                value={facultyData.areaOfInterest}
                onChange={e => setFacultyData(prev => ({ ...prev, areaOfInterest: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="e.g., Machine Learning, Data Science, Web Development"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Address</label>
              <textarea
                value={facultyData.address}
                onChange={e => setFacultyData(prev => ({ ...prev, address: e.target.value }))}
                style={{ width: '100%', height: 80, padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="Enter your complete address"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>AICTE ID</label>
              <input
                type="text"
                value={facultyData.aicteId}
                onChange={e => setFacultyData(prev => ({ ...prev, aicteId: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
                placeholder="Enter your AICTE ID"
              />
            </div>
          </div>
        </div>

        {/* Biography */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Biography</h3>
          <textarea
            value={facultyData.biography}
            onChange={e => setFacultyData(prev => ({ ...prev, biography: e.target.value }))}
            style={{ width: '100%', height: 100, padding: 8, border: '1px solid #888', borderRadius: 4 }}
            placeholder="Enter your biography..."
          />
        </div>

        {/* Education */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Education</h3>
            <button
              onClick={() => addArrayItem('education', { degree: '', field: '', institution: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Education
            </button>
          </div>
          {facultyData.education.map((edu, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={e => updateArrayItem('education', index, 'degree', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Field"
                value={edu.field}
                onChange={e => updateArrayItem('education', index, 'field', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={e => updateArrayItem('education', index, 'institution', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('education', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Employment History */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Employment History</h3>
            <button
              onClick={() => addArrayItem('employmenthistory', { organization: '', position: '', timeperiod: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Employment
            </button>
          </div>
          {facultyData.employmenthistory.map((emp, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Organization"
                value={emp.organization}
                onChange={e => updateArrayItem('employmenthistory', index, 'organization', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Position"
                value={emp.position}
                onChange={e => updateArrayItem('employmenthistory', index, 'position', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Time Period"
                value={emp.timeperiod}
                onChange={e => updateArrayItem('employmenthistory', index, 'timeperiod', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={emp.academicYear}
                onChange={e => updateArrayItem('employmenthistory', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={emp.date}
                onChange={e => updateArrayItem('employmenthistory', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('employmenthistory', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Memberships */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Memberships</h3>
            <button
              onClick={() => addArrayItem('memberships', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Membership
            </button>
          </div>
          {facultyData.memberships.map((membership, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Membership Name"
                value={membership.name}
                onChange={e => updateArrayItem('memberships', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={membership.academicYear}
                onChange={e => updateArrayItem('memberships', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={membership.date}
                onChange={e => updateArrayItem('memberships', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('memberships', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Awards */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Awards</h3>
            <button
              onClick={() => addArrayItem('awards', { organization: '', title: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Award
            </button>
          </div>
          {facultyData.awards.map((award, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Organization"
                value={award.organization}
                onChange={e => updateArrayItem('awards', index, 'organization', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Title"
                value={award.title}
                onChange={e => updateArrayItem('awards', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={award.academicYear}
                onChange={e => updateArrayItem('awards', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={award.date}
                onChange={e => updateArrayItem('awards', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('awards', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Publications */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Publications</h3>
            <button
              onClick={() => addArrayItem('publications', { type: '', title: '', subtitle: '', authors: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Publication
            </button>
          </div>
          {facultyData.publications.map((pub, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Type"
                value={pub.type}
                onChange={e => updateArrayItem('publications', index, 'type', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Title"
                value={pub.title}
                onChange={e => updateArrayItem('publications', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={pub.subtitle}
                onChange={e => updateArrayItem('publications', index, 'subtitle', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Authors"
                value={pub.authors}
                onChange={e => updateArrayItem('publications', index, 'authors', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={pub.academicYear}
                onChange={e => updateArrayItem('publications', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={pub.date}
                onChange={e => updateArrayItem('publications', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('publications', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Research Projects */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Research Projects</h3>
            <button
              onClick={() => addArrayItem('researchprojects', { title: '', status: '', fundingagency: '', role: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Project
            </button>
          </div>
          {facultyData.researchprojects.map((project, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Title"
                value={project.title}
                onChange={e => updateArrayItem('researchprojects', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Status"
                value={project.status}
                onChange={e => updateArrayItem('researchprojects', index, 'status', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Funding Agency"
                value={project.fundingagency}
                onChange={e => updateArrayItem('researchprojects', index, 'fundingagency', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Role"
                value={project.role}
                onChange={e => updateArrayItem('researchprojects', index, 'role', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={project.academicYear}
                onChange={e => updateArrayItem('researchprojects', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={project.date}
                onChange={e => updateArrayItem('researchprojects', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('researchprojects', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Doctoral Students Guided */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Doctoral Students Guided</h3>
            <button
              onClick={() => addArrayItem('doctoralStudentsGuided', { name: '', status: '', title: '', organization: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Student
            </button>
          </div>
          {facultyData.doctoralStudentsGuided.map((student, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Name"
                value={student.name}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Status"
                value={student.status}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'status', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Title"
                value={student.title}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Organization"
                value={student.organization}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'organization', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={student.academicYear}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={student.date}
                onChange={e => updateArrayItem('doctoralStudentsGuided', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('doctoralStudentsGuided', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Books / Chapters Published */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Books / Chapters Published</h3>
            <button
              onClick={() => addArrayItem('booksChaptersPublished', { title: '', author: '', academicYear: '', date: '', isbnId: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Book/Chapter
            </button>
          </div>
          {facultyData.booksChaptersPublished.map((book, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Title"
                value={book.title}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Author"
                value={book.author}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'author', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="ISBN ID"
                value={book.isbnId}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'isbnId', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={book.academicYear}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={book.date}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('booksChaptersPublished', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Current Responsibilities */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Current Responsibilities</h3>
            <button
              onClick={() => addArrayItem('currentResponsibilities', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Responsibility
            </button>
          </div>
          {facultyData.currentResponsibilities.map((responsibility, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Responsibility Name"
                value={responsibility.name}
                onChange={e => updateArrayItem('currentResponsibilities', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={responsibility.academicYear}
                onChange={e => updateArrayItem('currentResponsibilities', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={responsibility.date}
                onChange={e => updateArrayItem('currentResponsibilities', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('currentResponsibilities', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Other Responsibilities */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Other Responsibilities</h3>
            <button
              onClick={() => addArrayItem('otherResponsibilities', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Responsibility
            </button>
          </div>
          {facultyData.otherResponsibilities.map((responsibility, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Responsibility Name"
                value={responsibility.name}
                onChange={e => updateArrayItem('otherResponsibilities', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={responsibility.academicYear}
                onChange={e => updateArrayItem('otherResponsibilities', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={responsibility.date}
                onChange={e => updateArrayItem('otherResponsibilities', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('otherResponsibilities', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Training Programs Attended */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Training Programs Attended</h3>
            <button
              onClick={() => addArrayItem('trainingProgramsAttended', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Training
            </button>
          </div>
          {facultyData.trainingProgramsAttended.map((training, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Training Program Name"
                value={training.name}
                onChange={e => updateArrayItem('trainingProgramsAttended', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={training.academicYear}
                onChange={e => updateArrayItem('trainingProgramsAttended', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={training.date}
                onChange={e => updateArrayItem('trainingProgramsAttended', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('trainingProgramsAttended', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Invited Speaker */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Invited Speaker</h3>
            <button
              onClick={() => addArrayItem('invitedSpeaker', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Event
            </button>
          </div>
          {facultyData.invitedSpeaker.map((event, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Event/Conference Name"
                value={event.name}
                onChange={e => updateArrayItem('invitedSpeaker', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={event.academicYear}
                onChange={e => updateArrayItem('invitedSpeaker', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={event.date}
                onChange={e => updateArrayItem('invitedSpeaker', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('invitedSpeaker', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Resource Person */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Resource Person</h3>
            <button
              onClick={() => addArrayItem('resourcePerson', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Event
            </button>
          </div>
          {facultyData.resourcePerson.map((event, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Event/Program Name"
                value={event.name}
                onChange={e => updateArrayItem('resourcePerson', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={event.academicYear}
                onChange={e => updateArrayItem('resourcePerson', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={event.date}
                onChange={e => updateArrayItem('resourcePerson', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('resourcePerson', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Patents */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Patents</h3>
            <button
              onClick={() => addArrayItem('patents', { title: '', patentNo: '', inventors: '', status: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Patent
            </button>
          </div>
          {facultyData.patents.map((patent, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Title"
                value={patent.title}
                onChange={e => updateArrayItem('patents', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Patent No"
                value={patent.patentNo}
                onChange={e => updateArrayItem('patents', index, 'patentNo', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Inventors"
                value={patent.inventors}
                onChange={e => updateArrayItem('patents', index, 'inventors', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Status"
                value={patent.status}
                onChange={e => updateArrayItem('patents', index, 'status', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={patent.academicYear}
                onChange={e => updateArrayItem('patents', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={patent.date}
                onChange={e => updateArrayItem('patents', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('patents', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Conferences */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Conferences</h3>
            <button
              onClick={() => addArrayItem('conferences', { title: '', organization: '', place: '', author: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Conference
            </button>
          </div>
          {facultyData.conferences.map((conference, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Title"
                value={conference.title}
                onChange={e => updateArrayItem('conferences', index, 'title', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Organization"
                value={conference.organization}
                onChange={e => updateArrayItem('conferences', index, 'organization', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Place"
                value={conference.place}
                onChange={e => updateArrayItem('conferences', index, 'place', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <input
                type="text"
                placeholder="Author"
                value={conference.author}
                onChange={e => updateArrayItem('conferences', index, 'author', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={conference.academicYear}
                onChange={e => updateArrayItem('conferences', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={conference.date}
                onChange={e => updateArrayItem('conferences', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('conferences', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Expert Committees */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Expert Committees</h3>
            <button
              onClick={() => addArrayItem('expertCommittees', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Committee
            </button>
          </div>
          {facultyData.expertCommittees.map((committee, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Committee Name"
                value={committee.name}
                onChange={e => updateArrayItem('expertCommittees', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={committee.academicYear}
                onChange={e => updateArrayItem('expertCommittees', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={committee.date}
                onChange={e => updateArrayItem('expertCommittees', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('expertCommittees', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Programs Organized */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Programs Organized</h3>
            <button
              onClick={() => addArrayItem('programsOrganized', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Program
            </button>
          </div>
          {facultyData.programsOrganized.map((program, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Program Name"
                value={program.name}
                onChange={e => updateArrayItem('programsOrganized', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={program.academicYear}
                onChange={e => updateArrayItem('programsOrganized', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={program.date}
                onChange={e => updateArrayItem('programsOrganized', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('programsOrganized', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Positions Held */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Positions Held</h3>
            <button
              onClick={() => addArrayItem('positionsHeld', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Position
            </button>
          </div>
          {facultyData.positionsHeld.map((position, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Position Name"
                value={position.name}
                onChange={e => updateArrayItem('positionsHeld', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={position.academicYear}
                onChange={e => updateArrayItem('positionsHeld', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={position.date}
                onChange={e => updateArrayItem('positionsHeld', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('positionsHeld', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Specialized Trainings */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Specialized Trainings</h3>
            <button
              onClick={() => addArrayItem('specializedTrainings', { name: '', academicYear: '', date: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Training
            </button>
          </div>
          {facultyData.specializedTrainings.map((training, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Training Name"
                value={training.name}
                onChange={e => updateArrayItem('specializedTrainings', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={training.academicYear}
                onChange={e => updateArrayItem('specializedTrainings', index, 'academicYear', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              >
                <option value="">Select Academic Year</option>
                {generateAcademicYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Date"
                value={training.date}
                onChange={e => updateArrayItem('specializedTrainings', index, 'date', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('specializedTrainings', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving || uploadingImage}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 16,
              cursor: (saving || uploadingImage) ? 'not-allowed' : 'pointer'
            }}
          >
            {uploadingImage ? 'Uploading Image...' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyEditPage;