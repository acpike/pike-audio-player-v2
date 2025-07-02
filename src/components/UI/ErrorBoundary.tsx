import React, { Component, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorCount: number;
}

/**
 * Simple error boundary for V1_Rewrite_1.8.28
 * Catches JavaScript errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorMessage: '',
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    // Enhanced logging with component stack
    logger.error('Enhanced error boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount,
      timestamp: new Date().toISOString()
    });
    
    // Update state with error details
    this.setState({
      errorMessage: error.message || 'An unexpected error occurred',
      errorCount
    });
    
    // Auto-recovery for certain error types
    if (errorCount < 3 && this.isRecoverableError(error)) {
      setTimeout(() => {
        this.setState({ hasError: false, errorMessage: '' });
      }, 2000);
    }
  }
  
  private isRecoverableError(error: Error): boolean {
    // Define recoverable error patterns
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i
    ];
    
    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 'var(--spacing-xl)', 
          textAlign: 'center', 
          color: 'white',
          backgroundColor: 'var(--dark-gray)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Audio Player Error</h2>
          <p style={{ marginBottom: 'var(--spacing-lg)', opacity: 0.8 }}>
            {this.state.errorMessage}
          </p>
          {this.state.errorCount < 3 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-lg)', opacity: 0.6 }}>
              Attempting auto-recovery... ({this.state.errorCount}/3)
            </p>
          ) : (
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-lg)', opacity: 0.6 }}>
              Auto-recovery failed. Please refresh to try again.
            </p>
          )}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
            <button 
              onClick={() => this.setState({ hasError: false, errorMessage: '', errorCount: 0 })}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}