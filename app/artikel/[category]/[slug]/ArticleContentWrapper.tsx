'use client';

import React, { useState, useEffect } from 'react';
import ArticleTableOfContents from '@/components/ArticleTableOfContents';
import AdDisplay from '@/components/Advertisement/AdDisplay';
import { advertisementService } from '@/lib/utils/advertisements';

interface ArticleContentWrapperProps {
  content: string;
}

const ArticleContentWrapper: React.FC<ArticleContentWrapperProps> = ({ content }) => {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    const processContentWithAds = async () => {
      try {
        const middleAdCode = await advertisementService.getAdCode('single_middle_ad_code');
        if (middleAdCode) {
          const withAds = advertisementService.insertMiddleAd(content, middleAdCode);
          setProcessedContent(withAds);
        } else {
          setProcessedContent(content);
        }
      } catch (error) {
        setProcessedContent(content);
      }
    };

    if (content) {
      processContentWithAds();
    }
  }, [content]);

  const parseContent = (htmlContent: string) => {
    let headingIndex = 0;
    return htmlContent
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
      .replace(/<img/g, '<img class="w-full h-auto my-6 rounded-lg"');
  };

  return (
    <>
      {/* Table of Contents - Below image and meta */}
      <ArticleTableOfContents content={content} />

      {/* Top Advertisement */}
      <div className="mb-8">
        <AdDisplay position="single_top_ad_code" className="mb-6" />
      </div>

      {/* Article Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: parseContent(processedContent || content) }}
      />

      {/* Bottom Advertisement */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <AdDisplay position="single_bottom_ad_code" />
      </div>
    </>
  );
};

export default ArticleContentWrapper;
