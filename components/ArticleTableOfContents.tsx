'use client';

import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTableOfContentsProps {
  content: string;
}

const ArticleTableOfContents: React.FC<ArticleTableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const parseHeadings = () => {
      // Use DOMParser instead of innerHTML to avoid XSS (DOMParser doesn't execute scripts)
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      const headingElements = doc.querySelectorAll('h2, h3');
      const parsed: Heading[] = [];

      headingElements.forEach((heading, index) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.substring(1));
        // IDs match those set by parseContent() in ArticleContentWrapper
        const id = `heading-${index}`;
        parsed.push({ id, text, level });
      });

      setHeadings(parsed);
    };

    if (content) {
      parseHeadings();
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <List className="h-5 w-5 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Daftar Isi</h2>
      </div>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`
              w-full text-left py-2 px-3 rounded-md transition-colors duration-200
              ${heading.level === 3 ? 'pl-6' : ''}
              ${activeId === heading.id
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ArticleTableOfContents;
