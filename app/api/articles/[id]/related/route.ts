import { NextRequest, NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const relatedArticles = await cmsService.getRelatedArticles(id, limit);

    return NextResponse.json({
      success: true,
      data: relatedArticles
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
}
