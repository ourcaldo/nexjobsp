'use client';

import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

const ShareButton = ({ title, text, url, className = '' }: ShareButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });
        setShowMenu(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setShowMenu(true);
        }
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (error) {
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
        aria-label="Bagikan lowongan ini"
      >
        <Share2 className="h-5 w-5" />
        <span className="hidden sm:inline">Bagikan</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
            <button
              onClick={shareToFacebook}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              aria-label="Bagikan ke Facebook"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Bagikan ke Facebook</span>
            </button>
            <button
              onClick={shareToTwitter}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              aria-label="Bagikan ke Twitter"
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <span>Bagikan ke Twitter</span>
            </button>
            <button
              onClick={shareToLinkedIn}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              aria-label="Bagikan ke LinkedIn"
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span>Bagikan ke LinkedIn</span>
            </button>
            <hr className="my-2" />
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              aria-label="Salin link"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Link disalin!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5 text-gray-600" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
