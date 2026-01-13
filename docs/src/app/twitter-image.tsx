import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'ClaudeShip - AI-Powered App Builder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="64" height="64" rx="14" fill="white" fillOpacity="0.2" />
            <path
              d="M32 10 C24 18 20 28 20 40 L32 34 L44 40 C44 28 40 18 32 10 Z"
              fill="white"
            />
            <circle cx="32" cy="26" r="5" fill="#764ba2" />
            <path d="M26 44 L32 54 L38 44" fill="white" fillOpacity="0.7" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          ClaudeShip
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Build apps with natural language
        </div>

        {/* Command */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 40,
            padding: '16px 32px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 12,
            fontSize: 28,
            color: 'white',
            fontFamily: 'monospace',
          }}
        >
          npx claudeship
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
