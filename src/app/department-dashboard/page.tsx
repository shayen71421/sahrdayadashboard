"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";

const allowedUsers: Record<string, string> = {
  "cse@sahrdaya.ac.in": "cse",
  "ece@sahrdaya.ac.in": "ece",
  "bte@sahrdaya.ac.in": "bte",
  "bme@sahrdaya.ac.in": "bme",
  "ce@sahrdaya.ac.in": "ce",
  "eee@sahrdaya.ac.in": "eee",
};

export default function DepartmentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!(email in allowedUsers)) {
      setError("Access denied. Only authorized users can login.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const username = allowedUsers[email];
      router.push(`/department-dashboard/${username}/about-department`);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Department Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
