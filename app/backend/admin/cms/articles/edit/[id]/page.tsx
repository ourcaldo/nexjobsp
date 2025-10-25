'use client';

import UnifiedEditor from '@/components/admin/cms/UnifiedEditor';

interface EditArticleProps {
  params: {
    id: string;
  };
}

export default function EditArticle({ params }: EditArticleProps) {
  return <UnifiedEditor contentType="articles" itemId={params.id} />;
}
