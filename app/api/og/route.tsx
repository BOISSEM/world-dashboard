import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#84cc16';
  if (score >= 30) return '#fbbf24';
  return '#ef4444';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? 'Unknown Country';
  const region = searchParams.get('region') ?? '';
  const scoreParam = searchParams.get('score');
  const score = scoreParam != null ? parseFloat(scoreParam) : null;

  const nameFontSize = name.length > 22 ? 52 : name.length > 16 ? 62 : 72;
  const color = score != null ? scoreColor(score) : '#94a3b8';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Site label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '6px 18px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '18px',
              letterSpacing: '0.02em',
            }}
          >
            shitholecountries.fr
          </div>
        </div>

        {/* Country name + region */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div
            style={{
              color: 'white',
              fontSize: `${nameFontSize}px`,
              fontWeight: 'bold',
              lineHeight: 1.1,
              marginBottom: '12px',
            }}
          >
            {name}
          </div>
          {region ? (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '26px' }}>
              {region}
            </div>
          ) : null}
        </div>

        {/* Score section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {score != null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color, fontSize: '100px', fontWeight: 'bold', lineHeight: 1 }}>
                {score.toFixed(0)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '40px', marginBottom: '8px' }}>
                / 100
              </span>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '28px' }}>
              No score available
            </div>
          )}

          {/* Score bar */}
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '5px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${score ?? 0}%`,
                height: '100%',
                background: color,
                borderRadius: '5px',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
