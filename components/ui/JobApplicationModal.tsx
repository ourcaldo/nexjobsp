'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';
import AdDisplay from '@/components/Advertisement/AdDisplay';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  jobLink: string;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  jobLink
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key handler & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element when modal opens
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-application-modal-title"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        {/* Header with close button */}
        <div className="flex items-center justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Advertisement - Compact */}
          <div className="mb-4 max-h-24 overflow-hidden">
            <AdDisplay position="single_top" />
          </div>

          {/* Warning Message - Modern Design */}
          <div className="border-2 border-dashed border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 mb-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <p id="job-application-modal-title" className="font-bold text-yellow-900 mb-2">
                  Peringatan Penting!
                </p>
                <p className="text-yellow-900 leading-relaxed">
                  Hati-hati terhadap penipuan! Perusahaan yang sah <span className="font-bold text-orange-700">tidak akan pernah meminta biaya</span> dalam proses rekrutmen, termasuk untuk: biaya administrasi atau pendaftaran, pelatihan atau sertifikasi, pemeriksaan kesehatan, dan seragam atau perlengkapan. <span className="font-bold">Anda akan dialihkan ke situs web perusahaan untuk melanjutkan proses lamaran.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Batalkan
            </button>
            <button
              onClick={onProceed}
              className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-semibold inline-flex items-center justify-center text-sm"
            >
              Kirim Lamaran
              <ExternalLink className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
