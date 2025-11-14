import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showHome = false }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {showHome && (
        <>
          <Link 
            href="/" 
            className="hover:text-primary-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;