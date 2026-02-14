import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { logger } from '@/lib/logger'

const log = logger.child('api:advertisements')

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${config.cms.endpoint}/api/v1/settings/advertisements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.cms.token}`,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    })

    if (!response.ok) {
      throw new Error(`CMS API returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    log.error('Failed to fetch advertisements from CMS', { route: '/api/advertisements' }, error)
    
    // Return default/empty advertisements on error
    return NextResponse.json({
      success: true,
      data: {
        popup_ad: {
          enabled: false,
          url: '',
          load_settings: [],
          max_executions: 0,
          device: 'all'
        },
        ad_codes: {
          sidebar_archive: '',
          sidebar_single: '',
          single_top: '',
          single_bottom: '',
          single_middle: ''
        }
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  }
}
