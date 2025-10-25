'use client';

import UnifiedEditor from '@/components/admin/cms/UnifiedEditor';

interface EditJobProps {
  params: {
    id: string;
  };
}

export default function EditJob({ params }: EditJobProps) {
  return <UnifiedEditor contentType="jobs" itemId={params.id} />;
}
