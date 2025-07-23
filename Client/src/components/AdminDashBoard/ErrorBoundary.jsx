import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 text-center text-[#EF4444] bg-white border border-[#CBD5E1] rounded-md">
          <h3 className="text-[12px] font-semibold">Oops! Something went wrong.</h3>
          <p className="text-[11px] mt-1">We couldn’t load the requested view. Please try again or contact support.</p>
          <button
            className="mt-2 px-2 py-1 bg-[#38BDF8] text-white text-[11px] rounded-md hover:bg-[#2B9FE7] transition-colors"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload(); // Reload to reset state
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;