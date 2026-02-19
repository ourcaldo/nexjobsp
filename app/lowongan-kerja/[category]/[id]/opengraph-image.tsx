import { ImageResponse } from 'next/og';
import { jobService } from '@/lib/services/JobService';
import { config } from '@/lib/config';

export const alt = `Lowongan Kerja - ${config.site.name}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ category: string; id: string }> }) {
  try {
    const resolvedParams = await params;
    const job = await jobService.getJobById(resolvedParams.id);

    if (!job) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0f2b3c 0%, #153a54 100%)',
              color: 'white',
              fontSize: 60,
              fontWeight: 'bold',
            }}
          >
            Lowongan Tidak Ditemukan
          </div>
        ),
        {
          ...size,
        }
      );
    }

    const isSalaryHidden = job.gaji === 'Perusahaan Tidak Menampilkan Gaji';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f2b3c 0%, #153a54 100%)',
            padding: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: 'white',
              borderRadius: '20px',
              padding: '60px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '15px',
                  background: 'linear-gradient(135deg, #0f2b3c 0%, #153a54 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                }}
              >
                <span style={{ fontSize: '32px' }}>💼</span>
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {config.site.name}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#111827',
                  lineHeight: 1.2,
                  marginBottom: '20px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {job.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}
              >
                <span style={{ fontSize: '28px', marginRight: '10px' }}>🏢</span>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: '600',
                    color: '#2d607f',
                  }}
                >
                  {job.company_name}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}
              >
                <span style={{ fontSize: '28px', marginRight: '10px' }}>📍</span>
                <span
                  style={{
                    fontSize: '28px',
                    color: '#6b7280',
                  }}
                >
                  {job.lokasi_kota}, {job.lokasi_provinsi}
                </span>
              </div>

              {!isSalaryHidden && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '28px', marginRight: '10px' }}>💰</span>
                  <span
                    style={{
                      fontSize: '32px',
                      fontWeight: '600',
                      color: '#059669',
                    }}
                  >
                    {job.gaji}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '30px',
                paddingTop: '30px',
                borderTop: '2px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '22px',
                    color: '#6b7280',
                  }}
                >
                  {job.tipe_pekerjaan}
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    color: '#6b7280',
                    marginLeft: '30px',
                  }}
                >
                  {job.pendidikan}
                </span>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#2d607f',
                }}
              >
                {config.site.url.replace(/^https?:\/\//, '')}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
              background: 'linear-gradient(135deg, #0f2b3c 0%, #153a54 100%)',
            color: 'white',
            fontSize: 60,
            fontWeight: 'bold',
          }}
        >
          Error Loading Job
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
