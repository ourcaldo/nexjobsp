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
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-6">
      <ol className="flex items-center space-x-2">
        {showHome && (
          <>
            <li>
              <Link 
                href="/" 
                className="hover:text-primary-600 transition-colors"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
          </>
        )}
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </li>
            )}
            <li>
              {item.href && index < items.length - 1 ? (
                <Link 
                  href={item.href} 
                  className="hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''} aria-current={index === items.length - 1 ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;