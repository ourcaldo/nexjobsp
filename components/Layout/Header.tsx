'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  // Escape key handler, scroll lock, and focus management
  useEffect(() => {
    if (showMobileMenu) {
      // Lock scroll
      document.body.style.overflow = 'hidden';

      // Focus close button
      closeButtonRef.current?.focus();

      // Escape key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeMobileMenu();
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showMobileMenu, closeMobileMenu]);

  const handleMobileNavClick = () => {
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => {
    if (!pathname) return false;
    
    if (path === '/') {
      return pathname === '/';
    }

    if (path === '/lowongan-kerja/') {
      return pathname === '/lowongan-kerja' || 
             pathname === '/lowongan-kerja/' ||
             pathname.startsWith('/lowongan-kerja/');
    }

    if (path === '/artikel/') {
      return pathname === '/artikel' || 
             pathname === '/artikel/' ||
             pathname.startsWith('/artikel/');
    }

    return pathname === path || pathname === path + '/';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center" aria-label="Nexjob - Beranda">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                Nexjob
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Navigasi utama">
              <Link 
                href="/" 
                className={`font-medium transition-all border-b-2 ${
                  isActive('/') 
                    ? 'text-primary-600 font-bold border-primary-600' 
                    : 'text-gray-700 border-transparent hover:text-primary-600 hover:border-primary-600'
                }`}
              >
                Beranda
              </Link>
              <Link 
                href="/lowongan-kerja/" 
                className={`font-medium transition-all border-b-2 ${
                  isActive('/lowongan-kerja/')
                    ? 'text-primary-600 font-bold border-primary-600' 
                    : 'text-gray-700 border-transparent hover:text-primary-600 hover:border-primary-600'
                }`}
              >
                Cari Lowongan
              </Link>
              <Link 
                href="/artikel/" 
                className={`font-medium transition-all border-b-2 ${
                  isActive('/artikel/')
                    ? 'text-primary-600 font-bold border-primary-600' 
                    : 'text-gray-700 border-transparent hover:text-primary-600 hover:border-primary-600'
                }`}
              >
                Tips Karir
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label={showMobileMenu ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={showMobileMenu}
                aria-controls="mobile-menu"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile Off-Canvas Menu */}
      <div 
        id="mobile-menu"
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!showMobileMenu}
      >
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${showMobileMenu ? 'opacity-50' : 'opacity-0'}`}
          onClick={() => setShowMobileMenu(false)}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center" onClick={handleMobileNavClick} aria-label="Nexjob - Beranda">
                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Nexjob
                </span>
              </Link>
              <button
                ref={closeButtonRef}
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Tutup menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4" aria-label="Navigasi mobile">
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={handleMobileNavClick}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Beranda
                </Link>
                <Link
                  href="/lowongan-kerja/"
                  onClick={handleMobileNavClick}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/lowongan-kerja/')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Cari Lowongan
                </Link>
                <Link
                  href="/artikel/"
                  onClick={handleMobileNavClick}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/artikel/')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Tips Karir
                </Link>
              </div>
            </nav>


          </div>
        </div>
      </div>
    </>
  );
};

export default Header;