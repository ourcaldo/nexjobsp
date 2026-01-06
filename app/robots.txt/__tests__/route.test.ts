/**
 * Tests for robots.txt ISR route
 */

import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock the TugasCMS provider
jest.mock('@/lib/cms/providers/tugascms', () => ({
  tugasCMSProvider: {
    getRobotsTxt: jest.fn(),
  },
}))

describe('Robots.txt ISR Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.NEXT_PUBLIC_SITE_URL = 'https://nexjob.tech'
  })

  it('should return robots.txt content from CMS', async () => {
    const { tugasCMSProvider } = require('@/lib/cms/providers/tugascms')
    const mockRobotsContent = `User-agent: *
Allow: /
Sitemap: https://nexjob.tech/sitemap.xml`

    tugasCMSProvider.getRobotsTxt.mockResolvedValue(mockRobotsContent)

    const request = new NextRequest('https://nexjob.tech/robots.txt')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(response.headers.get('X-Source')).toBe('cms')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600')
    
    const content = await response.text()
    expect(content).toBe(mockRobotsContent)
  })

  it('should return fallback content when CMS returns null', async () => {
    const { tugasCMSProvider } = require('@/lib/cms/providers/tugascms')
    tugasCMSProvider.getRobotsTxt.mockResolvedValue(null)

    const request = new NextRequest('https://nexjob.tech/robots.txt')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(response.headers.get('X-Source')).toBe('fallback')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, s-maxage=300')
    
    const content = await response.text()
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Allow: /')
    expect(content).toContain('Sitemap: https://nexjob.tech/sitemap.xml')
  })

  it('should return emergency fallback when CMS throws error', async () => {
    const { tugasCMSProvider } = require('@/lib/cms/providers/tugascms')
    tugasCMSProvider.getRobotsTxt.mockRejectedValue(new Error('CMS connection failed'))

    const request = new NextRequest('https://nexjob.tech/robots.txt')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(response.headers.get('X-Source')).toBe('emergency-fallback')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60, s-maxage=60')
    
    const content = await response.text()
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Allow: /')
    expect(content).toContain('Sitemap: https://nexjob.tech/sitemap.xml')
  })

  it('should use environment variable for sitemap URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com'
    
    const { tugasCMSProvider } = require('@/lib/cms/providers/tugascms')
    tugasCMSProvider.getRobotsTxt.mockResolvedValue(null)

    const request = new NextRequest('https://custom-domain.com/robots.txt')
    const response = await GET(request)

    const content = await response.text()
    expect(content).toContain('Sitemap: https://custom-domain.com/sitemap.xml')
  })

  it('should include X-Generated-At header for CMS content', async () => {
    const { tugasCMSProvider } = require('@/lib/cms/providers/tugascms')
    tugasCMSProvider.getRobotsTxt.mockResolvedValue('User-agent: *\nAllow: /')

    const request = new NextRequest('https://nexjob.tech/robots.txt')
    const response = await GET(request)

    expect(response.headers.get('X-Generated-At')).toBeTruthy()
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
  })
})