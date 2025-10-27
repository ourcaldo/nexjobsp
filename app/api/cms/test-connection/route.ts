import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export async function GET() {
  try {
    const wpTest = await cmsService.testConnection();
    const filtersTest = await cmsService.testFiltersConnection();

    return NextResponse.json({
      success: true,
      data: {
        connection: wpTest.success,
        filters: filtersTest.success,
        wpTest,
        filtersTest
      }
    });
  } catch (error) {
    console.error('Error testing CMS connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test CMS connection',
        data: {
          connection: false,
          filters: false
        }
      },
      { status: 500 }
    );
  }
}
