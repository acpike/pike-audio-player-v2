import { Component, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Simple error boundary for V1_Rewrite_1.8.28
 * Catches JavaScript errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logger.error('Error caught by boundary:', { error: error.message, stack: error.stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 'var(--spacing-xl)', 
          textAlign: 'center', 
          color: 'white',
          backgroundColor: '#1a1a1a' 
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-xl)',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}