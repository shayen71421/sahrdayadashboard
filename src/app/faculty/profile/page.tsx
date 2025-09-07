"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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
}

interface EmploymentHistory {
  organization: string;
  position: string;
  timeperiod: string;
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
  duration: string;
  role: string;
}

interface DoctoralStudent {
  name: string;
  status: string;
  title: string;
  organization: string;
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
  memberships: string[];
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
        setFacultyData(docSnap.data() as FacultyData);
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
          {(facultyData.name || facultyData.websiteLink || facultyData.joinedDate || facultyData.officeLocation || facultyData.department || facultyData.position || facultyData.mailId || facultyData.yearsOfExperience || facultyData.areaOfInterest || facultyData.address || facultyData.aicteId) && (
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

          {/* Contact Information */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <h3>Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {facultyData.contact.email && (
                <div>
                  <strong>Email:</strong> {facultyData.contact.email}
                </div>
              )}
              {facultyData.contact.office && (
                <div>
                  <strong>Office:</strong> {facultyData.contact.office}
                </div>
              )}
              {facultyData.contact.phone && (
                <div>
                  <strong>Phone:</strong> {facultyData.contact.phone}
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {facultyData.education?.length > 0 && facultyData.education.some(edu => edu.degree || edu.field || edu.institution) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Education</h3>
              {facultyData.education.map((edu, index) => (
                (edu.degree || edu.field || edu.institution) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {edu.degree && <div><strong>Degree:</strong> {edu.degree}</div>}
                    {edu.field && <div><strong>Field:</strong> {edu.field}</div>}
                    {edu.institution && <div><strong>Institution:</strong> {edu.institution}</div>}
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
                (emp.organization || emp.position || emp.timeperiod) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {emp.position && <div><strong>Position:</strong> {emp.position}</div>}
                    {emp.organization && <div><strong>Organization:</strong> {emp.organization}</div>}
                    {emp.timeperiod && <div><strong>Period:</strong> {emp.timeperiod}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Memberships */}
          {facultyData.memberships?.length > 0 && facultyData.memberships.some(membership => membership.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Memberships</h3>
              <ul>
                {facultyData.memberships.map((membership, index) => (
                  membership.trim() && (
                    <li key={index} style={{ marginBottom: 8 }}>{membership}</li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Awards */}
          {facultyData.awards?.length > 0 && facultyData.awards.some(award => award.title || award.organization) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Awards</h3>
              {facultyData.awards.map((award, index) => (
                (award.title || award.organization || award.year) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {award.title && <div><strong>Title:</strong> {award.title}</div>}
                    {award.organization && <div><strong>Organization:</strong> {award.organization}</div>}
                    {award.year && <div><strong>Year:</strong> {award.year}</div>}
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
                (pub.title || pub.type || pub.subtitle || pub.authors || pub.year) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {pub.title && <div><strong>Title:</strong> {pub.title}</div>}
                    {pub.subtitle && <div><strong>Publication:</strong> {pub.subtitle}</div>}
                    {pub.authors && <div><strong>Authors:</strong> {pub.authors}</div>}
                    {pub.type && <div><strong>Type:</strong> {pub.type}</div>}
                    {pub.year && <div><strong>Year:</strong> {pub.year}</div>}
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
                (project.title || project.status || project.fundingagency || project.duration || project.role) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {project.title && <div><strong>Title:</strong> {project.title}</div>}
                    {project.status && <div><strong>Status:</strong> {project.status}</div>}
                    {project.fundingagency && <div><strong>Funding Agency:</strong> {project.fundingagency}</div>}
                    {project.duration && <div><strong>Duration:</strong> {project.duration}</div>}
                    {project.role && <div><strong>Role:</strong> {project.role}</div>}
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
                (student.name || student.status || student.title || student.organization) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {student.name && <div><strong>Name:</strong> {student.name}</div>}
                    {student.status && <div><strong>Status:</strong> {student.status}</div>}
                    {student.title && <div><strong>Title:</strong> {student.title}</div>}
                    {student.organization && <div><strong>Organization:</strong> {student.organization}</div>}
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
                (book.title || book.author || book.year || book.isbnId) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {book.title && <div><strong>Title:</strong> {book.title}</div>}
                    {book.author && <div><strong>Author:</strong> {book.author}</div>}
                    {book.year && <div><strong>Year:</strong> {book.year}</div>}
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
                (patent.title || patent.patentNo || patent.year || patent.inventors || patent.status) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {patent.title && <div><strong>Title:</strong> {patent.title}</div>}
                    {patent.patentNo && <div><strong>Patent No:</strong> {patent.patentNo}</div>}
                    {patent.year && <div><strong>Year:</strong> {patent.year}</div>}
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
                (conf.title || conf.organization || conf.year || conf.place || conf.author) && (
                  <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 4 }}>
                    {conf.title && <div><strong>Title:</strong> {conf.title}</div>}
                    {conf.organization && <div><strong>Organization:</strong> {conf.organization}</div>}
                    {conf.year && <div><strong>Year:</strong> {conf.year}</div>}
                    {conf.place && <div><strong>Place:</strong> {conf.place}</div>}
                    {conf.author && <div><strong>Author:</strong> {conf.author}</div>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Current Responsibilities */}
          {facultyData.currentResponsibilities?.length > 0 && facultyData.currentResponsibilities.some(resp => resp.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Current Responsibilities</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.currentResponsibilities.map((resp, index) => (
                  resp.trim() && <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Responsibilities */}
          {facultyData.otherResponsibilities?.length > 0 && facultyData.otherResponsibilities.some(resp => resp.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Other Responsibilities</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.otherResponsibilities.map((resp, index) => (
                  resp.trim() && <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Training Programs Attended */}
          {facultyData.trainingProgramsAttended?.length > 0 && facultyData.trainingProgramsAttended.some(training => training.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Training Programs Attended</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.trainingProgramsAttended.map((training, index) => (
                  training.trim() && <li key={index}>{training}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Invited Speaker */}
          {facultyData.invitedSpeaker?.length > 0 && facultyData.invitedSpeaker.some(speaker => speaker.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Invited Speaker</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.invitedSpeaker.map((speaker, index) => (
                  speaker.trim() && <li key={index}>{speaker}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resource Person */}
          {facultyData.resourcePerson?.length > 0 && facultyData.resourcePerson.some(person => person.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Resource Person</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.resourcePerson.map((person, index) => (
                  person.trim() && <li key={index}>{person}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Expert Committees */}
          {facultyData.expertCommittees?.length > 0 && facultyData.expertCommittees.some(committee => committee.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Expert Committees</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.expertCommittees.map((committee, index) => (
                  committee.trim() && <li key={index}>{committee}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Programs Organized */}
          {facultyData.programsOrganized?.length > 0 && facultyData.programsOrganized.some(program => program.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Programs Organized</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.programsOrganized.map((program, index) => (
                  program.trim() && <li key={index}>{program}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Positions Held */}
          {facultyData.positionsHeld?.length > 0 && facultyData.positionsHeld.some(position => position.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Positions Held</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.positionsHeld.map((position, index) => (
                  position.trim() && <li key={index}>{position}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Specialized Trainings */}
          {facultyData.specializedTrainings?.length > 0 && facultyData.specializedTrainings.some(training => training.trim()) && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
              <h3>Specialized Trainings</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {facultyData.specializedTrainings.map((training, index) => (
                  training.trim() && <li key={index}>{training}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyProfilePage;
