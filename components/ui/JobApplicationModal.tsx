'use client';

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
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

          {/* Warning Message - Compact */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-5 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 mb-1.5">
                  Peringatan Penting!
                </p>
                <p className="text-yellow-800 leading-relaxed">
                  Hati-hati terhadap penipuan! Perusahaan yang sah <strong>tidak akan pernah meminta biaya</strong> dalam proses rekrutmen, termasuk untuk: biaya administrasi atau pendaftaran, pelatihan atau sertifikasi, pemeriksaan kesehatan, dan seragam atau perlengkapan. Anda akan dialihkan ke situs web perusahaan untuk melanjutkan proses lamaran.
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
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2.5 px-4 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl text-sm"
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
