'use client';

import React, { useMemo } from 'react';
import ArticleTableOfContents from '@/components/ArticleTableOfContents';
import AdDisplay from '@/components/Advertisement/AdDisplay';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface ArticleContentWrapperProps {
  content: string;
}

// Add Tailwind classes and heading IDs to sanitized HTML
// startIndex ensures continuous heading numbering across split content
const parseContent = (htmlContent: string, startIndex = 0): { html: string; nextIndex: number } => {
  let headingIndex = startIndex;
  const html = htmlContent
    .replace(/<h2>/g, () => {
      const id = `heading-${headingIndex++}`;
      return `<h2 id="${id}" class="text-2xl font-bold text-gray-900 mt-8 mb-4">`;
    })
    .replace(/<h3>/g, () => {
      const id = `heading-${headingIndex++}`;
      return `<h3 id="${id}" class="text-xl font-semibold text-gray-900 mt-6 mb-3">`;
    })
    .replace(/<p>/g, '<p class="text-gray-700 mb-4 leading-relaxed">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-4 text-gray-700 ml-4">')
    .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-4 text-gray-700 ml-4">')
    .replace(/<li>/g, '<li class="pl-2">')
    .replace(/<img\b([^>]*?)>/g, (_match, attrs: string) => {
      const hasAlt = /\balt\s*=/.test(attrs);
      return `<img class="w-full h-auto my-6 rounded-lg"${hasAlt ? '' : ' alt=""'}${attrs}>`;
    });
  return { html, nextIndex: headingIndex };
};

// Split sanitized content at the middle h2 for ad insertion
const splitContentAtMiddle = (htmlContent: string): { top: string; bottom: string; split: boolean } => {
  if (typeof DOMParser === 'undefined') {
    return { top: htmlContent, bottom: '', split: false };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings = doc.querySelectorAll('h2');

    if (headings.length < 2) {
      return { top: htmlContent, bottom: '', split: false };
    }

    const middleIndex = Math.floor(headings.length / 2);
    const targetHeading = headings[middleIndex];

    // Collect nodes before and after the target heading
    const allNodes = Array.from(doc.body.childNodes);
    let foundTarget = false;
    const topNodes: Node[] = [];
    const bottomNodes: Node[] = [];

    for (const node of allNodes) {
      if (node === targetHeading || node.contains(targetHeading)) {
        foundTarget = true;
      }
      if (foundTarget) {
        bottomNodes.push(node);
      } else {
        topNodes.push(node);
      }
    }

    const topDiv = doc.createElement('div');
    topNodes.forEach(n => topDiv.appendChild(n.cloneNode(true)));

    const bottomDiv = doc.createElement('div');
    bottomNodes.forEach(n => bottomDiv.appendChild(n.cloneNode(true)));

    return {
      top: topDiv.innerHTML,
      bottom: bottomDiv.innerHTML,
      split: true,
    };
  } catch {
    return { top: htmlContent, bottom: '', split: false };
  }
};

const ArticleContentWrapper: React.FC<ArticleContentWrapperProps> = ({ content }) => {
  // Sanitize CMS content first, then apply styling classes
  const sanitizedContent = useMemo(() => sanitizeHTML(content), [content]);

  const { topHtml, bottomHtml, hasMiddleSplit } = useMemo(() => {
    const { top, bottom, split } = splitContentAtMiddle(sanitizedContent);
    const topResult = parseContent(top, 0);
    const bottomResult = parseContent(bottom, topResult.nextIndex);
    return {
      topHtml: topResult.html,
      bottomHtml: bottomResult.html,
      hasMiddleSplit: split,
    };
  }, [sanitizedContent]);

  return (
    <>
      {/* Table of Contents - Below image and meta */}
      <ArticleTableOfContents content={sanitizedContent} />

      {/* Top Advertisement */}
      <div className="mb-8">
        <AdDisplay position="single_top_ad_code" className="mb-6" />
      </div>

      {/* Article Content — Top Half */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: topHtml }}
      />

      {/* Middle Advertisement (rendered as React component, not raw HTML injection) */}
      {hasMiddleSplit && (
        <>
          <div className="my-6">
            <AdDisplay position="single_middle_ad_code" />
          </div>

          {/* Article Content — Bottom Half */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: bottomHtml }}
          />
        </>
      )}

      {/* Bottom Advertisement */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <AdDisplay position="single_bottom_ad_code" />
      </div>
    </>
  );
};

export default ArticleContentWrapper;
