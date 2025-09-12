"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black font-sans">
      <main className="flex flex-col gap-[48px] items-center text-center w-full max-w-2xl p-8 sm:p-20">
        <div className="flex flex-col items-center gap-4">
          <Image
            className="dark:invert"
            src="/logo.png"
            alt="College Logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Sahrdaya Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome to the College Management System
          </p>
        </div>
        <div className="flex flex-col gap-6 items-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Please select your login type:
          </h2>
          <div className="flex gap-6 items-center flex-col sm:flex-row">
            <Link
              href="/faculty"
              className="rounded-lg border border-solid border-blue-500 bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white font-medium text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
            >
              Faculty Login
            </Link>
            <button
              className="rounded-lg border border-solid border-green-500 bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center text-white font-medium text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
              onClick={() => window.location.href = '/admin'}
            >
              Admin Login
            </button>
            <button
              className="rounded-lg border border-solid border-purple-500 bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center text-white font-medium text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
              onClick={() => window.location.href = '/department-dashboard'}
            >
              Department Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
