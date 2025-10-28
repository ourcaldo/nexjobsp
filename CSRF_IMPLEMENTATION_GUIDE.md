# CSRF Protection Implementation Guide

## Overview
CSRF (Cross-Site Request Forgery) protection utilities have been created in `lib/utils/csrf.ts`. This guide explains how to integrate full CSRF protection across the application.

## Current Status
✅ **Created**: CSRF utility functions  
⚠️ **Pending**: Integration into API routes and frontend

## Implementation Steps

### 1. Backend Integration

#### Option A: Using withCSRFProtection Wrapper (Recommended)

```typescript
// app/api/example/route.ts
import { withCSRFProtection } from '@/lib/utils/csrf';
import { NextRequest, NextResponse } from 'next/server';

const handler = async (request: NextRequest) => {
  // Your route logic here
  return NextResponse.json({ success: true });
};

export const POST = withCSRFProtection(handler);
export const PUT = withCSRFProtection(handler);
export const DELETE = withCSRFProtection(handler);
```

#### Option B: Manual Validation

```typescript
// app/api/example/route.ts
import { validateRequest } from '@/lib/utils/csrf';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const validation = validateRequest(request, expectedToken, true);
  
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 403 }
    );
  }

  // Your route logic here
}
```

### 2. Token Generation & Distribution

#### Create a CSRF Token Endpoint

```typescript
// app/api/csrf-token/route.ts
import { generateCSRFToken } from '@/lib/utils/csrf';
import { NextResponse } from 'next/server';

export async function GET() {
  const { token, expiresAt } = generateCSRFToken();
  
  // Store token in session or return to client
  const response = NextResponse.json({ token, expiresAt });
  
  // Option 1: Double-submit cookie pattern
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
  });
  
  return response;
}
```

### 3. Frontend Integration

#### Create a CSRF Hook

```typescript
// hooks/useCSRF.ts
import { useState, useEffect } from 'react';

export const useCSRF = () => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      setToken(data.token);
    };

    fetchToken();
  }, []);

  return token;
};
```

#### Add Token to Requests

```typescript
// Example usage in a component
import { useCSRF } from '@/hooks/useCSRF';

const MyComponent = () => {
  const csrfToken = useCSRF();

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  };

  // ... component code
};
```

### 4. Protected Routes to Update

The following routes should be protected with CSRF tokens:

#### Admin Routes
- `POST /api/admin/settings` - Update admin settings
- `PUT /api/admin/settings` - Update admin settings
- All admin CMS routes

#### User Routes
- `POST /api/user/bookmarks` - Create bookmark
- `DELETE /api/user/bookmarks` - Delete bookmark
- `POST /api/user/profile` - Update profile
- `PUT /api/user/profile` - Update profile

#### Content Routes
- `POST /api/articles` - Create article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

### 5. Testing CSRF Protection

```bash
# Test without CSRF token (should fail)
curl -X POST http://localhost:5000/api/protected-route \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Test with CSRF token (should succeed)
curl -X POST http://localhost:5000/api/protected-route \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token-here" \
  -d '{"data": "test"}'
```

### 6. Alternative: SameSite Cookie Strategy

For modern browsers, using SameSite cookies provides good CSRF protection:

```typescript
// In your authentication flow
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // or 'lax'
  maxAge: 3600,
});
```

## Security Considerations

1. **Token Storage**: Never store CSRF tokens in localStorage (XSS vulnerable)
2. **HTTPS Only**: Always use secure cookies in production
3. **Token Rotation**: Regenerate tokens after sensitive operations
4. **Expiration**: Implement token expiration (currently 1 hour)
5. **Session Binding**: Bind tokens to user sessions for stronger protection

## Next Steps

1. Create `/api/csrf-token` endpoint
2. Add `useCSRF` hook to project
3. Update all POST/PUT/DELETE/PATCH routes
4. Test protected endpoints
5. Document CSRF token usage for frontend developers

## Resources

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
