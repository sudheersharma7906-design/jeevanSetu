// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--slate-50, #f8fafc)'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl, 16px)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
              border: '1px solid var(--slate-200, #e2e8f0)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--slate-900, #0f172a)',
                margin: '0 0 0.5rem 0'
              }}
            >
              Something Went Wrong
            </h2>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--slate-600, #475569)',
                lineHeight: 1.5,
                margin: '0 0 1.5rem 0'
              }}
            >
              An unexpected issue occurred while displaying this section. Your data is safe and backup systems remain fully operational.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  background: '#f1f5f9',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  color: '#334155',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#0f766e' }}>
                  Technical Details
                </summary>
                <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                </p>
              </details>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  background: 'var(--primary-600, #0f766e)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  background: 'transparent',
                  color: 'var(--slate-700, #334155)',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Home size={16} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
