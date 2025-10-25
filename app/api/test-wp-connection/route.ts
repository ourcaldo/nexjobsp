import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiUrl, filtersApiUrl, authToken } = await request.json();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Test main API
    const mainApiTest = fetch(`${apiUrl}/posts?per_page=1`, { headers })
      .then(response => ({
        endpoint: 'Posts API',
        url: `${apiUrl}/posts`,
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      }))
      .catch(error => ({
        endpoint: 'Posts API',
        url: `${apiUrl}/posts`,
        success: false,
        error: error.message
      }));

    // Test jobs API
    const jobsApiTest = fetch(`${apiUrl}/lowongan-kerja?per_page=1`, { headers })
      .then(response => ({
        endpoint: 'Jobs API',
        url: `${apiUrl}/lowongan-kerja`,
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      }))
      .catch(error => ({
        endpoint: 'Jobs API',
        url: `${apiUrl}/lowongan-kerja`,
        success: false,
        error: error.message
      }));

    // Test filters API
    const filtersApiTest = fetch(filtersApiUrl, { headers })
      .then(response => ({
        endpoint: 'Filters API',
        url: filtersApiUrl,
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      }))
      .catch(error => ({
        endpoint: 'Filters API',
        url: filtersApiUrl,
        success: false,
        error: error.message
      }));

    const results = await Promise.all([mainApiTest, jobsApiTest, filtersApiTest]);
    const allSuccess = results.every(result => result.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? 'All API connections successful' 
        : 'Some API connections failed',
      results
    });
  } catch (error) {
    console.error('Error testing connections:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    }, { status: 500 });
  }
}
