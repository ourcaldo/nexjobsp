'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#ffffff',
      color: '#111827',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem 1rem 4rem 1rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        
        <div style={{
          marginBottom: '2rem',
          width: '300px',
          height: '300px'
        }}>
          <img 
            src="https://nexjob.b-cdn.net/404.png" 
            alt="404 Illustration" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              animation: 'float 6s ease-in-out infinite'
            }}
          />
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Uh-oh... I think I took<br />a wrong turn.
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '2.5rem'
        }}>
          Let&apos;s get you back to where everything makes sense.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          <Link 
            href="/" 
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Go home
          </Link>
          <button 
            onClick={() => router.back()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827';
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Go back
          </button>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @media (max-width: 600px) {
          h1 {
            font-size: 1.75rem !important;
          }
          div[style*="width: 300px"] {
            width: 240px !important;
            height: 240px !important;
          }
          div[style*="display: flex"][style*="gap: 1rem"] {
            flex-direction: column;
            width: 100%;
            align-items: center;
          }
          a, button {
            width: 100%;
            max-width: 300px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
