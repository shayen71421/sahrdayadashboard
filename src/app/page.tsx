"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[48px] row-start-2 items-center text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
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
              onClick={() => alert('Admin login coming soon!')}
            >
              Admin Login
            </button>
            
            <button
              className="rounded-lg border border-solid border-purple-500 bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center text-white font-medium text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
              onClick={() => alert('Department login coming soon!')}
            >
              Department Login
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
