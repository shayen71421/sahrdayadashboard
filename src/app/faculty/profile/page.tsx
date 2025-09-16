"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/utils/firebase";
import Link from "next/link";

interface Education {
  degree: string;
  field: string;
  institution: string;
  academicYear: string;
  date: string;
}

interface EmploymentHistory {
  organization: string;
  position: string;
  timeperiod: string;
  academicYear: string;
  date: string;
}

interface Membership {
  name: string;
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

interface ResponsibilityItem {
  name: string;
  academicYear: string;
  date: string;
}

interface TrainingItem {
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
  currentResponsibilities: ResponsibilityItem[];
  otherResponsibilities: ResponsibilityItem[];
  trainingProgramsAttended: TrainingItem[];
  invitedSpeaker: TrainingItem[];
  resourcePerson: TrainingItem[];
  patents: Patent[];
  conferences: Conference[];
  expertCommittees: TrainingItem[];
  programsOrganized: TrainingItem[];
  positionsHeld: TrainingItem[];
  specializedTrainings: TrainingItem[];
  profilePicture?: string;
}

const FacultyProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadFacultyData(user.email!);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFacultyData = async (email: string) => {
    try {
      const docRef = doc(db, "faculty", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const rawData = docSnap.data() as any;
        
        // Handle migration from old data format
        const migratedData: FacultyData = {
          ...rawData,
          // Handle phone migration from contact object
          phone: rawData.phone || rawData.contact?.phone || "",
          // Handle array migrations from string arrays to object arrays
          memberships: rawData.memberships?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          currentResponsibilities: rawData.currentResponsibilities?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          otherResponsibilities: rawData.otherResponsibilities?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          trainingProgramsAttended: rawData.trainingProgramsAttended?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          invitedSpeaker: rawData.invitedSpeaker?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          resourcePerson: rawData.resourcePerson?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          expertCommittees: rawData.expertCommittees?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          programsOrganized: rawData.programsOrganized?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          positionsHeld: rawData.positionsHeld?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || [],
          specializedTrainings: rawData.specializedTrainings?.map((item: any) => 
            typeof item === 'string' ? { name: item, academicYear: "", date: "" } : item
          ) || []
        };
        
        // Remove the old contact field if it exists
        delete (migratedData as any).contact;
        
        setFacultyData(migratedData);
      }
    } catch (error) {
      console.error("Error loading faculty data:", error);
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
      setFacultyData(null);
      setLoading(false);
      
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", padding: 24, textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please login to view faculty information.</p>
        <Link href="/faculty" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Go to Faculty Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Faculty Profile</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link 
            href="/faculty/edit" 
            style={{ 
              padding: '8px 16px', 
              background: '#10b981', 
              color: '#fff', 
              textDecoration: 'none',
              borderRadius: 4 
            }}
          >
            Edit Profile
          </Link>
          <span style={{ marginRight: 16 }}>Welcome, {user.email}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4 }}>
            Logout
          </button>
        </div>
      </div>

      {!facultyData ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <h3>No Profile Data Found</h3>
          <p>You haven't created your faculty profile yet.</p>
          <Link 
            href="/faculty/edit" 
            style={{ 
              padding: '12px 24px', 
              background: '#2563eb', 
              color: '#fff', 
              textDecoration: 'none',
              borderRadius: 4,
              display: 'inline-block',
              marginTop: 16
            }}
          >
            Create Profile
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Profile Picture */}
          {facultyData.profilePicture && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <h3>Profile Picture</h3>
              <img 
                src={facultyData.profilePicture} 
                alt="Profile picture" 
                style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          )}

          {/* Basic Information */}
          {(facultyData.name || facultyData.websiteLink || facultyData.joinedDate || facultyData.officeLocation || facultyData.department || facultyData.position || facultyData.mailId || facultyData.phone || facultyData.yearsOfExperience || facultyData.areaOfInterest || facultyData.address || facultyData.aicteId) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {facultyData.name && (
                  <div>
                    <strong>Name:</strong> {facultyData.name}
                  </div>
                )}
                {facultyData.websiteLink && (
                  <div>
                    <strong>Website:</strong> <a href={facultyData.websiteLink} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{facultyData.websiteLink}</a>
                  </div>
                )}
                {facultyData.joinedDate && (
                  <div>
                    <strong>Joined Date:</strong> {new Date(facultyData.joinedDate).toLocaleDateString()}
                  </div>
                )}
                {facultyData.officeLocation && (
                  <div>
                    <strong>Office Location:</strong> {facultyData.officeLocation}
                  </div>
                )}
                {facultyData.department && (
                  <div>
                    <strong>Department:</strong> {facultyData.department}
                  </div>
                )}
                {facultyData.position && (
                  <div>
                    <strong>Position:</strong> {facultyData.position}
                  </div>
                )}
                {facultyData.mailId && (
                  <div>
                    <strong>Mail ID:</strong> {facultyData.mailId}
                  </div>
                )}
                {facultyData.phone && (
                  <div>
                    <strong>Phone:</strong> {facultyData.phone}
                  </div>
                )}
                {facultyData.yearsOfExperience && (
                  <div>
                    <strong>Years of Experience:</strong> {facultyData.yearsOfExperience}
                  </div>
                )}
                {facultyData.areaOfInterest && (
                  <div>
                    <strong>Area of Interest:</strong> {facultyData.areaOfInterest}
                  </div>
                )}
                {facultyData.address && (
                  <div>
                    <strong>Address:</strong> {facultyData.address}
                  </div>
                )}
                {facultyData.aicteId && (
                  <div>
                    <strong>AICTE ID:</strong> {facultyData.aicteId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Biography */}
          {facultyData.biography && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Biography</h3>
              <p style={{ lineHeight: 1.6 }}>{facultyData.biography}</p>
            </div>
          )}

          {/* Education */}
          {facultyData.education?.length > 0 && facultyData.education.some(edu => edu.degree || edu.field || edu.institution) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Education</h3>
              {facultyData.education.map((edu, index) => (
                (edu.degree || edu.field || edu.institution || edu.academicYear || edu.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {edu.degree && <div><strong>Degree:</strong> {edu.degree}</div>}
                    {edu.field && <div><strong>Field:</strong> {edu.field}</div>}
                    {edu.institution && <div><strong>Institution:</strong> {edu.institution}</div>}
                    {edu.academicYear && <div><strong>Academic Year:</strong> {edu.academicYear}</div>}
                    {edu.date && <div><strong>Date:</strong> {new Date(edu.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Employment History */}
          {facultyData.employmenthistory?.length > 0 && facultyData.employmenthistory.some(emp => emp.organization || emp.position) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Employment History</h3>
              {facultyData.employmenthistory.map((emp, index) => (
                (emp.organization || emp.position || emp.timeperiod || emp.academicYear || emp.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {emp.position && <div><strong>Position:</strong> {emp.position}</div>}
                    {emp.organization && <div><strong>Organization:</strong> {emp.organization}</div>}
                    {emp.timeperiod && <div><strong>Period:</strong> {emp.timeperiod}</div>}
                    {emp.academicYear && <div><strong>Academic Year:</strong> {emp.academicYear}</div>}
                    {emp.date && <div><strong>Date:</strong> {new Date(emp.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Memberships */}
          {facultyData.memberships?.length > 0 && facultyData.memberships.some(membership => membership.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Memberships</h3>
              {facultyData.memberships.map((membership, index) => (
                (membership.name || membership.academicYear || membership.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {membership.name && <div><strong>Name:</strong> {membership.name}</div>}
                    {membership.academicYear && <div><strong>Academic Year:</strong> {membership.academicYear}</div>}
                    {membership.date && <div><strong>Date:</strong> {new Date(membership.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Awards */}
          {facultyData.awards?.length > 0 && facultyData.awards.some(award => award.title || award.organization) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Awards</h3>
              {facultyData.awards.map((award, index) => (
                (award.title || award.organization || award.academicYear || award.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {award.title && <div><strong>Title:</strong> {award.title}</div>}
                    {award.organization && <div><strong>Organization:</strong> {award.organization}</div>}
                    {award.academicYear && <div><strong>Academic Year:</strong> {award.academicYear}</div>}
                    {award.date && <div><strong>Date:</strong> {new Date(award.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Publications */}
          {facultyData.publications?.length > 0 && facultyData.publications.some(pub => pub.title || pub.type) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Publications</h3>
              {facultyData.publications.map((pub, index) => (
                (pub.title || pub.type || pub.subtitle || pub.authors || pub.academicYear || pub.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {pub.title && <div><strong>Title:</strong> {pub.title}</div>}
                    {pub.subtitle && <div><strong>Publication:</strong> {pub.subtitle}</div>}
                    {pub.authors && <div><strong>Authors:</strong> {pub.authors}</div>}
                    {pub.type && <div><strong>Type:</strong> {pub.type}</div>}
                    {pub.academicYear && <div><strong>Academic Year:</strong> {pub.academicYear}</div>}
                    {pub.date && <div><strong>Date:</strong> {new Date(pub.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Research Projects */}
          {facultyData.researchprojects?.length > 0 && facultyData.researchprojects.some(project => project.title || project.status) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Research Projects</h3>
              {facultyData.researchprojects.map((project, index) => (
                (project.title || project.status || project.fundingagency || project.role || project.academicYear || project.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {project.title && <div><strong>Title:</strong> {project.title}</div>}
                    {project.status && <div><strong>Status:</strong> {project.status}</div>}
                    {project.fundingagency && <div><strong>Funding Agency:</strong> {project.fundingagency}</div>}
                    {project.role && <div><strong>Role:</strong> {project.role}</div>}
                    {project.academicYear && <div><strong>Academic Year:</strong> {project.academicYear}</div>}
                    {project.date && <div><strong>Date:</strong> {new Date(project.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Doctoral Students Guided */}
          {facultyData.doctoralStudentsGuided?.length > 0 && facultyData.doctoralStudentsGuided.some(student => student.name || student.title) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Doctoral Students Guided</h3>
              {facultyData.doctoralStudentsGuided.map((student, index) => (
                (student.name || student.status || student.title || student.organization || student.academicYear || student.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {student.name && <div><strong>Name:</strong> {student.name}</div>}
                    {student.status && <div><strong>Status:</strong> {student.status}</div>}
                    {student.title && <div><strong>Title:</strong> {student.title}</div>}
                    {student.organization && <div><strong>Organization:</strong> {student.organization}</div>}
                    {student.academicYear && <div><strong>Academic Year:</strong> {student.academicYear}</div>}
                    {student.date && <div><strong>Date:</strong> {new Date(student.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Books/Chapters Published */}
          {facultyData.booksChaptersPublished?.length > 0 && facultyData.booksChaptersPublished.some(book => book.title || book.author) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Books/Chapters Published</h3>
              {facultyData.booksChaptersPublished.map((book, index) => (
                (book.title || book.author || book.academicYear || book.date || book.isbnId) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {book.title && <div><strong>Title:</strong> {book.title}</div>}
                    {book.author && <div><strong>Author:</strong> {book.author}</div>}
                    {book.academicYear && <div><strong>Academic Year:</strong> {book.academicYear}</div>}
                    {book.date && <div><strong>Date:</strong> {new Date(book.date).toLocaleDateString()}</div>}
                    {book.isbnId && <div><strong>ISBN ID:</strong> {book.isbnId}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Patents */}
          {facultyData.patents?.length > 0 && facultyData.patents.some(patent => patent.title || patent.patentNo) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Patents</h3>
              {facultyData.patents.map((patent, index) => (
                (patent.title || patent.patentNo || patent.academicYear || patent.date || patent.inventors || patent.status) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {patent.title && <div><strong>Title:</strong> {patent.title}</div>}
                    {patent.patentNo && <div><strong>Patent No:</strong> {patent.patentNo}</div>}
                    {patent.academicYear && <div><strong>Academic Year:</strong> {patent.academicYear}</div>}
                    {patent.date && <div><strong>Date:</strong> {new Date(patent.date).toLocaleDateString()}</div>}
                    {patent.inventors && <div><strong>Inventors:</strong> {patent.inventors}</div>}
                    {patent.status && <div><strong>Status:</strong> {patent.status}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Conferences */}
          {facultyData.conferences?.length > 0 && facultyData.conferences.some(conf => conf.title || conf.organization) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Conferences</h3>
              {facultyData.conferences.map((conf, index) => (
                (conf.title || conf.organization || conf.academicYear || conf.date || conf.place || conf.author) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {conf.title && <div><strong>Title:</strong> {conf.title}</div>}
                    {conf.organization && <div><strong>Organization:</strong> {conf.organization}</div>}
                    {conf.academicYear && <div><strong>Academic Year:</strong> {conf.academicYear}</div>}
                    {conf.date && <div><strong>Date:</strong> {new Date(conf.date).toLocaleDateString()}</div>}
                    {conf.place && <div><strong>Place:</strong> {conf.place}</div>}
                    {conf.author && <div><strong>Author:</strong> {conf.author}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Current Responsibilities */}
          {facultyData.currentResponsibilities?.length > 0 && facultyData.currentResponsibilities.some(resp => resp.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Current Responsibilities</h3>
              {facultyData.currentResponsibilities.map((resp, index) => (
                (resp.name || resp.academicYear || resp.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {resp.name && <div><strong>Name:</strong> {resp.name}</div>}
                    {resp.academicYear && <div><strong>Academic Year:</strong> {resp.academicYear}</div>}
                    {resp.date && <div><strong>Date:</strong> {new Date(resp.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Other Responsibilities */}
          {facultyData.otherResponsibilities?.length > 0 && facultyData.otherResponsibilities.some(resp => resp.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Other Responsibilities</h3>
              {facultyData.otherResponsibilities.map((resp, index) => (
                (resp.name || resp.academicYear || resp.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {resp.name && <div><strong>Name:</strong> {resp.name}</div>}
                    {resp.academicYear && <div><strong>Academic Year:</strong> {resp.academicYear}</div>}
                    {resp.date && <div><strong>Date:</strong> {new Date(resp.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Training Programs Attended */}
          {facultyData.trainingProgramsAttended?.length > 0 && facultyData.trainingProgramsAttended.some(training => training.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Training Programs Attended</h3>
              {facultyData.trainingProgramsAttended.map((training, index) => (
                (training.name || training.academicYear || training.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {training.name && <div><strong>Name:</strong> {training.name}</div>}
                    {training.academicYear && <div><strong>Academic Year:</strong> {training.academicYear}</div>}
                    {training.date && <div><strong>Date:</strong> {new Date(training.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Invited Speaker */}
          {facultyData.invitedSpeaker?.length > 0 && facultyData.invitedSpeaker.some(speaker => speaker.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Invited Speaker</h3>
              {facultyData.invitedSpeaker.map((speaker, index) => (
                (speaker.name || speaker.academicYear || speaker.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {speaker.name && <div><strong>Name:</strong> {speaker.name}</div>}
                    {speaker.academicYear && <div><strong>Academic Year:</strong> {speaker.academicYear}</div>}
                    {speaker.date && <div><strong>Date:</strong> {new Date(speaker.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Resource Person */}
          {facultyData.resourcePerson?.length > 0 && facultyData.resourcePerson.some(person => person.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Resource Person</h3>
              {facultyData.resourcePerson.map((person, index) => (
                (person.name || person.academicYear || person.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {person.name && <div><strong>Name:</strong> {person.name}</div>}
                    {person.academicYear && <div><strong>Academic Year:</strong> {person.academicYear}</div>}
                    {person.date && <div><strong>Date:</strong> {new Date(person.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Expert Committees */}
          {facultyData.expertCommittees?.length > 0 && facultyData.expertCommittees.some(committee => committee.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Expert Committees</h3>
              {facultyData.expertCommittees.map((committee, index) => (
                (committee.name || committee.academicYear || committee.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {committee.name && <div><strong>Name:</strong> {committee.name}</div>}
                    {committee.academicYear && <div><strong>Academic Year:</strong> {committee.academicYear}</div>}
                    {committee.date && <div><strong>Date:</strong> {new Date(committee.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Programs Organized */}
          {facultyData.programsOrganized?.length > 0 && facultyData.programsOrganized.some(program => program.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Programs Organized</h3>
              {facultyData.programsOrganized.map((program, index) => (
                (program.name || program.academicYear || program.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {program.name && <div><strong>Name:</strong> {program.name}</div>}
                    {program.academicYear && <div><strong>Academic Year:</strong> {program.academicYear}</div>}
                    {program.date && <div><strong>Date:</strong> {new Date(program.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Positions Held */}
          {facultyData.positionsHeld?.length > 0 && facultyData.positionsHeld.some(position => position.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Positions Held</h3>
              {facultyData.positionsHeld.map((position, index) => (
                (position.name || position.academicYear || position.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {position.name && <div><strong>Name:</strong> {position.name}</div>}
                    {position.academicYear && <div><strong>Academic Year:</strong> {position.academicYear}</div>}
                    {position.date && <div><strong>Date:</strong> {new Date(position.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Specialized Trainings */}
          {facultyData.specializedTrainings?.length > 0 && facultyData.specializedTrainings.some(training => training.name) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Specialized Trainings</h3>
              {facultyData.specializedTrainings.map((training, index) => (
                (training.name || training.academicYear || training.date) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {training.name && <div><strong>Name:</strong> {training.name}</div>}
                    {training.academicYear && <div><strong>Academic Year:</strong> {training.academicYear}</div>}
                    {training.date && <div><strong>Date:</strong> {new Date(training.date).toLocaleDateString()}</div>}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyProfilePage;
