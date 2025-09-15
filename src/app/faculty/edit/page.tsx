"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/utils/firebase";
import Link from "next/link";

interface Contact {
  email: string;
  office: string;
  phone: string;
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  year?: string;
}

interface EmploymentHistory {
  organization: string;
  position: string;
  year?: string;
}

interface Membership {
  name: string;
  year?: string;
}

interface Award {
  organization: string;
  title: string;
  year: string;
}

interface Publication {
  type: string;
  year: string;
  title: string;
  subtitle: string;
  authors: string;
}

interface ResearchProject {
  title: string;
  status: string;
  fundingagency: string;
  year?: string;
  role: string;
}

interface DoctoralStudent {
  name: string;
  status: string;
  title: string;
  organization: string;
  year?: string;
}

interface BookChapter {
  title: string;
  author: string;
  year: string;
  isbnId: string;
}

interface Patent {
  title: string;
  patentNo: string;
  year: string;
  inventors: string;
  status: string;
}

interface Conference {
  title: string;
  organization: string;
  year: string;
  place: string;
  author: string;
}

interface FacultyData {
  name: string;
  websiteLink: string;
  joinedDate: string;
  officeLocation: string;
  department: string;
  position: string;
  mailId: string;
  yearsOfExperience: string;
  areaOfInterest: string;
  address: string;
  aicteId: string;
  biography: string;
  contact: Contact;
  education: Education[];
  employmenthistory: EmploymentHistory[];
  memberships: Membership[];
  awards: Award[];
  publications: Publication[];
  researchprojects: ResearchProject[];
  doctoralStudentsGuided: DoctoralStudent[];
  booksChaptersPublished: BookChapter[];
  currentResponsibilities: string[];
  otherResponsibilities: string[];
  trainingProgramsAttended: string[];
  invitedSpeaker: string[];
  resourcePerson: string[];
  patents: Patent[];
  conferences: Conference[];
  expertCommittees: string[];
  programsOrganized: string[];
  positionsHeld: string[];
  specializedTrainings: string[];
  profilePicture?: string;
}

// Helper function to generate year options
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 10; year >= 1970; year--) {
    years.push(year.toString());
  }
  return years;
};

const generateEndYearOptions = () => {
  const years = generateYearOptions();
  return ['Present', ...years];
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
    yearsOfExperience: "",
    areaOfInterest: "",
    address: "",
    aicteId: "",
    biography: "",
    contact: { email: "", office: "", phone: "" },
    education: [{ degree: "", field: "", institution: "", year: "" }],
    employmenthistory: [{ organization: "", position: "", year: "" }],
    memberships: [{ name: "", year: "" }],
    awards: [{ organization: "", title: "", year: "" }],
    publications: [{ type: "", year: "", title: "", subtitle: "", authors: "" }],
    researchprojects: [{ title: "", status: "", fundingagency: "", year: "", role: "" }],
    doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", year: "" }],
    booksChaptersPublished: [{ title: "", author: "", year: "", isbnId: "" }],
    currentResponsibilities: [""],
    otherResponsibilities: [""],
    trainingProgramsAttended: [""],
    invitedSpeaker: [""],
    resourcePerson: [""],
    patents: [{ title: "", patentNo: "", year: "", inventors: "", status: "" }],
    conferences: [{ title: "", organization: "", year: "", place: "", author: "" }],
    expertCommittees: [""],
    programsOrganized: [""],
    positionsHeld: [""],
    specializedTrainings: [""]
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
          yearsOfExperience: "",
          areaOfInterest: "",
          address: "",
          aicteId: "",
          biography: "",
          contact: { email: "", office: "", phone: "" },
          education: [{ degree: "", field: "", institution: "", year: "" }],
          employmenthistory: [{ organization: "", position: "", year: "" }],
          memberships: [{ name: "", year: "" }],
          awards: [{ organization: "", title: "", year: "" }],
          publications: [{ type: "", year: "", title: "", subtitle: "", authors: "" }],
          researchprojects: [{ title: "", status: "", fundingagency: "", year: "", role: "" }],
          doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", year: "" }],
          booksChaptersPublished: [{ title: "", author: "", year: "", isbnId: "" }],
          currentResponsibilities: [""],
          otherResponsibilities: [""],
          trainingProgramsAttended: [""],
          invitedSpeaker: [""],
          resourcePerson: [""],
          patents: [{ title: "", patentNo: "", year: "", inventors: "", status: "" }],
          conferences: [{ title: "", organization: "", year: "", place: "", author: "" }],
          expertCommittees: [""],
          programsOrganized: [""],
          positionsHeld: [""],
          specializedTrainings: [""],
          profilePicture: ""
        };
        
        // Merge loaded data with defaults, ensuring nested objects are properly merged
        const mergedData: FacultyData = {
          ...defaultData,
          ...loadedData,
          contact: {
            ...defaultData.contact,
            ...(loadedData.contact || {})
          },
          education: loadedData.education && loadedData.education.length > 0 ? loadedData.education : defaultData.education,
          employmenthistory: loadedData.employmenthistory && loadedData.employmenthistory.length > 0 ? loadedData.employmenthistory : defaultData.employmenthistory,
          memberships: loadedData.memberships && loadedData.memberships.length > 0 ? loadedData.memberships : defaultData.memberships,
          awards: loadedData.awards && loadedData.awards.length > 0 ? loadedData.awards : defaultData.awards,
          publications: loadedData.publications && loadedData.publications.length > 0 ? loadedData.publications : defaultData.publications,
          researchprojects: loadedData.researchprojects && loadedData.researchprojects.length > 0 ? loadedData.researchprojects : defaultData.researchprojects,
          doctoralStudentsGuided: loadedData.doctoralStudentsGuided && loadedData.doctoralStudentsGuided.length > 0 ? loadedData.doctoralStudentsGuided : defaultData.doctoralStudentsGuided,
          booksChaptersPublished: loadedData.booksChaptersPublished && loadedData.booksChaptersPublished.length > 0 ? loadedData.booksChaptersPublished : defaultData.booksChaptersPublished,
          otherResponsibilities: loadedData.otherResponsibilities && loadedData.otherResponsibilities.length > 0 ? loadedData.otherResponsibilities : defaultData.otherResponsibilities,
          trainingProgramsAttended: loadedData.trainingProgramsAttended && loadedData.trainingProgramsAttended.length > 0 ? loadedData.trainingProgramsAttended : defaultData.trainingProgramsAttended,
          invitedSpeaker: loadedData.invitedSpeaker && loadedData.invitedSpeaker.length > 0 ? loadedData.invitedSpeaker : defaultData.invitedSpeaker,
          resourcePerson: loadedData.resourcePerson && loadedData.resourcePerson.length > 0 ? loadedData.resourcePerson : defaultData.resourcePerson,
          patents: loadedData.patents && loadedData.patents.length > 0 ? loadedData.patents : defaultData.patents,
          conferences: loadedData.conferences && loadedData.conferences.length > 0 ? loadedData.conferences : defaultData.conferences,
          expertCommittees: loadedData.expertCommittees && loadedData.expertCommittees.length > 0 ? loadedData.expertCommittees : defaultData.expertCommittees,
          programsOrganized: loadedData.programsOrganized && loadedData.programsOrganized.length > 0 ? loadedData.programsOrganized : defaultData.programsOrganized,
          positionsHeld: loadedData.positionsHeld && loadedData.positionsHeld.length > 0 ? loadedData.positionsHeld : defaultData.positionsHeld,
          specializedTrainings: loadedData.specializedTrainings && loadedData.specializedTrainings.length > 0 ? loadedData.specializedTrainings : defaultData.specializedTrainings
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
        yearsOfExperience: "",
        areaOfInterest: "",
        address: "",
        aicteId: "",
        biography: "",
        contact: { email: "", office: "", phone: "" },
        education: [{ degree: "", field: "", institution: "", year: "" }],
        employmenthistory: [{ organization: "", position: "", year: "" }],
        memberships: [{ name: "", year: "" }],
        awards: [{ organization: "", title: "", year: "" }],
        publications: [{ type: "", year: "", title: "", subtitle: "", authors: "" }],
        researchprojects: [{ title: "", status: "", fundingagency: "", year: "", role: "" }],
        doctoralStudentsGuided: [{ name: "", status: "", title: "", organization: "", year: "" }],
        booksChaptersPublished: [{ title: "", author: "", year: "", isbnId: "" }],
        currentResponsibilities: [""],
        otherResponsibilities: [""],
        trainingProgramsAttended: [""],
        invitedSpeaker: [""],
        resourcePerson: [""],
        patents: [{ title: "", patentNo: "", year: "", inventors: "", status: "" }],
        conferences: [{ title: "", organization: "", year: "", place: "", author: "" }],
        expertCommittees: [""],
        programsOrganized: [""],
        positionsHeld: [""],
        specializedTrainings: [""]
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
            return [key, filteredArray];
          } else if (typeof value === 'string') {
            // Only include non-empty strings
            return value.trim() !== '' ? [key, value] : [key, ''];
          }
          return [key, value];
        }).filter(([key, value]) => {
          // Remove empty string values but keep other falsy values like 0 or false
          return !(typeof value === 'string' && value === '');
        })
      );
      
      const docRef = doc(db, "faculty", user.email);
      await setDoc(docRef, cleanData);
      setFacultyData(cleanData);
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

  // Helper functions to handle year field
  const updateYearField = (field: keyof FacultyData, index: number, startYear: string, endYear: string) => {
    let yearValue = "";
    if (startYear && endYear) {
      yearValue = `${startYear}-${endYear}`;
    } else if (startYear) {
      yearValue = startYear;
    }
    
    updateArrayItem(field, index, 'year', yearValue);
  };

  const parseYearField = (year: string | undefined) => {
    if (!year) return { startYear: '', endYear: '' };
    
    if (year.includes('-')) {
      const [start, end] = year.split('-');
      return { startYear: start || '', endYear: end || '' };
    }
    
    return { startYear: year, endYear: '' };
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

        {/* Contact Information */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Contact Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={facultyData.contact.email}
                onChange={e => setFacultyData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
            </div>
            <div>
              <label>Office</label>
              <input
                type="text"
                value={facultyData.contact.office}
                onChange={e => setFacultyData(prev => ({ ...prev, contact: { ...prev.contact, office: e.target.value } }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                type="text"
                value={facultyData.contact.phone}
                onChange={e => setFacultyData(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                style={{ width: '100%', padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Education</h3>
            <button
              onClick={() => addArrayItem('education', { degree: '', field: '', institution: '', year: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Education
            </button>
          </div>
          {facultyData.education.map((edu, index) => {
            const { startYear, endYear } = parseYearField(edu.year);
            return (
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
              <select
                value={startYear}
                onChange={e => updateYearField('education', index, e.target.value, endYear)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Start Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={e => updateYearField('education', index, startYear, e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">End Year</option>
                {generateEndYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => removeArrayItem('education', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
            );
          })}
        </div>

        {/* Employment History */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Employment History</h3>
            <button
              onClick={() => addArrayItem('employmenthistory', { organization: '', position: '', year: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Employment
            </button>
          </div>
          {facultyData.employmenthistory.map((emp, index) => {
            const { startYear, endYear } = parseYearField(emp.year);
            return (
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
              <select
                value={startYear}
                onChange={e => updateYearField('employmenthistory', index, e.target.value, endYear)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Start Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={e => updateYearField('employmenthistory', index, startYear, e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">End Year</option>
                {generateEndYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => removeArrayItem('employmenthistory', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
            );
          })}
        </div>

        {/* Memberships */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Memberships</h3>
            <button
              onClick={() => addArrayItem('memberships', { name: '', year: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Membership
            </button>
          </div>
          {facultyData.memberships.map((membership, index) => {
            const { startYear, endYear } = parseYearField(membership.year);
            return (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
              <input
                type="text"
                placeholder="Membership Name"
                value={membership.name}
                onChange={e => updateArrayItem('memberships', index, 'name', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <select
                value={startYear}
                onChange={e => updateYearField('memberships', index, e.target.value, endYear)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Start Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={e => updateYearField('memberships', index, startYear, e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">End Year</option>
                {generateEndYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => removeArrayItem('memberships', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
            );
          })}
        </div>

        {/* Awards */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Awards</h3>
            <button
              onClick={() => addArrayItem('awards', { organization: '', title: '', year: '' })}
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
                value={award.year}
                onChange={e => updateArrayItem('awards', index, 'year', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
              onClick={() => addArrayItem('publications', { type: '', year: '', title: '', subtitle: '', authors: '' })}
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
              <select
                value={pub.year}
                onChange={e => updateArrayItem('publications', index, 'year', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
              onClick={() => addArrayItem('researchprojects', { title: '', status: '', fundingagency: '', year: '', role: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Project
            </button>
          </div>
          {facultyData.researchprojects.map((project, index) => {
            const { startYear, endYear } = parseYearField(project.year);
            return (
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
              <select
                value={startYear}
                onChange={e => updateYearField('researchprojects', index, e.target.value, endYear)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Start Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={e => updateYearField('researchprojects', index, startYear, e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">End Year</option>
                {generateEndYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Role"
                value={project.role}
                onChange={e => updateArrayItem('researchprojects', index, 'role', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => removeArrayItem('researchprojects', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
            );
          })}
        </div>

        {/* Doctoral Students Guided */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Doctoral Students Guided</h3>
            <button
              onClick={() => addArrayItem('doctoralStudentsGuided', { name: '', status: '', title: '', organization: '', year: '' })}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Student
            </button>
          </div>
          {facultyData.doctoralStudentsGuided.map((student, index) => {
            const { startYear, endYear } = parseYearField(student.year);
            return (
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
                value={startYear}
                onChange={e => updateYearField('doctoralStudentsGuided', index, e.target.value, endYear)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Start Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={e => updateYearField('doctoralStudentsGuided', index, startYear, e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">End Year</option>
                {generateEndYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => removeArrayItem('doctoralStudentsGuided', index)}
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
            );
          })}
        </div>

        {/* Books / Chapters Published */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Books / Chapters Published</h3>
            <button
              onClick={() => addArrayItem('booksChaptersPublished', { title: '', author: '', year: '', isbnId: '' })}
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
              <select
                value={book.year}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'year', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="ISBN ID"
                value={book.isbnId}
                onChange={e => updateArrayItem('booksChaptersPublished', index, 'isbnId', e.target.value)}
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
              onClick={() => setFacultyData(prev => ({ ...prev, currentResponsibilities: [...prev.currentResponsibilities, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Responsibility
            </button>
          </div>
          {facultyData.currentResponsibilities.map((responsibility, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Current Responsibility"
                value={responsibility}
                onChange={e => {
                  const newResponsibilities = [...facultyData.currentResponsibilities];
                  newResponsibilities[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, currentResponsibilities: newResponsibilities }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, currentResponsibilities: prev.currentResponsibilities.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, otherResponsibilities: [...prev.otherResponsibilities, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Responsibility
            </button>
          </div>
          {facultyData.otherResponsibilities.map((responsibility, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Other Responsibility"
                value={responsibility}
                onChange={e => {
                  const newResponsibilities = [...facultyData.otherResponsibilities];
                  newResponsibilities[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, otherResponsibilities: newResponsibilities }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, otherResponsibilities: prev.otherResponsibilities.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, trainingProgramsAttended: [...prev.trainingProgramsAttended, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Training
            </button>
          </div>
          {facultyData.trainingProgramsAttended.map((training, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Training Program"
                value={training}
                onChange={e => {
                  const newTrainings = [...facultyData.trainingProgramsAttended];
                  newTrainings[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, trainingProgramsAttended: newTrainings }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, trainingProgramsAttended: prev.trainingProgramsAttended.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, invitedSpeaker: [...prev.invitedSpeaker, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Event
            </button>
          </div>
          {facultyData.invitedSpeaker.map((event, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Event/Conference where invited as speaker"
                value={event}
                onChange={e => {
                  const newEvents = [...facultyData.invitedSpeaker];
                  newEvents[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, invitedSpeaker: newEvents }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, invitedSpeaker: prev.invitedSpeaker.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, resourcePerson: [...prev.resourcePerson, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Event
            </button>
          </div>
          {facultyData.resourcePerson.map((event, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Event/Program where served as resource person"
                value={event}
                onChange={e => {
                  const newEvents = [...facultyData.resourcePerson];
                  newEvents[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, resourcePerson: newEvents }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, resourcePerson: prev.resourcePerson.filter((_, i) => i !== index) }))}
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
              onClick={() => addArrayItem('patents', { title: '', patentNo: '', year: '', inventors: '', status: '' })}
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
              <select
                value={patent.year}
                onChange={e => updateArrayItem('patents', index, 'year', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
              onClick={() => addArrayItem('conferences', { title: '', organization: '', year: '', place: '', author: '' })}
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
              <select
                value={conference.year}
                onChange={e => updateArrayItem('conferences', index, 'year', e.target.value)}
                style={{ padding: 8, border: '1px solid #888', borderRadius: 4, background: '#fff' }}
              >
                <option value="">Select Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
              onClick={() => setFacultyData(prev => ({ ...prev, expertCommittees: [...prev.expertCommittees, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Committee
            </button>
          </div>
          {facultyData.expertCommittees.map((committee, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Expert Committee"
                value={committee}
                onChange={e => {
                  const newCommittees = [...facultyData.expertCommittees];
                  newCommittees[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, expertCommittees: newCommittees }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, expertCommittees: prev.expertCommittees.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, programsOrganized: [...prev.programsOrganized, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Program
            </button>
          </div>
          {facultyData.programsOrganized.map((program, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Program Organized"
                value={program}
                onChange={e => {
                  const newPrograms = [...facultyData.programsOrganized];
                  newPrograms[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, programsOrganized: newPrograms }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, programsOrganized: prev.programsOrganized.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, positionsHeld: [...prev.positionsHeld, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Position
            </button>
          </div>
          {facultyData.positionsHeld.map((position, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Position Held"
                value={position}
                onChange={e => {
                  const newPositions = [...facultyData.positionsHeld];
                  newPositions[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, positionsHeld: newPositions }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, positionsHeld: prev.positionsHeld.filter((_, i) => i !== index) }))}
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
              onClick={() => setFacultyData(prev => ({ ...prev, specializedTrainings: [...prev.specializedTrainings, ''] }))}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              Add Training
            </button>
          </div>
          {facultyData.specializedTrainings.map((training, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Specialized Training"
                value={training}
                onChange={e => {
                  const newTrainings = [...facultyData.specializedTrainings];
                  newTrainings[index] = e.target.value;
                  setFacultyData(prev => ({ ...prev, specializedTrainings: newTrainings }));
                }}
                style={{ flex: 1, padding: 8, border: '1px solid #888', borderRadius: 4 }}
              />
              <button
                onClick={() => setFacultyData(prev => ({ ...prev, specializedTrainings: prev.specializedTrainings.filter((_, i) => i !== index) }))}
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
