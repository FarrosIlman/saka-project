import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fef9f3 0%, #fef3f3 100%)',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
            }}
          >
            <AlertTriangle
              style={{
                width: '60px',
                height: '60px',
                color: '#dc2626',
                margin: '0 auto 20px',
              }}
            />
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: '#1f2937' }}>
              Oops! Ada Masalah 😢
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '20px' }}>
              Aplikasi mengalami kesalahan. Silakan coba refresh atau hubungi admin jika masalah berlanjut.
            </p>
            <details style={{ marginBottom: '30px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#0099cc', fontWeight: '600', marginBottom: '10px' }}>
                Detail Error
              </summary>
              <pre
                style={{
                  background: '#f3f4f6',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  color: '#1f2937',
                }}
              >
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={this.resetError}
              style={{
                background: 'linear-gradient(135deg, #00c8ff 0%, #0099cc 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(0, 200, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <RefreshCw style={{ width: '18px', height: '18px' }} />
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
