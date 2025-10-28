
import React from 'react';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface CMSContentProps {
  content: string;
  className?: string;
}

const CMSContent: React.FC<CMSContentProps> = ({ content, className = '' }) => {
  const sanitizedContent = sanitizeHTML(content);
  
  return (
    <div 
      className={`cms-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default CMSContent;
