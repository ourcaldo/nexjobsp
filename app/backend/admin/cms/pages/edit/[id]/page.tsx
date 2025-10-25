'use client';

import UnifiedEditor from '@/components/admin/cms/UnifiedEditor';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditPage({ params }: EditPageProps) {
  return <UnifiedEditor contentType="pages" itemId={params.id} />;
}
