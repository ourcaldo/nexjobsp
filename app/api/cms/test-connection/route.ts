import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';
import { categoryService } from '@/lib/services/CategoryService';
import { logger } from '@/lib/logger';

const log = logger.child('api:cms:test-connection');

export async function GET(request: NextRequest) {
  // Require CMS_TOKEN for access — prevents information leakage
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CMS_TOKEN;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wpTest = await (async () => {
      try {
        const result = await jobService.getJobs({}, 1, 1);
        return { 
          success: result.totalJobs >= 0,
          data: result.jobs?.[0] || null 
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    })();

    const filtersTest = await (async () => {
      try {
        const result = await categoryService.getCategories(1, 1);
        return { 
          success: result.success || false,
          data: result 
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    })();

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
    log.error('CMS connection test failed', { route: '/api/cms/test-connection' }, error);
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
