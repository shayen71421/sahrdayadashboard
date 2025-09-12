"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/utils/firebase";
import { useRouter } from "next/navigation";

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get the current user's ID token for authentication
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const idToken = await currentUser.getIdToken();

      // Call the Firebase Cloud Function to create faculty user
      const response = await fetch('https://us-central1-college-website-27cf1.cloudfunctions.net/createFacultyUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create faculty user');
      }

      alert(`Faculty user created successfully: ${email}`);
      setEmail("");
      setPassword("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create faculty user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Faculty</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="faculty-email" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Email
            </label>
            <input
              id="faculty-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                border: '1px solid #888',
                borderRadius: 4,
                fontSize: 14
              }}
              placeholder="faculty@sahrdaya.ac.in"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="faculty-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Password
            </label>
            <input
              id="faculty-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: 8,
                border: '1px solid #888',
                borderRadius: 4,
                fontSize: 14
              }}
              placeholder="Minimum 6 characters"
            />
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Creating..." : "Create Faculty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminManagePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the user's ID token to check custom claims
          const idTokenResult = await user.getIdTokenResult();
          const isAdmin = idTokenResult.claims.admin;
          
          if (isAdmin === true) {
            setUser(user);
          } else {
            // User is not admin, redirect to admin login
            router.push("/admin");
          }
        } catch (error) {
          console.error("Error checking user claims:", error);
          router.push("/admin");
        }
      } else {
        // No user logged in, redirect to admin login
        router.push("/admin");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingBottom: 16,
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Admin Management Panel</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Manage faculty users and system settings
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 14 }}>
            Welcome, {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {/* Faculty Management Card */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 24,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Faculty Management</h3>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>
            Add new faculty members to the system
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Add New Faculty
          </button>
        </div>

        {/* System Stats Card */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 24,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>System Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Active Users:</span>
              <span style={{ fontWeight: 600 }}>--</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Faculty Members:</span>
              <span style={{ fontWeight: 600 }}>--</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Departments:</span>
              <span style={{ fontWeight: 600 }}>6</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 24,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => alert('Feature coming soon!')}
            >
              View All Faculty
            </button>
            <button
              style={{
                padding: '8px 16px',
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => alert('Feature coming soon!')}
            >
              System Settings
            </button>
            <button
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => alert('Feature coming soon!')}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Add Faculty Modal */}
      <AddFacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh data or update UI as needed
          console.log("Faculty created successfully");
        }}
      />
    </div>
  );
};

export default AdminManagePage;
