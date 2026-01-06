'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Menu, X, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    // No authentication system
    setUser(null);
    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [initializeAuth]);

  // Re-check auth state on route changes (App Router - using pathname)
  useEffect(() => {
    // Only re-check auth if we don't have a user or if going to profile page
    if (!user || pathname?.includes('/profile')) {
      const timer = setTimeout(() => {
        initializeAuth();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, initializeAuth, user]);

  const handleLogout = async () => {
    try {
      // Placeholder logout - no authentication system
      setShowUserMenu(false);
      setShowMobileMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

    if (path === '/profile/') {
      return pathname === '/profile' || 
             pathname === '/profile/' ||
             pathname.startsWith('/profile/');
    }

    return pathname === path || pathname === path + '/';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" aria-label="Nexjob - Beranda">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Search className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Nex<span className="text-primary-600">job</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Navigasi utama">
              <Link 
                href="/" 
                className={`font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Beranda
              </Link>
              <Link 
                href="/lowongan-kerja/" 
                className={`font-medium transition-colors ${
                  isActive('/lowongan-kerja/')
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Cari Lowongan
              </Link>
              <Link 
                href="/artikel/" 
                className={`font-medium transition-colors ${
                  isActive('/artikel/')
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Tips Karir
              </Link>
            </nav>

            {/* Desktop Right Side - No authentication system */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Nothing here - no auth system */}
            </div>

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

        {/* Click outside to close desktop user menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
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
              <Link href="/" className="flex items-center space-x-2" onClick={handleMobileNavClick} aria-label="Nexjob - Beranda">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Nex<span className="text-primary-600">job</span>
                </span>
              </Link>
              <button
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

            {/* User Section - No authentication system */}
            <div className="p-4 border-t border-gray-200">
              {/* Nothing here - no auth system */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;