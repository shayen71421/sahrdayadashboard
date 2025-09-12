"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { app } from "@/utils/firebase";
import { useRouter } from "next/navigation";

const FacultyLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the user's ID token to check custom claims
          const idTokenResult = await user.getIdTokenResult();
          const isFaculty = idTokenResult.claims.faculty;
          
          console.log("User claims:", idTokenResult.claims);
          console.log("Is faculty:", isFaculty);
          
          if (isFaculty === true) {
            setUser(user);
            // Redirect to profile page if already logged in and is faculty
            router.push("/faculty/profile");
          } else {
            // User is not faculty, sign them out
            await auth.signOut();
            setError("Access denied. Only faculty members can access this area.");
            setUser(null);
          }
        } catch (error) {
          console.error("Error checking user claims:", error);
          await auth.signOut();
          setError("Error verifying user permissions. Please try again.");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the user's ID token to check custom claims
      const idTokenResult = await user.getIdTokenResult();
      const isFaculty = idTokenResult.claims.faculty;
      
      console.log("Login - User claims:", idTokenResult.claims);
      console.log("Login - Is faculty:", isFaculty);
      
      if (isFaculty === true) {
        // User is faculty, redirect will happen automatically via useEffect
        console.log("Faculty user logged in successfully");
      } else {
        // User is not faculty, sign them out
        await auth.signOut();
        setError("Access denied. Only faculty members can access this area.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking auth state
  if (user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Redirecting to profile...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Logo outside the card */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            maxWidth: 150, 
            height: 'auto'
          }} 
        />
      </div>
      
      {/* Login Card */}
      <div style={{ 
        padding: 24, 
        border: "1px solid #eee", 
        borderRadius: 8,
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2>Faculty Login</h2>
        <p style={{ marginBottom: 16, color: '#666' }}>Please login to access your faculty dashboard</p>
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
      
      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: '#666' }}>
        After login, you can view and edit your faculty profile.
      </div>
      </div>
    </div>
  );
};

export default FacultyLoginPage;
