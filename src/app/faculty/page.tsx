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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Redirect to profile page if already logged in
        router.push("/faculty/profile");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect will happen automatically via useEffect
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
    <div style={{ maxWidth: 400, margin: "4rem auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
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
  );
};

export default FacultyLoginPage;
