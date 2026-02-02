"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-bold text-orange-600">
            Faloii
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-orange-600 text-sm font-medium"
            >
              커뮤니티
            </Link>
            {session ? (
              <>
                <Link
                  href="/records"
                  className="text-gray-600 hover:text-orange-600 text-sm font-medium"
                >
                  내 기록
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-orange-600 text-sm font-medium"
                >
                  프로필
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-orange-600 text-sm font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block text-gray-600 hover:text-orange-600 text-sm py-1"
            >
              커뮤니티
            </Link>
            {session ? (
              <>
                <Link
                  href="/records"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 hover:text-orange-600 text-sm py-1"
                >
                  내 기록
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 hover:text-orange-600 text-sm py-1"
                >
                  프로필
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="block text-gray-500 hover:text-gray-700 text-sm py-1"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 hover:text-orange-600 text-sm py-1"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 hover:text-orange-600 text-sm py-1"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
