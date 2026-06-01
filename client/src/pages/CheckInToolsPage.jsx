import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const formatDateTime = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function CheckInToolsPage() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: '',
    success: '',
    data: {
      gym: null,
      recent_check_ins: []
    }
  });

  useEffect(() => {
    const loadTools = async () => {
      try {
        setState((current) => ({
          ...current,
          loading: true,
          error: '',
          success: ''
        }));
        const response = await api.get('/public-check-in/tools/current');
        setState({
          loading: false,
          error: '',
          success: '',
          data: response.data || { gym: null, recent_check_ins: [] }
        });
      } catch (error) {
        setState({
          loading: false,
          error: error.response?.data?.message || 'Could not load check-in tools right now.',
          success: '',
          data: {
            gym: null,
            recent_check_ins: []
          }
        });
      }
    };

    loadTools();
  }, []);

  const checkInUrl = useMemo(() => {
    const slug = state.data.gym?.slug || user?.slug || '';
    if (!slug || typeof window === 'undefined') {
      return '';
    }

    const baseUrl = String(state.data.public_app_base_url || '').trim().replace(/\/$/, '')
      || window.location.origin;

    return `${baseUrl}/check-in/${slug}`;
  }, [state.data.gym?.slug, state.data.public_app_base_url, user?.slug]);

  const qrImageUrl = useMemo(() => (
    checkInUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=16&data=${encodeURIComponent(checkInUrl)}`
      : ''
  ), [checkInUrl]);

  const handleCopyLink = async () => {
    if (!checkInUrl) return;

    try {
      await navigator.clipboard.writeText(checkInUrl);
      setState((current) => ({
        ...current,
        success: 'Check-in link copied.'
      }));
    } catch {
      setState((current) => ({
        ...current,
        success: 'Copy failed on this device. Use the link field below.'
      }));
    }
  };

  const handlePrintQr = () => {
    if (!checkInUrl || !qrImageUrl || typeof window === 'undefined') {
      return;
    }

    const gymName = state.data.gym?.name || user?.gym_name || 'Gym check-in';
    const printWindow = window.open('', '_blank', 'width=900,height=1200');

    if (!printWindow) {
      setState((current) => ({
        ...current,
        success: 'Popup blocked on this device. Allow popups to print the QR page.'
      }));
      return;
    }

    const safeGymName = gymName.replace(/"/g, '&quot;');
    const safeQrImageUrl = qrImageUrl.replace(/"/g, '&quot;');
    const safeCheckInUrl = checkInUrl.replace(/"/g, '&quot;');

    printWindow.document.write(`
      <html>
        <head>
          <title>${safeGymName} QR Check-In</title>
          <style>
            @page {
              size: auto;
              margin: 0.35in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 18px;
              color: #0f172a;
              background: #ffffff;
              text-align: center;
            }
            .shell {
              max-width: 760px;
              margin: 0 auto;
              border: 3px solid #1d4ed8;
              border-radius: 24px;
              padding: 30px 32px 22px;
              box-sizing: border-box;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .eyebrow {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #2563eb;
              margin-bottom: 10px;
            }
            h1 {
              margin: 0 0 12px;
              font-size: 36px;
              line-height: 1.1;
            }
            p {
              font-size: 19px;
              line-height: 1.5;
              margin: 0 0 16px;
            }
            img {
              width: 330px;
              height: 330px;
              margin: 8px auto 18px;
              display: block;
            }
            .steps {
              text-align: left;
              max-width: 520px;
              margin: 18px auto 0;
              font-size: 17px;
              line-height: 1.45;
              padding-left: 24px;
            }
            .steps li {
              margin-bottom: 8px;
            }
            .link {
              margin-top: 16px;
              font-size: 11px;
              word-break: break-all;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="eyebrow">Progressory QR Check-In</div>
            <h1>${safeGymName}</h1>
            <p>Scan this code to check in fast before class or to finish your member setup.</p>
            <img id="qr-image" src="${safeQrImageUrl}" alt="QR code for ${safeGymName}" />
            <ol class="steps">
              <li>Already a member? Use your roster email and last name to check in.</li>
              <li>Need access first? Choose Initial setup and finish your account.</li>
              <li>If two nearby classes show up, choose the one you are attending right now.</li>
            </ol>
            <div class="link">${safeCheckInUrl}</div>
          </div>
          <script>
            const printNow = () => {
              window.focus();
              window.print();
            };

            const qrImage = document.getElementById('qr-image');
            if (qrImage && qrImage.complete) {
              setTimeout(printNow, 150);
            } else if (qrImage) {
              qrImage.addEventListener('load', () => setTimeout(printNow, 150), { once: true });
              qrImage.addEventListener('error', printNow, { once: true });
            } else {
              setTimeout(printNow, 150);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPoster = async () => {
    if (!checkInUrl || !qrImageUrl || typeof window === 'undefined') {
      return;
    }

    const gymName = state.data.gym?.name || user?.gym_name || 'Gym check-in';
    const safeFileName = gymName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'gym-check-in';

    try {
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';

      const loadedImage = await new Promise((resolve, reject) => {
        qrImage.onload = () => resolve(qrImage);
        qrImage.onerror = () => reject(new Error('Could not load QR image.'));
        qrImage.src = qrImageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 2000;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas is not available on this device.');
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = '#2563eb';
      context.lineWidth = 8;
      const shellX = 80;
      const shellY = 90;
      const shellWidth = canvas.width - 160;
      const shellHeight = 1480;
      const shellRadius = 40;

      context.beginPath();
      context.moveTo(shellX + shellRadius, shellY);
      context.lineTo(shellX + shellWidth - shellRadius, shellY);
      context.quadraticCurveTo(shellX + shellWidth, shellY, shellX + shellWidth, shellY + shellRadius);
      context.lineTo(shellX + shellWidth, shellY + shellHeight - shellRadius);
      context.quadraticCurveTo(shellX + shellWidth, shellY + shellHeight, shellX + shellWidth - shellRadius, shellY + shellHeight);
      context.lineTo(shellX + shellRadius, shellY + shellHeight);
      context.quadraticCurveTo(shellX, shellY + shellHeight, shellX, shellY + shellHeight - shellRadius);
      context.lineTo(shellX, shellY + shellRadius);
      context.quadraticCurveTo(shellX, shellY, shellX + shellRadius, shellY);
      context.stroke();

      context.textAlign = 'center';
      context.fillStyle = '#2563eb';
      context.font = '700 28px Arial';
      context.fillText('PROGRESSORY QR CHECK-IN', canvas.width / 2, 180);

      context.fillStyle = '#0f172a';
      context.font = '700 72px Arial';
      context.fillText(gymName, canvas.width / 2, 270);

      context.fillStyle = '#0f172a';
      context.font = '400 32px Arial';
      const subtitleLines = [
        'Scan this code to check in fast before class',
        'or to finish your member setup.'
      ];
      subtitleLines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, 350 + (index * 42));
      });

      context.drawImage(loadedImage, (canvas.width - 560) / 2, 455, 560, 560);

      const stepLines = [
        '1. Already a member? Use your roster email and last name to check in.',
        '2. Need access first? Choose Initial setup and finish your account.',
        '3. If two nearby classes show up, choose the one you are attending right now.'
      ];

      context.textAlign = 'left';
      context.fillStyle = '#0f172a';
      context.font = '400 34px Arial';

      let currentY = 1100;
      for (const line of stepLines) {
        const wrapped = [];
        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (context.measureText(testLine).width > 980 && currentLine) {
            wrapped.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          wrapped.push(currentLine);
        }

        wrapped.forEach((wrappedLine) => {
          context.fillText(wrappedLine, 190, currentY);
          currentY += 48;
        });

        currentY += 22;
      }

      context.textAlign = 'center';
      context.fillStyle = '#64748b';
      context.font = '400 22px Arial';
      context.fillText(checkInUrl, canvas.width / 2, shellY + shellHeight - 50);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${safeFileName}-qr-poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setState((current) => ({
        ...current,
        success: 'QR poster download started.'
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        success: error.message || 'Could not download the QR poster right now.'
      }));
    }
  };

  return (
    <Layout>
      <div className="account-page qr-tools-page">
        <h2 className="page-title">Check-In Tools</h2>
        <p className="page-description">
          Put this QR at the front desk so members, students, and coaches can either set up access or check in quickly before class starts.
        </p>

        <section className="page-section">
          <div className="platform-admin-reporting-grid qr-tools-grid">
            <article className="account-billing-card platform-admin-feature-card qr-tools-card">
              <span className="eyebrow">Front desk QR</span>
              <h3>{state.data.gym?.name || user?.gym_name || 'Gym check-in'}</h3>
              <p className="section-note">
                Show this QR in person. The page gives people two paths: initial setup or already-registered quick check-in.
              </p>

              {state.loading ? <div className="platform-admin-empty-state">Loading QR tools...</div> : null}
              {!state.loading && state.error ? <p className="form-error">{state.error}</p> : null}
              {!state.loading && qrImageUrl ? (
                <>
                  <div className="qr-code-shell">
                    <img src={qrImageUrl} alt="Gym check-in QR code" className="qr-code-image" />
                  </div>

                  <div className="inline-actions qr-tools-actions">
                    <button type="button" onClick={handleCopyLink}>
                      Copy check-in link
                    </button>
                    <button type="button" className="secondary-button" onClick={handleDownloadPoster}>
                      Download QR poster
                    </button>
                    <button type="button" className="secondary-button" onClick={handlePrintQr}>
                      Print QR poster
                    </button>
                    <a className="secondary-button" href={checkInUrl} target="_blank" rel="noreferrer">
                      Open public page
                    </a>
                  </div>

                  <div className="account-billing-card qr-tools-link-card">
                    <strong>Check-in page link</strong>
                    <p className="section-note qr-tools-link-copy">{checkInUrl}</p>
                  </div>
                </>
              ) : null}

              {state.success ? <p className="success-text">{state.success}</p> : null}
            </article>

            <article className="account-billing-card platform-admin-feature-card qr-tools-card">
              <span className="eyebrow">What people see</span>
              <h3>Fast arrival flow</h3>
              <ul className="card-list qr-tools-list">
                <li>Initial setup: Progressory matches the gym roster and opens the correct setup link.</li>
                <li>Already registered: users enter their roster email and last name to check in in under 45 seconds.</li>
                <li>Check-ins are recorded separately so coaches can use them as an arrival signal without guessing class attendance.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="page-section">
          <div className="account-billing-card platform-admin-feature-card">
            <h3>Recent check-ins</h3>
            <p className="section-note">Newest QR check-ins for this gym.</p>
            {state.loading ? (
              <div className="platform-admin-empty-state">Loading recent check-ins...</div>
            ) : state.data.recent_check_ins.length === 0 ? (
              <div className="platform-admin-empty-state">No QR check-ins yet.</div>
            ) : (
              <div className="analytics-list">
                {state.data.recent_check_ins.map((item) => (
                  <div key={item.id} className="analytics-list-row">
                    <div>
                      <strong>{item.display_name || item.identifier_email}</strong>
                      <div className="section-note">{item.identifier_email} | {item.checked_in_role}</div>
                      {item.matched_session_label ? (
                        <div className="section-note">Matched to {item.matched_session_label}</div>
                      ) : null}
                    </div>
                    <div className="analytics-list-meta">
                      <span>{formatDateTime(item.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
